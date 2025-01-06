import { MachineWallet } from '../models/Machine/MachineWallet';
import stringConstants from '../common/stringConstants';
import { config } from '../config/config';
import createError from 'http-errors';
import { OutletMachine } from '../models/outlet_machine';
import { WashType } from '../models/wash_type';
import { calcPercent, isNullOrUndefined, isValidGuid } from '../common/utility';
import { Machine } from '../models/Machine/Machine';
import { FormDealer } from '../models/Feedback/FormDealer';
import { MachineAgent } from '../models/Machine/MachineAgent';
import { Outlet } from '../models/outlet';
import moment from 'moment';
import { Op } from 'sequelize';
import { User } from '../models/User/user';
import { getMemoUniqueID } from '../module/paymenModule/services/payment.service';
import { MachineMemo } from '../models/Machine/MachineMemo';
import { Transactions } from '../models/transactions';
import { notificationConstant } from '../common/notificationConstants';
import { notificationService } from './notifications/notification';
import { userService } from '../module/userModule/services/user.service';
import { Form } from '../models/Feedback/form';
import { City } from '../models/city';
import { State } from '../models/state';
import { Region } from '../models/region';
import { Customer } from '../B2C/models/customer';
import { v4 as uuidv4 } from 'uuid';
import { machineService } from '../module/machineModule/services/machine.service';
import db from '../models';
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
                createdAt: req.body.AddDate,
              });
            } else {
              // Find a paid memo by date string and machine GUID
              let memo = await findOnePaidMemoByDateString(
                req.body.AddDate,
                req.body.MachineGuid
              );

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
              } else if (
                Number(machineDetail.blueverseCredit) >= total &&
                memo
                //if the current month Advance memo is paid then deduct amount from blueverse credit
              ) {
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
                createdAt: req.body.AddDate,
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

            // // generate notification if machine balance less than 100000
            // machineService.generateLowBalanceMachineNotifications(
            //   req.body.MachineGuid
            // );

            // checking the low balance of machine
            machineService.inactiveMachineOnLowBalance(req.body.MachineGuid);
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

      const machineCount = await Machine.count({
        where: {
          feedbackFormId: machine.feedbackFormId,
        },
      });

      if (machineCount == 0) {
        await Form.update(
          {
            cityId: null,
            regionId: null,
            stateId: null,
            oemId: null,
          },
          {
            where: {
              formId: machine.feedbackFormId,
            },
          }
        );
      }
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};

