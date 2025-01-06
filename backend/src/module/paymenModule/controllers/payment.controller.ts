import { PaymentTransaction } from '../../../models/payment_transactions';
import { templateConstants } from '../../../common/templateConstants';
import {
  generateHash as _generateHash,
  savePaymentTransaction,
  validatePayment,
} from '../services/payment.service';
import { emailService } from '../../../services/common/emailService';
import { Response } from 'ts-express-decorators';
import { response } from 'express';
import createError from 'http-errors';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { config } from '../../../config/config';
import moment from 'moment';
import { Op } from 'sequelize';
import { Machine } from '../../../models/Machine/Machine';
import { User } from '../../../models/User/user';
import { City } from '../../../models/city';
import { Outlet } from '../../../models/outlet';
import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import {
  ccPaymentIntEncrypt,
  getOrderStatus,
} from '../../../services/common/ccAvenue/ccAvenue';
import qs from 'qs';
import { messageService } from '../../../services/common/messageService';
import { OutletMachine } from '../../../models/outlet_machine';
import { billingAndAccountingService } from '../../billingAndAccounting/services/billingAndAccounting.service';
import { CustomerPaymentServices } from '../../../B2C/paymentModule/services/payment.service';
import { CustomerPaymentTransaction } from '../../../B2C/models/customerPaymentTrasaction';

