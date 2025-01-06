import { config } from '../../../config/config';
import { Request } from 'ts-express-decorators';

import { Op } from 'sequelize';
import moment from 'moment';
import { validate as isValidUUID } from 'uuid';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { User } from '../../../models/User/user';
import { OEM } from '../../../models/oem';
import { OutletMachine } from '../../../models/outlet_machine';
import { Machine } from '../../../models/Machine/Machine';
import { PaymentTransaction } from '../../../models/payment_transactions';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { Outlet } from '../../../models/outlet';
import { Transactions } from '../../../models/transactions';
import { WashType } from '../../../models/wash_type';
import db from '../../../models/index';

import {
  getMonthName,
  toTitleCase,
  numberToWords,
  getMonthStartDate,
  getMonthEndDate,
  getYear,
  isNullOrUndefined,
  getDateFromFullDate,
} from '../../../common/utility';
import { required } from 'joi';

class BillingAndAccountingService {
  async getBillingAccountListQueryFormatter(req: Request, res: any) {
    try {
      const {
        fromDate,
        toDate,
        machineIds,
        search,
        statuses,
        type,
        dealerIds,
        month,
        sort,
        cityIds,
        stateIds,
        regionIds,
        oemIds,
        outletIds,
      }: any = req.query;
      const whereCondition: any = {};
      const outletWhereCondition: any = {};
      let _type = type;
      let _dealerIds = dealerIds;
      if (res.user.role === config.userRolesObject.DEALER) {
        if (res.user.parentUserId && res.user.subRoleId) {
          _dealerIds = res.user.parentUserId;
        } else {
          _dealerIds = res.user.userId;
        }
      }
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['createdAt'] = {
            [Op.between]: [
              moment(fromDate).startOf('day').toISOString(),
              moment(toDate).endOf('day').toISOString(),
            ],
          };
        }
      }
      if (month) {
        whereCondition['month'] = month;
      }
      if (machineIds) {
        let arr = [];
        for (const id of machineIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }
        if (arr.length) whereCondition['machineId'] = { [Op.in]: arr };
      }

      if (statuses) {
        let arr = [];
        for (const status of statuses.split(',')) {
          if (config.machineMemoStatusArr.includes(status)) {
            arr.push(status);
          }
        }
        if (arr.length) whereCondition['status'] = { [Op.in]: arr };
      }
      if (_type) {
        if (config.machineMemoTypeArr.includes(_type)) {
          _type = _type;
        } else {
          _type = config.machineMemoTypeObject.ADVANCE_MEMO;
        }
      } else {
        _type = config.machineMemoTypeObject.ADVANCE_MEMO;
      }
      whereCondition['type'] = _type;