const isAdvanceMemoExistForThisMonth = async (machineId: string) => {
  try {
    /**
     * Check is wallet already recharge or not
     */
    const machineWallet = await MachineWallet.findOne({
      where: {
        machineId: machineId,
        sourceType:
          config.payUPaymentGatewayCredentials.productInfoObject.WALLET,
        transactionType: 'ADDED',
        createdAt: {
          [Op.gte]: moment().startOf('month').toISOString(),
          [Op.lte]: moment().endOf('month').toISOString(),
        },
      },
      attributes: ['machineWalletId'],
    });
    if (machineWallet) {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'qa'
      ) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

const advanceMemoRechargeAmount = (
  pricingTerm: any,
  minimumWashCommitment: any,
  topUpBalance: any
) => {
  const endDateOfTheMonth = moment().endOf('month');
  const currentDateOfTheMOnth = moment();
  const remainingDaysInThisMonth =
    endDateOfTheMonth.diff(currentDateOfTheMOnth, 'days') + 1;
  const perDayWash = Math.round(minimumWashCommitment / moment().daysInMonth());
  const washesToBeDone = Math.round(perDayWash * remainingDaysInThisMonth);

  let baseAmount = pricingTerm * Number(washesToBeDone);
  if (topUpBalance > 0) {
    baseAmount = Number(baseAmount) - Number(topUpBalance);
  }
  const cgst = calcPercent(baseAmount, config.cgstPercentage);
  const sgst = calcPercent(baseAmount, config.sgstPercentage);

  return {
    baseAmount: Number((pricingTerm * Number(washesToBeDone)).toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    totalAmount: Number((baseAmount + cgst + sgst).toFixed(2)),
    minimumWashCommitment: Number(washesToBeDone),
  };
};
const getMachineForAdvanceMemo = async (commencement: boolean) => {
  try {
    let commencementWhereCondition = {};
    if (commencement) {
      commencementWhereCondition = {
        // invoiceDate: moment().get('date'),
        invoiceDate: {
          [Op.between]: [
            moment().startOf('day').toISOString(),
            moment().endOf('day').toISOString(),
          ],
        },
        isCommencementDone: false,
      };
    }
    const whereCondition: any = {
      outletId: { [Op.ne]: null },
    };
    // Add machine restriction only for qa and dev environments to reduce server load

    if (
      config.serverConfig.env == 'development' ||
      config.serverConfig.env == 'qa'
    ) {
      whereCondition['machineGuid'] = {
        [Op.in]: config.machinesIdArr,
      };
    }
    return await Machine.findAll({
      attributes: [
        'machineGuid',
        'name',
        'outletId',
        'topUpBalance',
        'blueverseCredit',
        'walletBalance',
      ],
      where: whereCondition,
      include: [
        {
          model: Outlet,
          attributes: ['outletId', 'name', 'address', 'dealerId', 'gstNo'],
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
                isActive: true,
              },
            },
            {
              model: City,
              attributes: ['name'],
              include: [
                {
                  model: State,
                  attributes: ['name', 'stateGstNo', 'blueverseAddress'],
                  include: [
                    {
                      model: Region,
                      attributes: ['name'],
                    },
                  ],
                },
              ],
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
            'invoiceDate',
            'pricingTerms',
          ],
          where: commencementWhereCondition,
        },
      ],
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

const advanceMemoCreate = async (
  totalAmountToRecharge: any,
  machine: any,
  taxableAmountToRecharge: any,
  cgstToRecharge: any,
  sgstToRecharge: any,
  topupAmountAdjusted: any,
  gstPercentage: any
) => {
  try {
    // if (totalAmountToRecharge > 0) {
    //Generate memo id
    const memoId = await getMemoUniqueID(
      'AM',
      config.machineMemoTypeObject.ADVANCE_MEMO
    );

    //Create advance memo
    const newAdvanceMemo = await MachineMemo.create({
      dueDate: new Date(),
      machineId: machine.machineGuid,
      outletId: machine.outletId,
      dealerId: machine.outlet.dealerId,
      memoId: memoId,
      type: config.machineMemoTypeObject.ADVANCE_MEMO,
      month: String(moment(new Date()).get('month') + 1),
      status:
        Number(totalAmountToRecharge) > 0
          ? config.machineMemoStatusObject.PENDING
          : config.machineMemoStatusObject.PAID,
      minimumWashCommitment: Number(
        machine.machineSubscriptionSetting.minimumWashCommitment
      ),
      taxableAmount: taxableAmountToRecharge,
      totalAmount: totalAmountToRecharge,
      cgst: cgstToRecharge,
      sgst: sgstToRecharge,
      topupAmountAdjusted: topupAmountAdjusted,
      pricingTerms: machine.machineSubscriptionSetting.pricingTerms,
      gstPercentage: gstPercentage,
      memoDetail: getMemoDetailForJsonb(machine),
    });

    if (newAdvanceMemo) {
      // Admin advance memo notification
      const {
        type: adminNotiType,
        msg: adminNotiMsg,
        url: adminNotiUrl,
      } = notificationConstant.adminNotificationObject.ADVANCE_MEMO_GENERATE;

      const notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: newAdvanceMemo?.machineMemoId,
        },
        type: adminNotiType,
        message: adminNotiMsg,
        link: `${adminNotiUrl}/${newAdvanceMemo?.machineMemoId}`,
      };
      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // Dealer advance memo notification'
      const { type: dealerNotiType, url: dealerNotiUrl } =
        notificationConstant.dealerNotificationObject
          .ADVANCE_MEMO_GENERATE_BY_ADMIN;
      const notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: newAdvanceMemo?.machineMemoId,
        },
        userId: newAdvanceMemo?.dealerId,
        type: dealerNotiType,
        link: `${dealerNotiUrl}/${newAdvanceMemo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
    }
    // }
  } catch (err) {
    return Promise.reject(err);
  }
};

const getDealerAllTransactions = async (
  userId: any,
  whereCondition: any,
  machineIds: any,
  dealerIds: any,
  role: any, //check user role,
  oemIds: any //for oem filter
) => {
  try {
    let userWhereCondition = {};
    if (userId) {
      userWhereCondition = { userId: userId };
    }
    let machineWhereCondition = {};
    if (machineIds) {
      let arr = [];
      for (const id of machineIds.split(',')) {
        if (isValidGuid(id)) {
          arr.push(id);
        }
      }
      if (arr.length) {
        machineWhereCondition = {
          machineGuid: { [Op.in]: arr },
        };
      }
    }

    if (dealerIds && dealerIds.length) {
      userWhereCondition = {
        userId: { [Op.in]: dealerIds },
        isActive: true,
        deletedAt: null,
      };
    }
    if (oemIds && oemIds.length) {
      userWhereCondition = {
        ...userWhereCondition,
        oemId: {
          [Op.in]: oemIds,
        },
      };
    }
    if (!isNullOrUndefined(role) && role != config.userRolesObject.ADMIN) {
      whereCondition['IsAssigned'] = true; //If userRole is not admin then only show active washes(washes when machine assigned to dealer)
    }
    return await Transactions.findAll({
      where: whereCondition,
      attributes: [
        'Guid',
        'AddDate',
        'MachineGuid',
        'WashTypeGuid',
        'WaterUsed',
        'WaterWastage',
        'WaterPrice',
        'ElectricityUsed',
        'WashTime',
        'TSSValue',
        'TDSValue',
        'PHValue',
        'OilAndGreaseValue',
        'CODValue',
        'updatedAt',
      ],
      include: [
        {
          model: Machine,
          attributes: ['machineGuid'],
          where: machineWhereCondition,
          required: true,
          include: [
            {
              model: Outlet,
              attributes: [],
              required:
                Object.keys(userWhereCondition).length > 0 ? true : false,
              include: [
                {
                  model: User,
                  attributes: [],
                  where: userWhereCondition,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: WashType,
          attributes: ['Name', 'Guid'],
          where: { Name: { [Op.in]: config.washTypeArr } },
        },
      ],
      order: [['AddDate', 'DESC']],
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

const filterTransactionsOnWashType = (transactions: any) => {
  try {
    const goldTransactions = [];
    const platinumTransactions = [];
    const silverTransactions = [];
    for (const transaction of transactions) {
      if (transaction.washType.Name === config.washType.GOLD) {
        goldTransactions.push(transaction);
      }
      if (transaction.washType.Name === config.washType.SILVER) {
        silverTransactions.push(transaction);
      }
      if (transaction.washType.Name === config.washType.PLATINUM) {
        platinumTransactions.push(transaction);
      }
    }
    return {
      GOLD: goldTransactions,
      PLATINUM: platinumTransactions,
      SILVER: silverTransactions,
    };
  } catch (err) {
    return Promise.reject(err);
  }
};

const filterTransactionsDayWise = (
  fromDate: any,
  toDate: any,
  transactions: any
) => {
  const transactionsDayWise = dayWiseFilter(fromDate, toDate);
  return transactionsFilterDayWise(transactions, transactionsDayWise);
};
const filterTransactionsHourly = (
  fromDate: any,
  toDate: any,
  transactions: any
) => {
  const transactionsHourWise = hourlyFilter(fromDate, toDate);
  return transactionFilterHourWise(transactions, transactionsHourWise);
};
const hourlyFilter = (fromDate: any, toDate: any) => {
  var date1 = moment(fromDate).startOf('day');
  var date2 = moment(toDate).endOf('day');
  const hourDiff = date2.diff(date1, 'hour');
  let transactionsHourWise: any = {};
  let date = date1;
  for (let i = 0; i <= hourDiff; i++) {
    transactionsHourWise[`${moment(date).startOf('hour').toISOString()}`] = 0;
    date = moment(date).add(1, 'hour');
  }
  return transactionsHourWise;
};

const dayWiseFilter = (fromDate: any, toDate: any) => {
  var date1 = moment(fromDate).startOf('day');
  var date2 = moment(toDate).endOf('day');
  const daysDifference = date2.diff(date1, 'days');
  let transactionsDayWise: any = {};
  let date = date1;

  for (let i = 0; i <= daysDifference; i++) {
    transactionsDayWise[`${moment(date).startOf('day').toISOString()}`] = 0;
    date = moment(date).add(1, 'day');
  }
  return transactionsDayWise;
};
const electricityDayConsumedFilter = (transactions: any, days: any) => {
  let transactionsDayWise = days;
  for (const transaction of transactions) {
    if (
      transactionsDayWise[
        `${moment(transaction.dataValues.AddDate).startOf('day').toISOString()}`
      ] !== undefined
    ) {
      transactionsDayWise[
        `${moment(transaction.dataValues.AddDate).startOf('day').toISOString()}`
      ].push(Number(transaction.dataValues.ElectricityUsed));
    }
  }
  return transactionsDayWise;
};
const electricityHourConsumedFilter = (transactions: any, hours: any) => {
  let transactionsHourWise = hours;
  let day = transactions[0]?.dataValues?.AddDate;
  if (isNullOrUndefined(day)) {
    day = moment();
  }
  let expectStartTime = moment(day).startOf('day').hour(8).toISOString();
  let expectEndTime = moment(day).startOf('day').hour(20).toISOString();
  for (const transaction of transactions) {
    if (
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ] !== undefined
    ) {
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ].push(Number(transaction.dataValues.ElectricityUsed));
    }
  }

  const updatedTransactionsHourWise: any = {};
  let firstValueOccur = false;
  for (let [key, value] of Object.entries(transactionsHourWise)) {
    // if value is not zero then add
    // if value is zero then check if any previous non zero (firstValueOccur) value already come
    // if firstValue already occur and this value exist in time zon(8am-8pm) then add otherwise remove
    // if no first value occur and current value dose not exist in time zone then remove

    if (
      (Array.isArray(value) && value.length != 0) ||
      (firstValueOccur && !moment(key).isAfter(expectEndTime))
    ) {
      firstValueOccur = true;
      updatedTransactionsHourWise[key] = value;
    }
  }
  return updatedTransactionsHourWise;
};

const transactionsFilterDayWise = (
  transactions: any,
  transactionsDate: any
) => {
  let transactionsDayWise = transactionsDate;
  for (const transaction of transactions) {
    if (
      transactionsDayWise[
        `${moment(transaction.dataValues.AddDate).startOf('day').toISOString()}`
      ] !== undefined
    ) {
      transactionsDayWise[
        `${moment(transaction.dataValues.AddDate).startOf('day').toISOString()}`
      ] += 1;
    }
  }
  return transactionsDayWise;
};

const transactionFilterHourWise = (transactions: any, transactionHour: any) => {
  let transactionsHourWise = transactionHour;
  let day = transactions[0]?.dataValues?.AddDate;
  for (const transaction of transactions) {
    if (
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ] !== undefined
    ) {
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ] += 1;
    }
  }

  // return transactionsHourWise;
  let expectEndTime = moment(day).startOf('day').hour(20).toISOString();
  const updatedTransactionsHourWise: any = {};
  let firstValueOccur = false;
  for (let [key, value] of Object.entries(transactionsHourWise)) {
    // if value is not zero then add
    // if value is zero then check if any previous non zero (firstValueOccur) value already come
    // if firstValue already occur and this value exist in time zon(8am-8pm) then add otherwise remove
    // if no first value occur and current value dose not exist in time zone then remove

    if (
      (!isNullOrUndefined(value) && value != 0) ||
      (firstValueOccur && !moment(key).isAfter(expectEndTime))
    ) {
      firstValueOccur = true;
      updatedTransactionsHourWise[key] = value;
    }
  }
  return updatedTransactionsHourWise;
};

const machineRunTimeHourly = (transactionHour: any, transactions: any) => {
  let transactionsHourWise = transactionHour;
  for (const transaction of transactions) {
    if (
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ] !== undefined
    ) {
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ] += Number(transaction.WashTime);
    }
  }
  return transactionsHourWise;
};
const machineRunTimeDayWise = (transactions: any, transactionsDate: any) => {
  let transactionsDayWise = transactionsDate;
  let prevDate = '2001-08-02 18:30:00+00';
  let lastRunTimeDate = '2001-08-02 18:30:00+00';
  for (const transaction of transactions) {
    if (
      transactionsDayWise[
        `${moment(transaction.RunTimeDate).startOf('day').toISOString()}`
      ] !== undefined
    ) {
      // transactionsDayWise[
      //   `${moment(transaction.RunTimeDate).startOf('day').toISOString()}`
      // ] += Number(transaction.MachineRunTime);
      if (areDateEqual(lastRunTimeDate, transaction.RunTimeDate)) {
        if (isRunTimeDataUpdate(prevDate, transaction.createdAt)) {
          transactionsDayWise[
            `${moment(transaction.RunTimeDate).startOf('day').toISOString()}`
          ] = Number(transaction.MachineRunTime);
        }
      } else {
        transactionsDayWise[
          `${moment(transaction.RunTimeDate).startOf('day').toISOString()}`
        ] = Number(transaction.MachineRunTime);
      }

      prevDate = transaction.createdAt;
      lastRunTimeDate = transaction.RunTimeDate;
    }
  }
  return transactionsDayWise;
};

const machineWaterQualityHourly = (
  transactionHour: any,
  transactions: any,
  type: any
) => {
  let transactionsHourWise = transactionHour;
  let day = transactions[0]?.dataValues?.AddDate;
  let expectEndTime = moment(day).startOf('day').hour(20).toISOString();
  for (const transaction of transactions) {
    if (
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ] !== undefined
    ) {
      transactionsHourWise[
        `${moment(transaction.dataValues.AddDate)
          .startOf('hour')
          .toISOString()}`
      ].push(Number(transaction[type]));
    }
  }
  // return transactionsHourWise;
  const updatedTransactionsHourWise: any = {};
  let firstValueOccur = false;
  for (let [key, value] of Object.entries(transactionsHourWise)) {
    // if value is not zero then add
    // if value is zero then check if any previous non zero (firstValueOccur) value already come
    // if firstValue already occur and this value exist in time zon(8am-8pm) then add otherwise remove
    // if no first value occur and current value dose not exist in time zone then remove

    if (
      (Array.isArray(value) && value.length != 0) ||
      (firstValueOccur && !moment(key).isAfter(expectEndTime))
    ) {
      firstValueOccur = true;
      updatedTransactionsHourWise[key] = value;
    }
  }
  return updatedTransactionsHourWise;
};
const machineWaterQualityDayWise = (
  transactions: any,
  transactionsDate: any,
  type: any
) => {
  let transactionsDayWise = transactionsDate;
  for (const transaction of transactions) {
    if (
      transactionsDayWise[
        `${moment(transaction.dataValues.AddDate).startOf('day').toISOString()}`
      ] !== undefined
    ) {
      transactionsDayWise[
        `${moment(transaction.dataValues.AddDate).startOf('day').toISOString()}`
      ].push(Number(transaction[type]));
    }
  }
  return transactionsDayWise;
};

const dealerCreationDayWise = (dealerHour: any, dealers: any) => {
  let dealersHourWise = dealerHour;
  for (const dealer of dealers) {
    if (
      dealersHourWise[
        `${moment(dealer.createdAt).startOf('day').toISOString()}`
      ] !== undefined
    ) {
      dealersHourWise[
        `${moment(dealer.createdAt).startOf('day').toISOString()}`
      ] += 1;
    }
  }
  return dealersHourWise;
};
const dealerCreationHourly = (dealerDates: any, dealers: any) => {
  let dealersDayWise = dealerDates;
  let day = dealers[0]?.dataValues?.createdAt;
  for (const dealer of dealers) {
    if (
      dealersDayWise[
        `${moment(dealer.createdAt).startOf('hour').toISOString()}`
      ] !== undefined
    ) {
      dealersDayWise[
        `${moment(dealer.createdAt).startOf('hour').toISOString()}`
      ] += 1;
    }
  }
  // return dealersDayWise;
  let expectEndTime = moment(day).startOf('day').hour(20).toISOString();
  const updatedDealersDayWise: any = {};
  let firstValueOccur = false;
  for (let [key, value] of Object.entries(dealersDayWise)) {
    // if value is not zero then add
    // if value is zero then check if any previous non zero (firstValueOccur) value already come
    // if firstValue already occur and this value exist in time zon(8am-8pm) then add otherwise remove
    // if no first value occur and current value dose not exist in time zone then remove

    if (
      (!isNullOrUndefined(value) && value != 0) ||
      (firstValueOccur && !moment(key).isAfter(expectEndTime))
    ) {
      firstValueOccur = true;
      updatedDealersDayWise[key] = value;
    }
  }
  return updatedDealersDayWise;
};

const checkUserPermission = async (userId: string, permissionName: string) => {
  try {
    const userDetails = await userService.getUserWithPermission(userId);
    const subRole = userDetails.subRole;
    let result = false;
    if (!!subRole && subRole.permission) {
      for (const permissionBody of subRole.permission) {
        if (
          permissionBody.module.name == permissionName &&
          permissionBody.module.isActive
        ) {
          const viewPermission = permissionBody.permissionObj.viewPermission;
          if (viewPermission === true) {
            result = true;
            break;
          }
        }
      }
    }
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
};

const areDateEqual = (date1: any, date2: any) => {
  const momentObj1 = moment(date1);
  const momentObj2 = moment(date2);

  // Compare date, month, and year
  return (
    momentObj1.date() === momentObj2.date() &&
    momentObj1.month() === momentObj2.month() &&
    momentObj1.year() === momentObj2.year()
  );
};
const isRunTimeDataUpdate = (prevDate: any, newDateTime: any) => {
  const momentObj1 = moment(prevDate);
  const momentObj2 = moment(newDateTime);
  return momentObj2.isAfter(momentObj1, 'second');
};

const getMemoDetailForJsonb = (machine: any) => {
  return {
    machineName: machine.name,
    outlet: {
      name: machine?.outlet?.name,
      address: machine?.outlet?.address,
      gstNo: machine?.outlet?.gstNo,
      dealerName: machine?.outlet?.dealer?.username,
      cityName: machine?.outlet?.city?.name,
      stateName: machine?.outlet?.city?.state?.name,
      stateGstNo: machine?.outlet?.city?.state?.stateGstNo,
      stateBlueverseAdd: machine?.outlet?.city?.state?.blueverseAddress,
      regionName: machine?.outlet?.city?.state?.region?.name,
    },
  };
};

const getCancellationFeePercentage = (elapsedMinutes: any) => {
  for (const fee of config.cancellation.feeStructure) {
    if (elapsedMinutes <= fee.maxMinutes) {
      return fee.feePercentage;
    }
  }
  return 0; // Default to 0% fee if no match (though this should not occur with the given config)
};

const generateUniqueReferralCode = async () => {
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = uuidv4().slice(0, 8);
    const existingUser = await Customer.findOne({
      where: { userReferralCode: referralCode },
    });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return referralCode;
};
// Function to find a single memo based on the provided date
async function findOnePaidMemoByDateString(dateString: string, machineId: any) {
  const date = new Date(dateString);
  const targetMonth = date.getUTCMonth() + 1; // getUTCMonth() is zero-based, so we add 1
  const targetYear = date.getUTCFullYear();

  const memo = await MachineMemo.findOne({
    where: {
      status: 'PAID',
      type: 'ADVANCE_MEMO',
      machineId: machineId,
      [Op.and]: [
        db.sequelize.where(
          db.sequelize.fn(
            'EXTRACT',
            db.sequelize.literal('MONTH FROM "createdAt"')
          ),
          targetMonth
        ),
        db.sequelize.where(
          db.sequelize.fn(
            'EXTRACT',
            db.sequelize.literal('YEAR FROM "createdAt"')
          ),
          targetYear
        ),
      ],
    },
    order: [[db.sequelize.col('createdAt'), 'DESC']],
  });

  return memo;
}

export {
  paginatorService,
  isAdmin,
  paginatorParamFormat,
  deductAmount,
  removeMachineMappingData,
  isAdvanceMemoExistForThisMonth,
  advanceMemoRechargeAmount,
  getMachineForAdvanceMemo,
  advanceMemoCreate,
  getDealerAllTransactions,
  filterTransactionsOnWashType,
  filterTransactionsDayWise,
  filterTransactionsHourly,
  hourlyFilter,
  dayWiseFilter,
  electricityDayConsumedFilter,
  electricityHourConsumedFilter,
  machineRunTimeHourly,
  machineRunTimeDayWise,
  machineWaterQualityDayWise,
  machineWaterQualityHourly,
  dealerCreationDayWise,
  dealerCreationHourly,
  checkUserPermission,
  getMemoDetailForJsonb,
  getCancellationFeePercentage,
  generateUniqueReferralCode,
};
