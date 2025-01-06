import { MachineWallet } from '../models/Machine/MachineWallet';
import stringConstants from '../common/stringConstants';
import { config } from '../config/config';
import createError from 'http-errors';
import { OutletMachine } from '../models/outlet_machine';
import { WashType } from '../models/wash_type';
import { calcPercent } from '../common/utility';
import { Machine } from '../models/Machine/Machine';
import { FormDealer } from '../models/Feedback/FormDealer';
import { MachineAgent } from '../models/Machine/MachineAgent';
import { Outlet } from '../models/outlet';

/**
 * Get pagination object
 * @param limit Number
 * @param page Number
 * @param totalCount Number
 * @returns
 */
const paginatorService = (limit: number, page: number, totalCount: number) => {
  const paginator: any = {
    currentPage: page,
    perPage: limit,
    slNo: (page - 1) * limit,
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    hasPrevPage: false,
  };
  paginator['hasNextPage'] =
    paginator.currentPage < paginator.totalPages ? true : false;
  if (paginator.totalPages > 1 && paginator.currentPage > 1) {
    paginator.hasPrevPage = true;
  }
  return paginator;
};

const isAdmin = (user: any) => {
  try {
    if (user.role !== config.userRolesObject.ADMIN) {
      throw createError(401, stringConstants.genericMessage.ONLY_ADMIN_ALLOWED);
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};

const deductAmount = async (req: any) => {
  try {
    if (req.body.Guid) {
      //Check is transaction exist
      const isTransactionExist = await MachineWallet.findOne({
        where: { transactionId: req.body.Guid },
        raw: true,
      });
      
      //If transaction not exist deduct amount from wallet
      if (!isTransactionExist) {
        const machineSubscription: any = await OutletMachine.findOne({
          where: { machineId: req.body.MachineGuid },
          raw: true,
        });

        const washType = await WashType.findOne({
          where: { Guid: req.body.WashTypeGuid },
          attributes: ['Name'],
          raw: true,
        });
        if (washType) {
          let amountToDeduct: any = {};

          if (
            machineSubscription?.pricingTerms &&
            machineSubscription.pricingTerms.length
          ) {
            for (const pricingTerm of machineSubscription.pricingTerms) {
              if (
                pricingTerm &&
                pricingTerm.type.toUpperCase() === washType.Name.toUpperCase()
              ) {
                amountToDeduct = pricingTerm;
                break;
              }
            }
          }
          if (Object.keys(amountToDeduct).length) {
            const dealerPerWashPrice = amountToDeduct.dealerPerWashPrice
              ? Number(amountToDeduct.dealerPerWashPrice)
              : 0;
            const manpowerPricePerWash = amountToDeduct.manpowerPricePerWash
              ? Number(amountToDeduct.manpowerPricePerWash)
              : 0;
            const cgstPrice = calcPercent(
              dealerPerWashPrice + manpowerPricePerWash,
              config.cgstPercentage
            );

            const sgstPrice = calcPercent(
              dealerPerWashPrice + manpowerPricePerWash,
              config.sgstPercentage
            );
            let machineWallet = await MachineWallet.findOne({
              where: { machineId: req.body.MachineGuid },
              raw: true,
              order: [['createdAt', 'DESC']],
              attributes: ['machineWalletId'],
            });
            const total = Number(
              sgstPrice + cgstPrice + manpowerPricePerWash + dealerPerWashPrice
            );

            let machineWalletBalance: any = 0;
            let machineBlueverseCreditBalance: any = 0;
            let machineTopUpBalance: any = 0;
            if (!machineWallet) {
              machineBlueverseCreditBalance = 0;
              machineWalletBalance = -total;
              machineTopUpBalance = 0;
              await MachineWallet.create({
                machineId: req.body.MachineGuid,
                transactionId: req.body.Guid,
                transactionType: config.machineWalletTransactionType.DEBITED,
                skuNumber: req.body.SkuNumber,
                walletBalance: Number(machineWalletBalance),
                blueverseCredit: Number(machineBlueverseCreditBalance),
                topUpBalance: Number(machineTopUpBalance),
                sgst: Number(sgstPrice),
                cgst: Number(cgstPrice),
                baseAmount:
                  Number(manpowerPricePerWash) + Number(dealerPerWashPrice),
                totalAmount: Number(total),
                dealerPerWashPrice: Number(dealerPerWashPrice),
                manpowerPricePerWash: Number(manpowerPricePerWash),
                washType: amountToDeduct.type,
              });
            } else {
              let sourceType = config.machineWalletSourceType.WALLET;
              let machineDetail = await Machine.findOne({
                where: { machineGuid: req.body.MachineGuid },
                attributes: [
                  'blueverseCredit',
                  'topUpBalance',
                  'walletBalance',
                ],
                raw: true,
              });
              machineBlueverseCreditBalance = Number(
                machineDetail.blueverseCredit
              );
              machineWalletBalance = Number(machineDetail.walletBalance);
              machineTopUpBalance = Number(machineDetail.topUpBalance);
              if (Number(machineDetail.walletBalance) >= total) {
                machineWalletBalance = Number(
                  Number(machineDetail.walletBalance) - total
                );
              } else if (Number(machineDetail.topUpBalance) >= total) {
                machineTopUpBalance = Number(
                  Number(machineDetail.topUpBalance) - total
                );
                sourceType = config.machineWalletSourceType.TOPUP;
              } else if (Number(machineDetail.blueverseCredit) >= total) {
                machineBlueverseCreditBalance = Number(
                  Number(machineDetail.blueverseCredit) - total
                );
                sourceType = config.machineWalletSourceType.CREDIT;
              } else {
                machineWalletBalance = Number(
                  Number(machineDetail.walletBalance) - total
                );
              }
              
              await MachineWallet.create({
                machineId: req.body.MachineGuid,
                transactionId: req.body.Guid,
                transactionType: config.machineWalletTransactionType.DEBITED,
                skuNumber: req.body.SkuNumber,
                walletBalance: Number(machineWalletBalance),
                blueverseCredit: Number(machineBlueverseCreditBalance),
                topUpBalance: Number(machineTopUpBalance),
                sgst: Number(sgstPrice),
                cgst: Number(cgstPrice),
                baseAmount:
                  Number(manpowerPricePerWash) + Number(dealerPerWashPrice),
                totalAmount: Number(total),
                sourceType: sourceType,
                dealerPerWashPrice: Number(dealerPerWashPrice),
                manpowerPricePerWash: Number(manpowerPricePerWash),
                washType: amountToDeduct.type,
              });
            }

            await Machine.update(
              {
                walletBalance: Number(machineWalletBalance),
                blueverseCredit: Number(machineBlueverseCreditBalance),
                topUpBalance: Number(machineTopUpBalance),
              },
              { where: { machineGuid: req.body.MachineGuid } }
            );

            // generate notification if machine balance less than 100000
          }
        }
      }
    }
  } catch (err) {
    return Promise.reject(err);
  }
};
const paginatorParamFormat = (limit: any, offset: any) => {
  let _limit = Number(limit);
  let _offset = Number(offset);
  if (!limit) {
    _limit = 10;
  }
  if (!offset) {
    _offset = 0;
  } else {
    _offset = (offset - 1) * limit;
  }
  return { _limit, _offset };
};

const removeMachineMappingData = async (
  machineId: string,
  outletId: string
) => {
  try {
    const machine = await Machine.findOne({
      where: { machineGuid: machineId },
      attributes: ['feedbackFormId'],
    });
    if (machine.feedbackFormId) {
      await Machine.update(
        { feedbackFormId: null },
        { where: { machineGuid: machineId } }
      );
      await MachineAgent.destroy({
        where: { machineId: machineId, formId: machine.feedbackFormId },
      });
      const outlet = await Outlet.findOne({
        where: { outletId: outletId },
        attributes: ['dealerId'],
      });
      await FormDealer.destroy({
        where: { formId: machine.feedbackFormId, dealerId: outlet.dealerId },
      });
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
export {
  paginatorService,
  isAdmin,
  paginatorParamFormat,
  deductAmount,
  removeMachineMappingData,
};