      if (_dealerIds) {
        let arr = [];
        for (const id of _dealerIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }

        if (arr.length) whereCondition['dealerId'] = { [Op.in]: arr };
      }
      let _order: any = [['createdAt', 'DESC']];
      if (sort) {
        _order = [['createdAt', sort]];
      }
      if (search) {
        let searchCondition: any = [
          { memoId: { [Op.iLike]: `%${search}%` } },
          { '$outlet.name$': { [Op.iLike]: `%${search}%` } },
        ];
        if (res.user.role != config.userRolesObject.DEALER) {
          searchCondition.push({
            '$outlet.dealer.username$': { [Op.iLike]: `%${search}%` },
          });
        }
        whereCondition[Op.or] = searchCondition;
      }
      let adminIncludeTables: any = [];
      if (res.user.role === config.userRolesObject.ADMIN) {
        const oemIdArr = [];
        const cityIdArr = [];
        const regionIdArr = [];
        const stateIdsArr = [];
        const oemIdsWhereCondition: any = {};
        const cityIdWhereCondition: any = {};
        const stateIdWhereCondition: any = {};
        const regionIdWhereCondition: any = {};

        if (oemIds) {
          for (const oemId of oemIds.split(',')) {
            if (isValidUUID(oemId)) {
              oemIdArr.push(oemId);
            }
          }
          if (oemIdArr.length) {
            oemIdsWhereCondition['oemId'] = { [Op.in]: oemIdArr };
          }
        }
        if (stateIds) {
          for (const stateId of stateIds.split(',')) {
            if (isValidUUID(stateId)) {
              stateIdsArr.push(stateId);
            }
          }
          if (stateIdsArr.length) {
            stateIdWhereCondition['stateId'] = { [Op.in]: stateIdsArr };
          }
        }
        if (cityIds) {
          for (const cityId of cityIds.split(',')) {
            if (isValidUUID(cityId)) {
              cityIdArr.push(cityId);
            }
          }

          if (cityIdArr.length) {
            cityIdWhereCondition['cityId'] = { [Op.in]: cityIdArr };
          }
        }

        if (regionIds) {
          for (const regionId of regionIds.split(',')) {
            if (isValidUUID(regionId)) {
              regionIdArr.push(regionId);
            }
          }
          if (regionIdArr.length) {
            regionIdWhereCondition['regionId'] = { [Op.in]: regionIdArr };
          }
        }

        adminIncludeTables = [
          {
            model: City,
            attributes: ['name'],
            where: cityIdWhereCondition,
            include: [
              {
                model: State,
                attributes: ['name'],
                where: stateIdWhereCondition,
                include: [
                  {
                    model: Region,
                    attributes: ['name'],
                    where: regionIdWhereCondition,
                  },
                ],
              },
            ],
          },
          {
            model: User,
            attributes: ['username'],
            include: [
              {
                model: OEM,
                attributes: ['name'],
                where: oemIdsWhereCondition,
                required: oemIdsWhereCondition ? true : false,
              },
            ],
          },
        ];
      }
      if (outletIds) {
        let arr = [];
        for (const id of outletIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }

        if (arr.length) whereCondition['outletId'] = { [Op.in]: arr };
      }
      return {
        whereCondition,
        _order,
        outletWhereCondition,
        adminIncludeTables,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getBillingAndAccountingDetails(memoId: string) {
    try {
      let machineMemoId = memoId;
      const memo: any = await MachineMemo.findOne({
        where: { machineMemoId: machineMemoId },
        include: [
          {
            model: Outlet,
            attributes: ['name', 'outletId', 'address', 'gstNo'],
            include: [
              {
                model: City,
                attributes: ['name'],
                include: [
                  {
                    model: State,
                    // attributes: ['name', 'stateGstNo', 'blueverseAddress'],
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
            model: Machine,
            attributes: ['name', 'machineGuid'],
            include: [
              {
                model: OutletMachine,
                attributes: ['isCommencementDone', 'invoiceDate'],
              },
            ],
          },
          {
            model: User,
            attributes: ['username'],
          },
        ],
      });
      if (memo.type === config.machineMemoTypeObject.ADVANCE_MEMO) {
        const washCount =
          billingAndAccountingService.getWashesForCommencmentMemo(memo);
        if (washCount > 0) {
          // update wash count for commencement memo
          memo.minimumWashCommitment = washCount;
          const { newTaxableAmount, newCgst, newSgst, updatedTotalAmount } =
            billingAndAccountingService.getCommencmentMemoAmount(
              memo,
              washCount
            );
          // update amount for commencement memo
          memo['taxableAmount'] = newTaxableAmount;
          memo['cgst'] = newCgst;
          memo['sgst'] = newSgst;
          memo['totalAmount'] = updatedTotalAmount;
        }
      }
      if (memo.type === config.machineMemoTypeObject.BLUEVERSE_CREDIT) {
        const transactions = await Transactions.count({
          where: {
            MachineGuid: memo.dataValues.machine.machineGuid,
            AddDate: {
              [Op.gte]: moment(memo.dataValues.paidOn)
                .startOf('month')
                .toISOString(),
              [Op.lte]: moment(memo.dataValues.paidOn)
                .endOf('month')
                .toISOString(),
            },
          },
          include: [
            {
              model: WashType,
              attributes: ['Name'],
              where: { Name: { [Op.in]: config.washTypeArr } },
            },
          ],
        });
        memo.dataValues['washesDone'] = transactions;
      }

      if (memo.type === config.machineMemoTypeObject.TAX_INVOICE) {
        const transactionIdAdvanceMemo = await MachineMemo.findOne({
          where: {
            type: config.machineMemoTypeObject.ADVANCE_MEMO,
            machineId: memo.dataValues.machine.machineGuid,
            paidOn: {
              [Op.gte]: moment(memo.dataValues.paidOn)
                .startOf('month')
                .toISOString(),
              [Op.lte]: moment(memo.dataValues.paidOn)
                .endOf('month')
                .toISOString(),
            },
          },
          attributes: ['memoId', 'machineMemoId'],
        });

        if (transactionIdAdvanceMemo) {
          machineMemoId = transactionIdAdvanceMemo.dataValues.machineMemoId;
        }
        const transactions = await Transactions.count({
          where: {
            MachineGuid: memo.dataValues.machine.machineGuid,
            AddDate: {
              [Op.gte]: moment(memo.dataValues.paidOn)
                .startOf('month')
                .toISOString(),
              [Op.lte]: moment(memo.dataValues.paidOn)
                .endOf('month')
                .toISOString(),
            },
          },
          include: [
            {
              model: WashType,
              attributes: ['Name'],
              where: { Name: { [Op.in]: config.washTypeArr } },
            },
          ],
        });
        memo.dataValues['washesDone'] = transactions;
      }
      const paymentTransaction: any = await PaymentTransaction.findOne({
        where: { machineMemoId: machineMemoId },
        raw: true,
        order: [['createdAt', 'DESC']],
        attributes: [
          'paymentTransactionId',
          'status',
          'transactionId',
          'webhookResponse',
        ],
      });
      if (paymentTransaction && paymentTransaction.webhookResponse) {
        const newWebHookResponse = {
          order_no: paymentTransaction.webhookResponse?.order_no,
          order_amt: paymentTransaction.webhookResponse?.order_amt,
          order_status: paymentTransaction.webhookResponse?.order_status,
          reference_no: paymentTransaction.webhookResponse?.reference_no,
          order_card_name: paymentTransaction.webhookResponse?.order_card_name,
          order_date_time: paymentTransaction.webhookResponse?.order_date_time,
          order_option_type:
            paymentTransaction.webhookResponse?.order_option_type,
          order_status_date_time:
            paymentTransaction.webhookResponse?.order_status_date_time,
        };
        paymentTransaction['webhookResponse'] = newWebHookResponse;
      }
      memo.dataValues['paymentTransaction'] = paymentTransaction;
      return memo;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getBillingDetails(machineMemoId: any) {
    const memoDetails = await this.getBillingAndAccountingDetails(
      machineMemoId
    );

    let newDetails = {
      machineMemoId: memoDetails.machineMemoId,
      memoId: memoDetails.memoId,
      month: memoDetails.month,
      invoiceId: memoDetails.invoiceId,
      dueDate: moment(memoDetails.dueDate).format('MMM DD, YYYY'),
      year: getYear(memoDetails.createdAt),
      monthName: getMonthName(Number(memoDetails.month)), //month name
      monthStartDate: getMonthStartDate(memoDetails.createdAt), //month start date
      monthEndDate: getMonthEndDate(memoDetails.createdAt), //month end date
      status: memoDetails.status,
      type: memoDetails.type,
      minimumWashCommitment: memoDetails.minimumWashCommitment,
      gstPercentage: memoDetails.gstPercentage,
      washesDone: memoDetails.dataValues['washesDone'],
      taxableAmount: memoDetails.taxableAmount,
      blueverseDebit: this.blueverseObject(memoDetails),
      cgst: memoDetails.cgst,
      sgst: memoDetails.sgst,
      totalTax: Number(memoDetails.cgst) + Number(memoDetails.sgst),
      wordTotalTax: numberToWords(
        Number(memoDetails.cgst) + Number(memoDetails.sgst)
      ),
      totalAmount: memoDetails.totalAmount,
      topupAmountAdjusted: memoDetails.topupAmountAdjusted,
      invoiceTotalAmount:
        Number(memoDetails.totalAmount) -
        Number(memoDetails.topupAmountAdjusted),
      wordInvoiceTotalAmount: numberToWords(
        Number(memoDetails.totalAmount) -
          Number(memoDetails.topupAmountAdjusted)
      ),
      wordTotalAmount: numberToWords(memoDetails.totalAmount),
      creditRemainingBalance: memoDetails.creditRemainingBalance,
      roundCreditRemainingBalance: Math.round(
        memoDetails.creditRemainingBalance
      ),
      wordCreditRemaininAmount: numberToWords(
        Math.round(memoDetails.creditRemainingBalance)
      ),
      originalInvoiceId: memoDetails.dataValues['originalInvoiceId'], //undefined
      memoDate: moment(memoDetails.createdAt).format('MMM DD, YYYY'),
      outlet: {
        name: memoDetails?.outlet?.name,
        address: memoDetails?.outlet?.address,
        gstNo: memoDetails?.outlet?.gstNo,
        city: memoDetails?.outlet?.city?.name,
        state: memoDetails?.outlet?.city?.state?.name,
        stateGstNo: memoDetails?.outlet?.city?.state?.stateGstNo,
        blueverseAddress: memoDetails?.outlet?.city?.state?.blueverseAddress,
        blueverseEmail: memoDetails?.outlet?.city?.state?.blueverseEmail,
        region: memoDetails?.outlet?.city?.state?.region?.name,
      },
      machineName: memoDetails?.machine.name,
      dealerName: memoDetails?.dealer?.username,
      pricingTerms: memoDetails.pricingTerms ? memoDetails.pricingTerms[0] : [],
      paymentTransaction:
        memoDetails.status == config.machineMemoStatusObject.PAID
          ? memoDetails.dataValues['paymentTransaction']
          : undefined,
      invoiceData: memoDetails.invoiceData
        ? memoDetails.invoiceData.map((v: any) =>
            Object.assign(v, {
              amount: Number(v.value.count) * Number(v.value.baseAmount),
            })
          )
        : [],
      paidOn: moment(memoDetails.paidOn).format('MMM DD, YYYY'),
      hsn: config.machineMemoHSN_SAC.HSN,
      blueverseDetails: {
        email: config.blueverseDetails.email,
        panNo: config.blueverseDetails.panNo,
      },
      washDifference: 0,
      isMinimumWashLessThanActual: false,
    };
    // Key to check either tax invoice actual wash is less than minimum wash commitment

    let isMinimumWashLessThanActual = false;
    if (
      memoDetails.type === config.machineMemoTypeObject.TAX_INVOICE ||
      memoDetails.type === config.machineMemoTypeObject.BLUEVERSE_CREDIT
    ) {
      let washDifference =
        newDetails.minimumWashCommitment - newDetails.washesDone;
      // actual wash is more than minimum wash commitment
      if (washDifference < 0) {
        isMinimumWashLessThanActual = true;
      }
      newDetails['washDifference'] = Math.abs(washDifference);
      newDetails['isMinimumWashLessThanActual'] = isMinimumWashLessThanActual;
    }
    if (memoDetails.type === config.machineMemoTypeObject.ADVANCE_MEMO) {
      let newTaxableAmount =
        newDetails.minimumWashCommitment *
        (newDetails.pricingTerms.dealerPerWashPrice +
          newDetails.pricingTerms.manpowerPricePerWash);
      let newCgst = (newTaxableAmount * Number(config.cgstPercentage)) / 100;
      let newSgst = (newTaxableAmount * Number(config.sgstPercentage)) / 100;
      let newTotalAmount = newTaxableAmount + newCgst + newSgst;
      let newInvoiceTotalAmount =
        newTotalAmount - Number(newDetails.topupAmountAdjusted);
      // update object
      newDetails.taxableAmount = newTaxableAmount;
      newDetails.cgst = newCgst;
      newDetails.sgst = newSgst;
      newDetails.totalAmount = newTotalAmount;
      newDetails.invoiceTotalAmount = newInvoiceTotalAmount;
      newDetails.wordInvoiceTotalAmount = numberToWords(newInvoiceTotalAmount);
    }

    return newDetails;
  }

  async getMachineLastMemoDetail(machineId: any, dealerId: any) {
    try {
      return await MachineMemo.findOne({
        attributes: ['machineMemoId', 'memoId', 'type', 'status', 'createdAt'],
        where: {
          machineId: machineId,
          dealerId: dealerId,
          type: config.machineMemoTypeObject.ADVANCE_MEMO,
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (err) {
      Promise.reject(err);
    }
  }

  getWashesForCommencmentMemo(memo: any) {
    let washCount = 0;
    // let { isCommencementDone, invoiceDate } =
    //   memo?.dataValues.machine?.machineSubscriptionSetting;
    const machineSub = memo?.dataValues.machine?.machineSubscriptionSetting;
    if (!isNullOrUndefined(machineSub)) {
      let { isCommencementDone, invoiceDate } = machineSub;
      if (!isNullOrUndefined(invoiceDate)) {
        invoiceDate = getDateFromFullDate(invoiceDate);
      }
      if (
        !isNullOrUndefined(isCommencementDone) &&
        isCommencementDone &&
        !isNullOrUndefined(invoiceDate) &&
        invoiceDate > 1
      ) {
        const endDateOfTheMonth = moment(memo.dataValues.createdAt)
          .endOf('month')
          .date();
        const commencementDate = Number(invoiceDate);
        const remainingDaysInThisMonth =
          Number(endDateOfTheMonth) - commencementDate + 1;
        const perDayWash = Math.round(
          memo.dataValues.minimumWashCommitment / moment().daysInMonth()
        );
        const washesToBeDone = Math.round(
          perDayWash * remainingDaysInThisMonth
        );
        washCount = Math.round(washesToBeDone);
      }
    }

    return washCount;
  }
  getCommencmentMemoAmount(memo: any, washCount: any) {
    let updatedTotalAmount = '';
    let newCgst;
    let newSgst;
    let newTaxableAmount;
    const pricingTerms = memo.pricingTerms ? memo.pricingTerms[0] : [];
    if (pricingTerms) {
      const washPrice =
        pricingTerms.dealerPerWashPrice + pricingTerms.manpowerPricePerWash;
      newTaxableAmount = washCount * washPrice;
      newCgst = (newTaxableAmount * Number(config.cgstPercentage)) / 100;
      newSgst = (newTaxableAmount * Number(config.sgstPercentage)) / 100;
      let newTotalAmount = newTaxableAmount + newCgst + newSgst;
      let newInvoiceTotalAmount =
        newTotalAmount - Number(memo.topupAmountAdjusted);
      updatedTotalAmount = String(newInvoiceTotalAmount);
    }
    return { newTaxableAmount, newCgst, newSgst, updatedTotalAmount };
  }
  async getMachinePendingAdvanceMemo(machineId: string, dealerId: string) {
    try {
      const currentMonth = new Date().getMonth() + 1;

      return await MachineMemo.count({
        where: {
          machineId,
          dealerId,
          status: 'PENDING',
          type: 'ADVANCE_MEMO',
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn(
                'EXTRACT',
                db.sequelize.literal('MONTH FROM "createdAt"')
              ),
              { [Op.ne]: currentMonth }
            ),
          ],
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  convertToCreditArray(data: any) {
    const credits = [
      {
        creditKey: 'Bluverse Credit (Silver)',
        washCount: data.silverWashCount,
        bvCreditValue: data.silverBlueverseCredit,
        sellingPrice: data.silverBlueverseCredit / data.silverWashCount,
      },
      {
        creditKey: 'Bluverse Credit (Gold)',
        washCount: data.goldWashCount,
        bvCreditValue: data.goldBlueverseCredit,
        sellingPrice: data.goldBlueverseCredit / data.goldWashCount,
      },
      {
        creditKey: 'Bluverse Credit (Platinum)',
        washCount: data.platinumWashCount,
        bvCreditValue: data.platinumBlueverseCredit,
        sellingPrice: data.platinumBlueverseCredit / data.platinumWashCount,
      },
    ];

    // Filter out the entries where washCount is "0"
    return credits.filter((credit) => credit.washCount !== '0');
  }

  findMinimumPriceObject(data: any) {
    let minimumPrice = Infinity;
    let minimumPriceObject = null;

    for (let i = 0; i < data?.length; i++) {
      const object = data?.[i];
      const totalPrice =
        object?.dealerPerWashPrice + object?.manpowerPricePerWash + 10;

      if (totalPrice < minimumPrice) {
        minimumPrice = totalPrice;
        minimumPriceObject = object;
      }
    }

    return [minimumPriceObject];
  }

  formatCurrency(num: any, prefix = 'INR ') {
    let num1;

    if (typeof num === 'string') {
      num1 = parseFloat(num);
    } else {
      num1 = num;
    }

    if (!isNaN(num1)) {
      return prefix + num1?.toLocaleString('en-IN');
    } else {
      return prefix + 0;
    }
  }

  blueverseObject(data: any) {
    let tableData: any = [];
    let minimumData = this.findMinimumPriceObject(
      data.pricingTerms ? data.pricingTerms : []
    );
    const calc =
      parseFloat(minimumData[0]?.manpowerPricePerWash) +
      parseFloat(minimumData[0]?.dealerPerWashPrice);
    if (data?.blueverseDebit) {
      const resultArray = this.convertToCreditArray(data?.blueverseDebit);
      resultArray &&
        resultArray.map((item, idx) => {
          return tableData.push({
            index: data?.invoiceData?.length + (idx - 1) + 1,
            name: item?.creditKey,
            hsn: config.machineMemoHSN_SAC.HSN,
            washCount: item?.washCount,
            sellingPrice: (
              Number(item?.bvCreditValue) / Number(item?.washCount)
            ).toFixed(2),
            total: '-' + Number(item?.bvCreditValue),
          });
        });
    } else {
      tableData.push({
        index: data?.invoiceData?.length + 1 - 1,
        name: 'Blueverse Credit',
        hsn: config.machineMemoHSN_SAC.HSN,
        washCount:
          Number(data?.blueverseCredit) === 0
            ? '0'
            : Math.abs(
                Number(data?.minimumWashCommitment) - Number(data?.actualWash)
              ),
        sellingPrice: (Number(data?.blueverseCredit) === 0 ? 0 : calc).toFixed(
          2
        ),
        total:
          Number(data?.blueverseCredit) === 0
            ? '0'
            : parseFloat(data?.blueverseCredit),
      });
    }
    return tableData;
  }
}
const billingAndAccountingService = new BillingAndAccountingService();
export { billingAndAccountingService };
