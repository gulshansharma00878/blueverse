import { Outlet } from '../../../models/outlet';
import { config } from '../../../config/config';
import { User } from '../../../models/User/user';
import { logger } from '../../logger/logger';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { OutletMachine } from '../../../models/outlet_machine';
import { Machine } from '../../../models/Machine/Machine';
import { getMemoUniqueID } from '../../../module/paymenModule/services/payment.service';
import moment from 'moment';
import { Op } from 'sequelize';
import { MachineWallet } from '../../../models/Machine/MachineWallet';

class MemoService {
  /**
   * This function create for generate advance memo of every month first date
   * @returns
   */
  generateAdvanceMemo = async () => {
    try {
      //Get machines list
      const machines = await Machine.findAll({
        attributes: ['machineGuid', 'outletId', 'topUpBalance'],
        where: { outletId: { [Op.ne]: null } },
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'name', 'address', 'dealerId'],
            where: { status: 1 },
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
                where: {
                  deletedAt: null,
                  role: config.userRolesObject.DEALER,
                  parentUserId: null,
                  subRoleId: null,
                },
              },
            ],
          },
          {
            model: OutletMachine,
            attributes: [
              'taxableAmount',
              'total',
              'outletMachineId',
              'minimumWashCommitment',
              'cgst',
              'sgst',
              'pricingTerms',
            ],
          },
        ],
      });

      //Iterate over machines list
      for (const machine of machines) {
        /**
         * Check if topup balance is greater than 0 than move topup balance to the wallet balance
         */
        if (machine.topUpBalance > 0) {
          //Update machine wallet balance and topUp balance
          await Machine.update(
            {
              topUpBalance: machine.topUpBalance,
              blueverseCredit: machine.blueverseCredit,
              walletBalance: machine.walletBalance + machine.topUpBalance,
            },
            { where: { machineGuid: machine.machineGuid } }
          );
          //Update machine wallet balance and topUp balance
          await MachineWallet.create({
            machineId: machine.machineGuid,
            transactionType: config.machineWalletTransactionType.ADDED,
            walletBalance: machine.walletBalance + machine.topUpBalance,
            blueverseCredit: machine.blueverseCredit,
            topUpBalance: machine.topUpBalance,
            description:
              'Amount add in wallet from topup balance start of the month while creating a advance memo',
            sourceType: config.machineWalletSourceType.WALLET,
          });
        }
        //Generate memo id
        const memoId = await getMemoUniqueID(
          'AM',
          config.machineMemoTypeObject.ADVANCE_MEMO
        );
        //Create advance memo
        await MachineMemo.create({
          dueDate: new Date(),
          machineId: machine.machineGuid,
          outletId: machine.outletId,
          dealerId: machine.outlet.dealerId,
          memoId: memoId,
          type: config.machineMemoTypeObject.ADVANCE_MEMO,
          month: String(moment(new Date()).get('month') + 1),
          status: config.machineMemoStatusObject.PENDING,
          minimumWashCommitment:
            machine.machineSubscriptionSetting.minimumWashCommitment,
          taxableAmount: machine.machineSubscriptionSetting.taxableAmount,
          totalAmount: machine.machineSubscriptionSetting.total,
          cgst: machine.machineSubscriptionSetting.cgst,
          sgst: machine.machineSubscriptionSetting.sgst,
          pricingTerms: machine.machineSubscriptionSetting.pricingTerms,
        });
      }
      return;
    } catch (err) {
      logger.error(
        'Error in class MemoService generateAdvanceMemo function',
        err
      );
    }
  };
  /**
   * This function create for generate tax invoice on every month last date
   */
  generateTaxInvoice = async () => {
    try {
      //Get machines list
      const machines = await Machine.findAll({
        attributes: ['machineGuid', 'outletId'],
        where: { outletId: { [Op.ne]: null }, isAssigned: true },
        include: [
          {
            model: MachineWallet,
            attributes: [
              'baseAmount',
              'cgst',
              'sgst',
              'totalAmount',
              'manpowerPricePerWash',
              'dealerPerWashPrice',
              'washType',
              'transactionId',
              'sourceType',
            ],
            where: {
              createdAt: {
                [Op.gte]: moment().startOf('month').toISOString(),
                [Op.lte]: moment().endOf('month').toISOString(),
              },
              transactionType: config.machineWalletTransactionType.DEBITED,
            },
          },
          { model: Outlet, attributes: ['outletId', 'dealerId'] },
          {
            model: OutletMachine,
            attributes: ['taxableAmount', 'total', 'outletMachineId'],
          },
        ],
      });
      //Iterate over machines list
      for (let machine of machines) {
        machine = machine.dataValues;
        const washTypeMap = new Map();
        for (let walletTransaction of machine.machineWallet) {
          walletTransaction = walletTransaction.dataValues;
          //Create key for maping
          let key =
            walletTransaction.washType +
            '' +
            walletTransaction.manpowerPricePerWash +
            '' +
            walletTransaction.dealerPerWashPrice;
          //Check is washtype exist in map or not
          if (washTypeMap.has(key)) {
            //Get key
            let value = washTypeMap.get(key);
            //Declare value object
            let _value = {
              washType: walletTransaction.washType,
              manpowerPricePerWash: walletTransaction.manpowerPricePerWash,
              dealerPerWashPrice: walletTransaction.dealerPerWashPrice,
              cgst: walletTransaction.cgst,
              sgst: walletTransaction.sgst,
              baseAmount: walletTransaction.baseAmount,
              totalAmount:
                Number(value.totalAmount) +
                Number(walletTransaction.totalAmount),
              count: value.count + 1,
            };

            //Set again value with updation
            washTypeMap.set(key, _value);
          } else {
            //Set wash type
            washTypeMap.set(key, {
              washType: walletTransaction.washType,
              manpowerPricePerWash: walletTransaction.manpowerPricePerWash,
              dealerPerWashPrice: walletTransaction.dealerPerWashPrice,
              cgst: walletTransaction.cgst,
              sgst: walletTransaction.sgst,
              baseAmount: walletTransaction.baseAmount,
              totalAmount: Number(walletTransaction.totalAmount),
              count: 1,
            });
          }
        }
        //Get memo unique id
        const memoId = await getMemoUniqueID(
          'TI',
          config.machineMemoTypeObject.TAX_INVOICE
        );
        let invoiceData: any = [];

        washTypeMap.forEach((value, key) => {
          invoiceData.push({ value, key });
        });
        //Create machine memo invoice
        await MachineMemo.create({
          outletId: machine.outletId,
          machineId: machine.machineGuid,
          dealerId: machine.outlet.dealerId,
          memoId: memoId,
          paidOn: new Date(),
          month: String(moment(new Date()).get('month') + 1),
          type: config.machineMemoTypeObject.TAX_INVOICE,
          invoiceData: invoiceData,
          status: config.machineMemoStatusObject.PAID,
        });
      }
    } catch (err) {
      logger.error(
        'Error in class MemoService generateTaxInvoice function',
        err
      );
    }
  };
  /**
   * This function create for generate blueverse credit memo of every month for move wallet amount to the blueverse credit
   */
  generateBlueverseCreditMemo = async () => {
    try {
      //Get machines list
      const machines = await Machine.findAll({
        attributes: ['machineGuid', 'outletId'],
        where: {
          outletId: { [Op.ne]: null },
          isAssigned: true,
          walletBalance: { [Op.gt]: 0 },
        },
        include: [
          { model: Outlet, attributes: ['outletId', 'dealerId'] },
          {
            model: OutletMachine,
            attributes: [
              'taxableAmount',
              'total',
              'outletMachineId',
              'minimumWashCommitment',
              'pricingTerms',
              'cgst',
              'sgst',
            ],
          },
        ],
      });
      //Iterate over machines list
      for (const machine of machines) {
        //Update machine balance
        await Machine.update(
          {
            topUpBalance: machine.topUpBalance,
            blueverseCredit: machine.blueverseCredit + machine.walletBalance,
            walletBalance: 0,
          },
          { where: { machineGuid: machine.machineGuid } }
        );
        //Create machine wallet entry for blueverse credit memo
        await MachineWallet.create({
          machineId: machine.machineGuid,
          transactionType: config.machineWalletTransactionType.ADDED,
          topUpBalance: machine.topUpBalance,
          blueverseCredit: machine.blueverseCredit + machine.walletBalance,
          walletBalance: 0,
          description:
            'Wallet Balance added in blueverse credit in the end of the month',
          sourceType: config.machineWalletSourceType.CREDIT,
        });

        //Create memo id
        const memoId = await getMemoUniqueID(
          'BC',
          config.machineMemoTypeObject.BLUEVERSE_CREDIT
        );
        //Create machine memo id
        await MachineMemo.create({
          machineId: machine.machineGuid,
          paidOn: new Date(),
          outletId: machine.outletId,
          dealerId: machine.outlet.dealerId,
          memoId: memoId,
          type: config.machineMemoTypeObject.BLUEVERSE_CREDIT,
          month: String(moment(new Date()).get('month') + 1),
          status: config.machineMemoStatusObject.PAID,
          minimumWashCommitment:
            machine.machineSubscriptionSetting.minimumWashCommitment,
          pricingTerms: machine.machineSubscriptionSetting.pricingTerms,
          taxableAmount: machine.machineSubscriptionSetting.taxableAmount,
          totalAmount: machine.machineSubscriptionSetting.total,
          cgst: machine.machineSubscriptionSetting.cgst,
          sgst: machine.machineSubscriptionSetting.sgst,
        });
      }
    } catch (err) {
      logger.error(
        'Error in class MemoService generateBlueverseCreditMemo function',
        err
      );
    }
  };
}
const memoService = new MemoService();
export { memoService };
