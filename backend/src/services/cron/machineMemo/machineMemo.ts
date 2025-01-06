import { Outlet } from '../../../models/outlet';
import { config } from '../../../config/config';
import { logger } from '../../logger/logger';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { OutletMachine } from '../../../models/outlet_machine';
import { Machine } from '../../../models/Machine/Machine';
import { getMemoUniqueID } from '../../../module/paymenModule/services/payment.service';
import moment from 'moment';
import { Op } from 'sequelize';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import { notificationService } from '../../../services/notifications/notification';
import { notificationConstant } from '../../../common/notificationConstants';
import {
  calcActualAmount,
  calcPercent,
  isNullOrUndefined,
  isValidGuid,
} from '../../../common/utility';
import {
  advanceMemoRechargeAmount,
  isAdvanceMemoExistForThisMonth,
  getMachineForAdvanceMemo,
  advanceMemoCreate,
  getMemoDetailForJsonb,
} from '../../commonService';
import upload from '../../common/awsService/uploadService';
import { User } from '../../../models/User/user';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { Transactions } from '../../../models/transactions';
import { WashType } from '../../../models/wash_type';
import db from '../../../models';
import { gte } from 'lodash';
import { generateAndUploadMemoOldPdfFormat, generateAndUploadMemoPdf } from '../../htmlToPdf';
import { billingAndAccountingService } from '../../../module/billingAndAccounting/services/billingAndAccounting.service';
class MemoService {
  /**
   * This function create for generate advance memo of every month first date
   * @returns
   */
  generateAdvanceMemo = async () => {
    try {
      //Get machines list
      const machines = await getMachineForAdvanceMemo(false);

      //Iterate over machines list
      for (const machine of machines) {
        const checkIsAdvanceMemoExist = await isAdvanceMemoExistForThisMonth(
          machine.machineGuid
        );
        if (!checkIsAdvanceMemoExist) {
          let totalAmountToRecharge = Number(
            machine.machineSubscriptionSetting.total
          );
          let cgstToRecharge = Number(machine.machineSubscriptionSetting.cgst);
          //calcPercent(taxableAmount, config.cgstPercentage);
          let sgstToRecharge = Number(machine.machineSubscriptionSetting.sgst);
          let taxableAmountToRecharge = Number(
            machine.machineSubscriptionSetting.taxableAmount
          );

          /**
           * Check if topup balance is greater than 0 than move topup balance to the wallet balance
           */
          let topupAmountAdjusted = 0;
          if (machine.topUpBalance > 0) {
            // deducting topup amount from total recharge amount
            totalAmountToRecharge =
              Number(totalAmountToRecharge) - Number(machine.topUpBalance);
            topupAmountAdjusted = Number(machine.topUpBalance);
            await Machine.update(
              {
                walletBalance:
                  Number(machine.walletBalance) + Number(machine.topUpBalance),
                topUpBalance: 0,
              },
              { where: { machineGuid: machine.machineGuid } }
            );
            //reverse calculating gst from new total amount
            taxableAmountToRecharge = calcActualAmount(
              Number(totalAmountToRecharge),
              Number(config.sgstPercentage + config.cgstPercentage)
            );
            //recalculating cgstPercentage amount
            cgstToRecharge = calcPercent(
              Number(taxableAmountToRecharge),
              config.cgstPercentage
            );
            //recalculating sgstPercentage amount
            sgstToRecharge = calcPercent(
              Number(taxableAmountToRecharge),
              config.sgstPercentage
            );
          }
          const gstPercentage = {
            cgst: config.cgstPercentage,
            sgst: config.sgstPercentage,
          };

          await advanceMemoCreate(
            Number(totalAmountToRecharge),
            machine,
            Number(taxableAmountToRecharge),
            Number(cgstToRecharge),
            Number(sgstToRecharge),
            Number(topupAmountAdjusted),
            gstPercentage
          );
        }
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
  //this machine id is optional and used for testing purpose only
  generateTaxInvoice = async (machineId?: string) => {
    try {
      const whereCondition: any = {
        outletId: { [Op.ne]: null },
        isAssigned: true,
      };
      // Add machine restriction only for qa and dev environments to reduce server load
      if (
        config.serverConfig.env == 'development' ||
        config.serverConfig.env == 'qa' ||
        process.env.NODE_ENV === 'staging'
      ) {
        whereCondition['machineGuid'] = {
          [Op.in]: config.machinesIdArr,
        };
        // add single machine id condition for testing
        if (!isNullOrUndefined(machineId) && isValidGuid(machineId)) {
          whereCondition['machineGuid'] = {
            [Op.in]: [machineId],
          };
        }
      }
      //Get machines list
      const machines = await Machine.findAll({
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
            required: false,
          },
          {
            model: Outlet,
            attributes: ['outletId', 'dealerId', 'name', 'address', 'gstNo'],
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
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
              'pricingTerms',
              'cgst',
              'sgst',
            ],
          },
        ],
      });
      //Iterate over machines list
      for (let machine of machines) {
        machine = machine.dataValues;
        const washTypeMap = new Map();
        let totalSGSTAmount = 0;
        let totalCGSTAmount = 0;
        let totalBaseAmount = 0;
        let totalAmount = 0;

        //Last Advance memo details
        const lastInvoiceMemo = await MachineMemo.findOne({
          where: {
            type: config.machineMemoTypeObject.ADVANCE_MEMO,
            machineId: machine.machineGuid,
          },
          order: [['createdAt', 'DESC']],
          // attributes: ['memoId'],
          raw: true,
        });

        //  check number of wash done in this month
        const transactions = await Transactions.count({
          where: {
            MachineGuid: machine.machineGuid,
            AddDate: {
              [Op.gte]: moment(new Date()).startOf('month').toISOString(),
              [Op.lte]: moment(new Date()).endOf('month').toISOString(),
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

        for (let walletTransaction of machine.machineWallet) {
          walletTransaction = walletTransaction.dataValues;
          //Create key for maping
          let key =
            walletTransaction.washType +
            '' +
            walletTransaction.manpowerPricePerWash +
            '' +
            walletTransaction.dealerPerWashPrice;
          if (
            // Check if the source type of the wallet transaction is not equal to CREDIT
            walletTransaction.sourceType !=
            config.machineWalletSourceType.CREDIT
          ) {
            // If the source type is not CREDIT, add the amounts to the totals
            totalBaseAmount += Number(walletTransaction.baseAmount); // Add base amount to total
            totalAmount += Number(walletTransaction.totalAmount); // Add total amount to total
            totalCGSTAmount += Number(walletTransaction.cgst); // Add CGST amount to total
            totalSGSTAmount += Number(walletTransaction.sgst); // Add SGST amount to total
          }

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
        // If the number of washes done is less than or equal to the minimum wash commitment, the tax invoice should be generated based on the advance memo amount.
        if (
          !isNullOrUndefined(
            machine.machineSubscriptionSetting?.minimumWashCommitment
          ) &&
          transactions <=
            machine.machineSubscriptionSetting?.minimumWashCommitment
        ) {
          totalSGSTAmount = machine.machineSubscriptionSetting?.sgst;
          totalCGSTAmount = machine.machineSubscriptionSetting?.cgst;
          totalBaseAmount = machine.machineSubscriptionSetting?.taxableAmount;
          totalAmount = machine.machineSubscriptionSetting?.total;
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

        let blueverseCredit: any = 0;
        let blueverseDebit: any = null;

        // Check if machineSubscriptionSetting has minimumWashCommitment and pricingTerms
        if (
          machine.machineSubscriptionSetting?.minimumWashCommitment &&
          machine.machineSubscriptionSetting?.pricingTerms &&
          transactions <
            machine.machineSubscriptionSetting?.minimumWashCommitment
        ) {
          // Find the SILVER wash data in the pricingTerms array
          const silverWashData: any =
            machine.machineSubscriptionSetting?.pricingTerms.find(
              (wash: any) => wash.type === 'SILVER'
            );

          // Calculate the base amount by adding dealerPerWashPrice and manpowerPricePerWash
          let baseAmount =
            Number(silverWashData.dealerPerWashPrice) +
            Number(silverWashData.manpowerPricePerWash);

          // Calculate the blueverseCredit by subtracting the total wash cost from the minimumWashCommitment
          blueverseCredit =
            (Number(machine.machineSubscriptionSetting?.minimumWashCommitment) -
              Number(transactions)) *
            baseAmount;
        } else {
          blueverseDebit = await this.getBlueverseCreditSumForCurrentMonth(
            machine.machineGuid
          );
        }

        //Create machine memo invoice
        const newTaxInvoice = await MachineMemo.create({
          outletId: machine.outletId,
          machineId: machine.machineGuid,
          dealerId: machine.outlet.dealerId,
          memoId: memoId,
          invoiceId: lastInvoiceMemo ? lastInvoiceMemo.memoId : null,
          paidOn: new Date(),
          month: String(moment(new Date()).get('month') + 1),
          type: config.machineMemoTypeObject.TAX_INVOICE,
          invoiceData: invoiceData,
          status: config.machineMemoStatusObject.PAID,
          cgst: totalCGSTAmount,
          sgst: totalSGSTAmount,
          taxableAmount: totalBaseAmount,
          totalAmount: totalAmount,
          minimumWashCommitment:
            machine.machineSubscriptionSetting?.minimumWashCommitment || 0,
          pricingTerms: machine.machineSubscriptionSetting?.pricingTerms,
          memoDetail: getMemoDetailForJsonb(machine),
          blueverseCredit: blueverseCredit,
          // Calculate the actual number of washes
          actualWash: Number(transactions),
          blueverseDebit: blueverseDebit,
        });

        // NOTIFICATIONS
        if (newTaxInvoice) {
          // notifications for admin
          const { type: adminNotiType, url: adminNotiUrl } =
            notificationConstant.adminNotificationObject.TAX_INVOICE_GENERATE;
          const notificationBodyAdmin = {
            modelDetail: {
              name: 'MachineMemo',
              uuid: newTaxInvoice?.machineMemoId,
            },
            type: adminNotiType,
            link: `${adminNotiUrl}/${newTaxInvoice?.machineMemoId}`,
          };
          notificationService.generateNotification(
            config.userRolesObject.ADMIN,
            notificationBodyAdmin
          );
          // notifications for dealer
          const { type: dealerNotiType, url: dealerNotiUrl } =
            notificationConstant.dealerNotificationObject
              .TAX_INVOICE_GENERATE_BY_ADMIN;
          const notificationBodyDealer = {
            modelDetail: {
              name: 'MachineMemo',
              uuid: newTaxInvoice?.machineMemoId,
            },
            userId: newTaxInvoice?.dealerId,
            type: dealerNotiType,
            link: `${dealerNotiUrl}/${newTaxInvoice?.machineMemoId}`,
          };
          notificationService.generateNotification(
            config.userRolesObject.DEALER,
            notificationBodyDealer
          );
        }
      }
    } catch (err) {
      console.log(err);
      logger.error(
        'Error in class MemoService generateTaxInvoice function',
        err
      );
    }
  };

  /**
   * This function create for generate blueverse credit memo of every month for move wallet amount to the blueverse credit
   */
  //this machine id is optional and used for testing purpose only
  generateBlueverseCreditMemo = async (machineId?: string) => {
    try {
      const whereCondition: any = {
        outletId: { [Op.ne]: null },
        isAssigned: true,
        walletBalance: { [Op.gt]: 0 },
      };
      // Add machine restriction only for qa and dev environments to reduce server load
      if (
        config.serverConfig.env == 'development' ||
        config.serverConfig.env == 'qa' ||
        process.env.NODE_ENV === 'staging'
      ) {
        whereCondition['machineGuid'] = {
          [Op.in]: config.machinesIdArr,
        };
        // add single machine id condition for testing
        if (!isNullOrUndefined(machineId) && isValidGuid(machineId)) {
          whereCondition['machineGuid'] = {
            [Op.in]: [machineId],
          };
        }
      }
      //Get machines list
      const machines = await Machine.findAll({
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
            attributes: ['outletId', 'dealerId'],
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
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
              'pricingTerms',
              'cgst',
              'sgst',
            ],
          },
        ],
      });
      //Iterate over machines list
      for (const machine of machines) {
        if (machine.walletBalance > 0) {
          //Update machine balance
          await Machine.update(
            {
              topUpBalance: Number(machine.topUpBalance),
              blueverseCredit:
                Number(machine.blueverseCredit) + Number(machine.walletBalance),
              walletBalance: 0,
            },
            { where: { machineGuid: machine.machineGuid } }
          );
          //Create machine wallet entry for blueverse credit memo
          await MachineWallet.create({
            machineId: machine.machineGuid,
            transactionType: config.machineWalletTransactionType.ADDED,
            topUpBalance: Number(machine.topUpBalance),
            blueverseCredit:
              Number(machine.blueverseCredit) + Number(machine.walletBalance),
            walletBalance: 0,
            description:
              'Wallet Balance added in blueverse credit in the end of the month',
            sourceType: config.machineWalletSourceType.CREDIT,
            totalAmount: Number(machine.walletBalance),
          });

          //Create memo id
          const memoId = await getMemoUniqueID(
            'BC',
            config.machineMemoTypeObject.BLUEVERSE_CREDIT
          );

          //getting last tax invoice Memo id for this tax memo
          const lastInvoiceMemo = await MachineMemo.findOne({
            where: {
              type: config.machineMemoTypeObject.TAX_INVOICE,
              machineId: machine.machineGuid,
            },
            order: [['createdAt', 'DESC']],
            attributes: ['memoId'],
            raw: true,
          });

          //Create machine memo id
          const newblueverseCredit = await MachineMemo.create({
            machineId: machine.machineGuid,
            paidOn: new Date(),
            outletId: machine.outletId,
            dealerId: machine.outlet.dealerId,
            memoId: memoId,
            invoiceId: lastInvoiceMemo.memoId,
            type: config.machineMemoTypeObject.BLUEVERSE_CREDIT,
            month: String(moment(new Date()).get('month') + 1),
            status: config.machineMemoStatusObject.PAID,
            minimumWashCommitment: Number(
              machine.machineSubscriptionSetting.minimumWashCommitment
            ),
            pricingTerms: machine.machineSubscriptionSetting.pricingTerms,
            taxableAmount: Number(
              machine.machineSubscriptionSetting.taxableAmount
            ),
            totalAmount: Number(machine.machineSubscriptionSetting.total),
            cgst: Number(machine.machineSubscriptionSetting.cgst),
            sgst: Number(machine.machineSubscriptionSetting.sgst),
            creditRemainingBalance: machine.walletBalance,
            memoDetail: getMemoDetailForJsonb(machine),
          });
          // NOTIFICATIONS
          if (newblueverseCredit) {
            // notifications for admin
            const { type: adminNotiType, url: adminNotiUrl } =
              notificationConstant.adminNotificationObject
                .BLUEVERSE_CREDIT_CARRYFORWARD;
            const notificationBody = {
              modelDetail: {
                name: 'MachineMemo',
                uuid: newblueverseCredit?.machineMemoId,
              },
              type: adminNotiType,
              link: `${adminNotiUrl}/${newblueverseCredit?.machineMemoId}`,
            };
            notificationService.generateNotification(
              config.userRolesObject.ADMIN,
              notificationBody
            );
            // notifications for dealer
            const { type: dealerNotiType, url: dealerNotiUrl } =
              notificationConstant.dealerNotificationObject
                .BLUEVERSE_CREDIT_GENERATE_BY_ADMIN;
            const notificationBodyDealer = {
              modelDetail: {
                name: 'MachineMemo',
                uuid: newblueverseCredit?.machineMemoId,
              },
              userId: newblueverseCredit?.dealerId,
              type: dealerNotiType,
              link: `${dealerNotiUrl}/${newblueverseCredit?.machineMemoId}`,
            };
            notificationService.generateNotification(
              config.userRolesObject.DEALER,
              notificationBodyDealer
            );
          }
        }
      }
    } catch (err) {
      logger.error(
        'Error in class MemoService generateBlueverseCreditMemo function',
        err
      );
    }
  };

  generateCommencementAdvanceMemo = async () => {
    try {
      //Get machines list
      const machines: any = await getMachineForAdvanceMemo(true);

      //Iterate over machines list
      for (const machine of machines) {
        const checkIsAdvanceMemoExist = await isAdvanceMemoExistForThisMonth(
          machine.machineGuid
        );
        if (!checkIsAdvanceMemoExist) {
          let lowestPricingTerm: any = {};
          if (machine.machineSubscriptionSetting.pricingTerms.length) {
            lowestPricingTerm = {
              dealerPerWashPrice: Number(
                machine.machineSubscriptionSetting.pricingTerms[0]
                  .dealerPerWashPrice
              ),
              manpowerPricePerWash: Number(
                machine.machineSubscriptionSetting.pricingTerms[0]
                  .manpowerPricePerWash
              ),
            };

            for (const pricingTerm of machine.machineSubscriptionSetting
              .pricingTerms) {
              let lowestPrice =
                lowestPricingTerm.dealerPerWashPrice +
                lowestPricingTerm.manpowerPricePerWash;

              let price =
                Number(pricingTerm.dealerPerWashPrice) +
                Number(pricingTerm.manpowerPricePerWash);
              if (price < lowestPrice) {
                lowestPricingTerm = {
                  dealerPerWashPrice: Number(pricingTerm.dealerPerWashPrice),
                  manpowerPricePerWash: Number(
                    pricingTerm.manpowerPricePerWash
                  ),
                };
              }
            }
          }
          if (Object.keys(lowestPricingTerm).length) {
            const price = advanceMemoRechargeAmount(
              Number(lowestPricingTerm.dealerPerWashPrice) +
                Number(lowestPricingTerm.manpowerPricePerWash),
              Number(machine.machineSubscriptionSetting.minimumWashCommitment),
              Number(machine.topUpBalance)
            );

            /**
             * Check if topup balance is greater than 0 than move topup balance to the wallet balance
             */
            let topupAmountAdjusted = 0;
            if (machine.topUpBalance > 0) {
              await Machine.update(
                {
                  walletBalance:
                    Number(machine.walletBalance) +
                    Number(machine.topUpBalance),
                  topUpBalance: 0,
                },
                { where: { machineGuid: machine.machineGuid } }
              );
              topupAmountAdjusted = Number(machine.topUpBalance);
            }
            const gstPercentage = {
              cgst: config.cgstPercentage,
              sgst: config.sgstPercentage,
            };
            await advanceMemoCreate(
              price.totalAmount,
              machine,
              price.baseAmount,
              price.cgst,
              price.sgst,
              topupAmountAdjusted,
              gstPercentage
            );
          }
        }
        await OutletMachine.update(
          { isCommencementDone: true },
          { where: { machineId: machine.machineGuid } }
        );
      }
    } catch (err) {
      logger.error(
        'Error in class MemoService generateCommencementAdvanceMemo function',
        err
      );
    }
  };

  // upload file to s3 and store file address in db
  updateMemoPdfAddress = async (memoId: any, s3Address: any) => {
    try {
      await MachineMemo.update(
        {
          pdfAddress: s3Address,
        },
        { where: { machineMemoId: memoId } }
      );
    } catch (err) {
      logger.error(
        'failed to update pdfAddress updateMemoPdfAddress function',
        err
      );
    }
  };

  async getBlueverseCreditSumForCurrentMonth(machineId: any) {
    try {
      // Get the current month start and end date using moment
      const startOfMonth = moment(new Date()).startOf('month').toISOString();

      const endOfMonth = moment(new Date()).endOf('month').toISOString();

      const result = await MachineWallet.findAll({
        where: {
          // Only consider records with blueverseCredit > 0, debited transactions, for the specific machineId, and within the current month
          sourceType: config.machineWalletSourceType.CREDIT,
          transactionType: config.machineWalletTransactionType.DEBITED,
          machineId: machineId,
          createdAt: {
            [Op.gte]: startOfMonth, // Start of the current month
            [Op.lte]: endOfMonth, // End of the current month
          },
        },
        attributes: [
          // Count how many SILVER washes there are
          [
            db.sequelize.fn(
              'COUNT',
              db.sequelize.literal(`CASE WHEN wash_type = 'SILVER' THEN 1 END`)
            ),
            'silverWashCount',
          ],
          // Sum the blueverseCredit for SILVER washes, using COALESCE to ensure null values are replaced by 0
          [
            db.sequelize.fn(
              'COALESCE',
              db.sequelize.fn(
                'SUM',
                db.sequelize.literal(
                  `CASE WHEN wash_type = 'SILVER' THEN base_amount END`
                )
              ),
              0
            ),
            'silverBlueverseCredit',
          ],
          // Count how many GOLD washes there are
          [
            db.sequelize.fn(
              'COUNT',
              db.sequelize.literal(`CASE WHEN wash_type = 'GOLD' THEN 1 END`)
            ),
            'goldWashCount',
          ],
          // Sum the blueverseCredit for GOLD washes, using COALESCE to return 0 instead of null
          [
            db.sequelize.fn(
              'COALESCE',
              db.sequelize.fn(
                'SUM',
                db.sequelize.literal(
                  `CASE WHEN wash_type = 'GOLD' THEN base_amount END`
                )
              ),
              0
            ),
            'goldBlueverseCredit',
          ],
          // Count how many PLATINUM washes there are
          [
            db.sequelize.fn(
              'COUNT',
              db.sequelize.literal(
                `CASE WHEN wash_type = 'PLATINUM' THEN 1 END`
              )
            ),
            'platinumWashCount',
          ],
          // Sum the blueverseCredit for PLATINUM washes, using COALESCE to return 0 if no records exist
          [
            db.sequelize.fn(
              'COALESCE',
              db.sequelize.fn(
                'SUM',
                db.sequelize.literal(
                  `CASE WHEN wash_type = 'PLATINUM' THEN base_amount END`
                )
              ),
              0
            ),
            'platinumBlueverseCredit',
          ],
        ],
      });

      return result[0].dataValues;
    } catch (err) {
      logger.error('failed to get sum of blueverse credit function', err);
    }
  }

  /**
   * This function create for generate tax invoice on every month last date
   */
  //this machine id is optional and used for testing purpose only
  generateCustomTaxInvoice = async (
    machineId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      let customStartDate: any = moment().startOf('month').toISOString(); // Set default start date to the beginning of the current month in ISO format

      let customEndDate: any = moment().endOf('month').toISOString(); // Set default end date to the end of the current month in ISO format

      // If startDate and endDate are provided and not null/undefined, override the default dates
      if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
        customStartDate = moment(startDate).startOf('day').toISOString(); // Convert startDate to the beginning of the day in ISO format
        customEndDate = moment(endDate).endOf('day').toISOString(); // Convert endDate to the end of the day in ISO format
      }

      const whereCondition: any = {
        outletId: { [Op.ne]: null },
        isAssigned: true,
      };

      whereCondition['machineGuid'] = {
        [Op.in]: config.machinesIdArr,
      };
      // add single machine id condition for testing
      if (!isNullOrUndefined(machineId) && isValidGuid(machineId)) {
        whereCondition['machineGuid'] = {
          [Op.in]: [machineId],
        };
      }

      //Get machines list
      const machines = await Machine.findAll({
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
                [Op.gte]: customStartDate,
                [Op.lte]: customEndDate,
              },
              transactionType: config.machineWalletTransactionType.DEBITED,
            },
            required: false,
          },
          {
            model: Outlet,
            attributes: ['outletId', 'dealerId', 'name', 'address', 'gstNo'],
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
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
              'pricingTerms',
              'cgst',
              'sgst',
            ],
          },
        ],
      });
      //Iterate over machines list
      for (let machine of machines) {
        machine = machine.dataValues;
        const washTypeMap = new Map();
        let totalSGSTAmount = 0;
        let totalCGSTAmount = 0;
        let totalBaseAmount = 0;
        let totalAmount = 0;

        //Last Advance memo details
        const lastInvoiceMemo = await MachineMemo.findOne({
          where: {
            type: config.machineMemoTypeObject.ADVANCE_MEMO,
            machineId: machine.machineGuid,
            createdAt: {
              [Op.gte]: customStartDate, // For filtering records where createdAt is greater than or equal to customStartDate
              [Op.lte]: customEndDate,
            },
          },
          order: [['createdAt', 'DESC']],
          // attributes: ['memoId'],
          raw: true,
        });
        console.log('🚀 ~ MemoService ~ lastInvoiceMemo:', lastInvoiceMemo);

        //  check number of wash done in this month
        const transactions = await Transactions.count({
          where: {
            MachineGuid: machine.machineGuid,
            AddDate: {
              [Op.gte]: customStartDate,
              [Op.lte]: customEndDate,
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

        for (let walletTransaction of machine.machineWallet) {
          walletTransaction = walletTransaction.dataValues;
          //Create key for maping
          let key =
            walletTransaction.washType +
            '' +
            walletTransaction.manpowerPricePerWash +
            '' +
            walletTransaction.dealerPerWashPrice;
          if (
            // Check if the source type of the wallet transaction is not equal to CREDIT
            walletTransaction.sourceType !=
            config.machineWalletSourceType.CREDIT
          ) {
            // If the source type is not CREDIT, add the amounts to the totals
            totalBaseAmount += Number(walletTransaction.baseAmount); // Add base amount to total
            totalAmount += Number(walletTransaction.totalAmount); // Add total amount to total
            totalCGSTAmount += Number(walletTransaction.cgst); // Add CGST amount to total
            totalSGSTAmount += Number(walletTransaction.sgst); // Add SGST amount to total
          }

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
        // If the number of washes done is less than or equal to the minimum wash commitment, the tax invoice should be generated based on the advance memo amount.
        if (
          !isNullOrUndefined(
            machine.machineSubscriptionSetting?.minimumWashCommitment
          ) &&
          transactions <=
            machine.machineSubscriptionSetting?.minimumWashCommitment
        ) {
          totalSGSTAmount = machine.machineSubscriptionSetting?.sgst;
          totalCGSTAmount = machine.machineSubscriptionSetting?.cgst;
          totalBaseAmount = machine.machineSubscriptionSetting?.taxableAmount;
          totalAmount = machine.machineSubscriptionSetting?.total;
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

        let blueverseCredit: any = 0;
        let blueverseDebit: any = null;

        // Check if machineSubscriptionSetting has minimumWashCommitment and pricingTerms
        if (
          machine.machineSubscriptionSetting?.minimumWashCommitment &&
          machine.machineSubscriptionSetting?.pricingTerms &&
          transactions <
            machine.machineSubscriptionSetting?.minimumWashCommitment
        ) {
          // Find the SILVER wash data in the pricingTerms array
          const silverWashData: any =
            machine.machineSubscriptionSetting?.pricingTerms.find(
              (wash: any) => wash.type === 'SILVER'
            );

          // Calculate the base amount by adding dealerPerWashPrice and manpowerPricePerWash
          let baseAmount =
            Number(silverWashData.dealerPerWashPrice) +
            Number(silverWashData.manpowerPricePerWash);

          // Calculate the blueverseCredit by subtracting the total wash cost from the minimumWashCommitment
          blueverseCredit =
            (Number(machine.machineSubscriptionSetting?.minimumWashCommitment) -
              Number(transactions)) *
            baseAmount;
        } else {
          blueverseDebit =
            await this.getBlueverseCreditSumForCurrentMonthForCustomTaxInvoice(
              machine.machineGuid,
              customStartDate,
              customEndDate
            );
        }

        //Create machine memo invoice
        const newTaxInvoice = await MachineMemo.create({
          outletId: machine.outletId,
          machineId: machine.machineGuid,
          dealerId: machine.outlet.dealerId,
          memoId: memoId,
          invoiceId: lastInvoiceMemo ? lastInvoiceMemo.memoId : null,
          paidOn: startDate ? new Date(startDate) : new Date(),
          month: startDate
            ? String(moment(customStartDate).get('month') + 1)
            : String(moment(new Date()).get('month') + 1),

          type: config.machineMemoTypeObject.TAX_INVOICE,
          invoiceData: invoiceData,
          status: config.machineMemoStatusObject.PAID,
          cgst: totalCGSTAmount,
          sgst: totalSGSTAmount,
          taxableAmount: totalBaseAmount,
          totalAmount: totalAmount,
          minimumWashCommitment:
            machine.machineSubscriptionSetting?.minimumWashCommitment || 0,
          pricingTerms: machine.machineSubscriptionSetting?.pricingTerms,
          memoDetail: getMemoDetailForJsonb(machine),
          blueverseCredit: blueverseCredit,
          // Calculate the actual number of washes
          actualWash: Number(transactions),
          blueverseDebit: blueverseDebit,
        });

        // NOTIFICATIONS
        if (newTaxInvoice) {
          // notifications for admin
          const { type: adminNotiType, url: adminNotiUrl } =
            notificationConstant.adminNotificationObject.TAX_INVOICE_GENERATE;
          const notificationBodyAdmin = {
            modelDetail: {
              name: 'MachineMemo',
              uuid: newTaxInvoice?.machineMemoId,
            },
            type: adminNotiType,
            link: `${adminNotiUrl}/${newTaxInvoice?.machineMemoId}`,
          };
          notificationService.generateNotification(
            config.userRolesObject.ADMIN,
            notificationBodyAdmin
          );
          // notifications for dealer
          const { type: dealerNotiType, url: dealerNotiUrl } =
            notificationConstant.dealerNotificationObject
              .TAX_INVOICE_GENERATE_BY_ADMIN;
          const notificationBodyDealer = {
            modelDetail: {
              name: 'MachineMemo',
              uuid: newTaxInvoice?.machineMemoId,
            },
            userId: newTaxInvoice?.dealerId,
            type: dealerNotiType,
            link: `${dealerNotiUrl}/${newTaxInvoice?.machineMemoId}`,
          };
          notificationService.generateNotification(
            config.userRolesObject.DEALER,
            notificationBodyDealer
          );
        }
      }
    } catch (err) {
      console.log(err);
      logger.error(
        'Error in class MemoService generateTaxInvoice function',
        err
      );
    }
  };

  async getBlueverseCreditSumForCurrentMonthForCustomTaxInvoice(
    machineId: any,
    customStartDate: any,
    customEndDate: any
  ) {
    try {
      // Get the current month start and end date using moment
      const startOfMonth = customStartDate;

      const endOfMonth = customEndDate;

      const result = await MachineWallet.findAll({
        where: {
          // Only consider records with blueverseCredit > 0, debited transactions, for the specific machineId, and within the current month
          sourceType: config.machineWalletSourceType.CREDIT,
          transactionType: config.machineWalletTransactionType.DEBITED,
          machineId: machineId,
          createdAt: {
            [Op.gte]: startOfMonth, // Start of the current month
            [Op.lte]: endOfMonth, // End of the current month
          },
        },
        attributes: [
          // Count how many SILVER washes there are
          [
            db.sequelize.fn(
              'COUNT',
              db.sequelize.literal(`CASE WHEN wash_type = 'SILVER' THEN 1 END`)
            ),
            'silverWashCount',
          ],
          // Sum the blueverseCredit for SILVER washes, using COALESCE to ensure null values are replaced by 0
          [
            db.sequelize.fn(
              'COALESCE',
              db.sequelize.fn(
                'SUM',
                db.sequelize.literal(
                  `CASE WHEN wash_type = 'SILVER' THEN base_amount END`
                )
              ),
              0
            ),
            'silverBlueverseCredit',
          ],
          // Count how many GOLD washes there are
          [
            db.sequelize.fn(
              'COUNT',
              db.sequelize.literal(`CASE WHEN wash_type = 'GOLD' THEN 1 END`)
            ),
            'goldWashCount',
          ],
          // Sum the blueverseCredit for GOLD washes, using COALESCE to return 0 instead of null
          [
            db.sequelize.fn(
              'COALESCE',
              db.sequelize.fn(
                'SUM',
                db.sequelize.literal(
                  `CASE WHEN wash_type = 'GOLD' THEN base_amount END`
                )
              ),
              0
            ),
            'goldBlueverseCredit',
          ],
          // Count how many PLATINUM washes there are
          [
            db.sequelize.fn(
              'COUNT',
              db.sequelize.literal(
                `CASE WHEN wash_type = 'PLATINUM' THEN 1 END`
              )
            ),
            'platinumWashCount',
          ],
          // Sum the blueverseCredit for PLATINUM washes, using COALESCE to return 0 if no records exist
          [
            db.sequelize.fn(
              'COALESCE',
              db.sequelize.fn(
                'SUM',
                db.sequelize.literal(
                  `CASE WHEN wash_type = 'PLATINUM' THEN base_amount END`
                )
              ),
              0
            ),
            'platinumBlueverseCredit',
          ],
        ],
      });

      return result[0].dataValues;
    } catch (err) {
      logger.error('failed to get sum of blueverse credit function', err);
    }
  }

  generateOldCustomTaxInvoice = async (
    machineId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      let customStartDate: any = moment().startOf('month').toISOString(); // Set default start date to the beginning of the current month in ISO format

      let customEndDate: any = moment().endOf('month').toISOString(); // Set default end date to the end of the current month in ISO format

      // If startDate and endDate are provided and not null/undefined, override the default dates
      if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
        customStartDate = moment(startDate).startOf('day').toISOString(); // Convert startDate to the beginning of the day in ISO format
        customEndDate = moment(endDate).endOf('day').toISOString(); // Convert endDate to the end of the day in ISO format
      }

      const whereCondition: any = {
        outletId: { [Op.ne]: null },
        isAssigned: true,
      };

      whereCondition['machineGuid'] = {
        [Op.in]: config.machinesIdArr,
      };
      // add single machine id condition for testing
      if (!isNullOrUndefined(machineId) && isValidGuid(machineId)) {
        whereCondition['machineGuid'] = {
          [Op.in]: [machineId],
        };
      }
      //Get machines list
      const machines = await Machine.findAll({
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
                [Op.gte]: customStartDate,
                [Op.lte]: customEndDate,
              },
              transactionType: config.machineWalletTransactionType.DEBITED,
            },
            required: false,
          },
          {
            model: Outlet,
            attributes: ['outletId', 'dealerId', 'name', 'address', 'gstNo'],
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
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
              'pricingTerms',
            ],
          },
        ],
      });
      //Iterate over machines list
      for (let machine of machines) {
        machine = machine.dataValues;
        const washTypeMap = new Map();
        let totalSGSTAmount = 0;
        let totalCGSTAmount = 0;
        let totalBaseAmount = 0;
        let totalAmount = 0;
        for (let walletTransaction of machine.machineWallet) {
          walletTransaction = walletTransaction.dataValues;
          //Create key for maping
          let key =
            walletTransaction.washType +
            '' +
            walletTransaction.manpowerPricePerWash +
            '' +
            walletTransaction.dealerPerWashPrice;
          totalBaseAmount += Number(walletTransaction.baseAmount);
          totalAmount += Number(walletTransaction.totalAmount);
          totalCGSTAmount += Number(walletTransaction.cgst);
          totalSGSTAmount += Number(walletTransaction.sgst);
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

        //getting last Invoice memo Memo id for this tax memo
        const lastInvoiceMemo = await MachineMemo.findOne({
          where: {
            type: config.machineMemoTypeObject.ADVANCE_MEMO,
            machineId: machine.machineGuid,
            createdAt: {
              [Op.gte]: customStartDate, // For filtering records where createdAt is greater than or equal to customStartDate
              [Op.lte]: customEndDate,
            },
          },
          order: [['createdAt', 'DESC']],
          attributes: ['memoId'],
          raw: true,
        });

        //Create machine memo invoice
        const newTaxInvoice = await MachineMemo.create({
          outletId: machine.outletId,
          machineId: machine.machineGuid,
          dealerId: machine.outlet.dealerId,
          memoId: memoId,
          invoiceId: lastInvoiceMemo ? lastInvoiceMemo.memoId : null,
          paidOn: startDate ? new Date(startDate) : new Date(),
          month: startDate
          ? String(moment(customStartDate).get('month') + 1)
          : String(moment(new Date()).get('month') + 1),
          type: config.machineMemoTypeObject.TAX_INVOICE,
          invoiceData: invoiceData,
          status: config.machineMemoStatusObject.PAID,
          cgst: totalCGSTAmount,
          sgst: totalSGSTAmount,
          taxableAmount: totalBaseAmount,
          totalAmount: totalAmount,
          minimumWashCommitment:
            machine.machineSubscriptionSetting?.minimumWashCommitment || 0,
          pricingTerms: machine.machineSubscriptionSetting?.pricingTerms,
          memoDetail: getMemoDetailForJsonb(machine),
        });
        // NOTIFICATIONS
        if (newTaxInvoice) {
          const formatMemoDetails =
            await billingAndAccountingService.getBillingDetails(
              newTaxInvoice?.machineMemoId
            );
          const fileDetails = await generateAndUploadMemoOldPdfFormat(
            notificationConstant.types.TAX_INVOICE_MEMO,
            config.userRolesObject.ADMIN,
            formatMemoDetails,
            true
          );
          if (!isNullOrUndefined(fileDetails?.s3Address)) {
            await memoService.updateMemoPdfAddress(
              formatMemoDetails.machineMemoId,
              fileDetails.s3Address
            );
          }
        }
      }
    } catch (err) {
      console.log(err);
      logger.error(
        'Error in class MemoService generateTaxInvoice function',
        err
      );
    }
  };
}
const memoService = new MemoService();
export { memoService };