class PaymentController {
  async generateHash(req: any, res: any, next: any) {
    try {
      let {
        txnid,
        email,
        amount,
        productinfo,
        firstname,
        phone,
        surl,
        furl,
        dealerId,
        outletId,
        machineId,
        cgst,
        sgst,
        taxableAmount,
        machine,
      } = res.locals.request;

      const { machineMemoId } = req.body;
      const paymentBody: any = {
        merchant_id: config.ccAvenueDetail.merchantId,
        order_id: txnid,
        currency: config.ccAvenueDetail.currency,
        amount: amount,
        redirect_url: surl,
        cancel_url: furl,
        billing_name: machine.outlet.dealer.username,
        billing_address: machine.outlet.address,
        billing_city: machine.outlet.city.name,
        billing_state: machine.outlet.city.state.name,
        billing_country: config.ccAvenueDetail.country,
        billing_tel: machine.outlet.dealer.phone,
        billing_email: machine.outlet.dealer.email,
      };
      const { enc, form } = ccPaymentIntEncrypt(paymentBody);
      await PaymentTransaction.create({
        email: email,
        transactionId: txnid,
        amount: Number(amount),
        productInfo: productinfo,
        username: firstname,
        phone: phone,
        surl: surl,
        furl: furl,
        generatedHash: enc,
        dealerId: dealerId,
        outletId: outletId,
        machineId: machineId,
        machineMemoId: machineMemoId ? machineMemoId : null,
        cgst: Number(cgst),
        sgst: Number(sgst),
        taxableAmount: Number(taxableAmount),
      });
      res.locals.response = {
        body: {
          data: { ...res.locals.request, hash: form },
        },
        message: templateConstants.SUCCESSFULLY('Hash generated'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getPaymentStatus(req: any, res: any, next: any) {
    try {
      const { txnId } = req.query;
      let transactionDetail: any = {
        status: null,
        bankcode: null,
        txnid: null,
        addedon: null,
        mihpayid: null,
        transactionMemoDetail: {},
        error_Message: null,
      };
      if (txnId) {
        //Check is txn exist or not
        const isTxnIdExist: any = await PaymentTransaction.findOne({
          where: { transactionId: txnId },
          raw: true,
        });
        if (!isTxnIdExist) {
          throw createError(404, templateConstants.INVALID('txnId'));
        }
        if (
          isTxnIdExist.status === config.paymentTransactionStatusObject.PENDING
        ) {
          transactionDetail.status =
            config.paymentTransactionStatusObject.PENDING.toLocaleLowerCase();
          transactionDetail.txnid = isTxnIdExist.transactionId;
          transactionDetail.addedon = isTxnIdExist.createdAt;
          transactionDetail.error_Message = 'payment not initiated yet';
        } else if (
          isTxnIdExist.status ===
          config.paymentTransactionStatusObject.PROCESSING
        ) {
          transactionDetail.status =
            config.paymentTransactionStatusObject.PROCESSING.toLocaleLowerCase();
          transactionDetail.txnid = isTxnIdExist.transactionId;
          transactionDetail.addedon =
            isTxnIdExist.webhookResponse?.order_status_date_time;
          transactionDetail.bankcode =
            isTxnIdExist.webhookResponse?.order_card_name;
          transactionDetail.mihpayid =
            isTxnIdExist.webhookResponse?.order_bank_ref_no;
          transactionDetail.error_Message =
            isTxnIdExist.webhookResponse?.error_desc;
        } else if (
          isTxnIdExist.status === config.paymentTransactionStatusObject.FAILED
        ) {
          transactionDetail.status =
            config.paymentTransactionStatusObject.FAILURE.toLocaleLowerCase();
          transactionDetail.txnid = isTxnIdExist.transactionId;
          transactionDetail.addedon =
            isTxnIdExist.webhookResponse?.order_status_date_time;
          transactionDetail.bankcode =
            isTxnIdExist.webhookResponse?.order_card_name;
          transactionDetail.mihpayid =
            isTxnIdExist.webhookResponse?.order_bank_ref_no;
          transactionDetail.error_Message =
            isTxnIdExist.webhookResponse?.error_desc;
        } else {
          transactionDetail.status =
            config.paymentTransactionStatusObject.SUCCESS.toLocaleLowerCase();
          transactionDetail.txnid = isTxnIdExist.transactionId;
          transactionDetail.addedon =
            isTxnIdExist.webhookResponse?.order_status_date_time;
          transactionDetail.bankcode =
            isTxnIdExist.webhookResponse?.order_card_name;
          transactionDetail.mihpayid =
            isTxnIdExist.webhookResponse?.order_bank_ref_no;
          transactionDetail.error_Message =
            isTxnIdExist.webhookResponse?.error_desc;
        }
        transactionDetail.webhookResponse = isTxnIdExist.webhookResponse;

        const memoDetail: any = await MachineMemo.findOne({
          where: { machineMemoId: isTxnIdExist.machineMemoId },
          include: [
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
          ],
        });
        if (memoDetail.type === config.machineMemoTypeObject.ADVANCE_MEMO) {
          const washCount =
            billingAndAccountingService.getWashesForCommencmentMemo(memoDetail);
          if (washCount > 0) {
            // update wash count for commencement memoDetail
            memoDetail.minimumWashCommitment = washCount;
            const { newTaxableAmount, newCgst, newSgst, updatedTotalAmount } =
              billingAndAccountingService.getCommencmentMemoAmount(
                memoDetail,
                washCount
              );
            // update amount for commencement memoDetail
            memoDetail['taxableAmount'] = newTaxableAmount;
            memoDetail['cgst'] = newCgst;
            memoDetail['sgst'] = newSgst;
            memoDetail['totalAmount'] = updatedTotalAmount;
          }
        }
        transactionDetail.transactionMemoDetail = memoDetail;
      }

      res.locals.response = {
        message: 'Transaction Detail',
        body: { data: transactionDetail },
      };

      next();
    } catch (err) {
      next(err);
    }
  }
  async callbackWebhookComplete(req: any, res: Response, next: any) {
    try {
      const { order_id, type }: any = req.body;

      console.log(
        '🚀 ~ PaymentController ~ callbackWebhookComplete ~ req.bod:',
        req.body
      );
      console.log(
        '🚀 ~ PaymentController ~ callbackWebhookComplete ~ order_id:',
        order_id,
        '=============================='
      );
      // // new code for ccAvenue
      if (order_id) {
        const txnid = order_id;
        const transactionDetail = await getOrderStatus(txnid);
        console.log(
          '🚀 ~ PaymentController ~ callbackWebhookComplete ~ transactionDetail:',
          transactionDetail
        );

        if (transactionDetail) {
          // Handling the customer payment

          const isCustomerTxnIdExist = await CustomerPaymentTransaction.findOne(
            {
              where: { transactionId: txnid },
            }
          );

          if (isCustomerTxnIdExist) {
            await CustomerPaymentServices.callBackWebhookHandle(
              txnid,
              transactionDetail
            );
          } else {
            const isTxnIdExist = await PaymentTransaction.findOne({
              include: [
                {
                  model: Machine,
                  attributes: ['name'],
                  include: [
                    {
                      model: Outlet,
                      attributes: [
                        'outletId',
                        'dealerId',
                        'name',
                        'address',
                        'gstNo',
                      ],
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
                              attributes: [
                                'name',
                                'stateGstNo',
                                'blueverseAddress',
                              ],
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
                  ],
                },
              ],
              where: { transactionId: txnid },
            });

            if (
              isTxnIdExist &&
              (isTxnIdExist.status === config.machineMemoStatusObject.PENDING ||
                isTxnIdExist.status ===
                  config.machineMemoStatusObject.PROCESSING ||
                isTxnIdExist.status === config.machineMemoStatusObject.FAILED)
            ) {
              //Save payment transaction
              await savePaymentTransaction(
                isTxnIdExist, //Payment transaction detail
                transactionDetail, //getOrder Status api response
                txnid //orderNo
              );
            }
          }
        }
      }
      res.locals.response = {
        message: order_id ? order_id : '',
      };
      next();
    } catch (err) {
      console.log(
        '🚀 ~ PaymentController ~ callbackWebhookComplete ~ err:',
        err
      );
      next(err);
    }
  }
  //  to get machine latest advance memo detail
  async getLastAdvanceMemoDetail(req: any, res: Response, next: any) {
    try {
      const { machineId } = req.params;
      const { month, year } = req.query;
      let whereCondition: any = {
        machineId: machineId,
        type: config.machineMemoTypeObject.ADVANCE_MEMO,
        status: config.machineMemoStatusObject.PENDING,
      };
      if (month && year) {
        let start = moment().month(month).year(year).startOf('month');
        let end = moment().month(month).year(year).endOf('month');
        whereCondition['createdAt'] = {
          [Op.between]: [start.toISOString(), end.toISOString()],
        };
      }
      const memoDetails = await MachineMemo.findOne({
        attributes: ['machineMemoId', 'memoId', 'invoiceId', 'status', 'type'],
        where: whereCondition,
        order: [['createdAt', 'DESC']],
      });
      res.locals.response = {
        body: { data: memoDetails },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const paymentController = new PaymentController();
export { paymentController };
