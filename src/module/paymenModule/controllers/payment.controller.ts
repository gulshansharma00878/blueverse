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
      } = res.locals.request;

      const { machineMemoId } = req.body;

      const hash = await _generateHash({
        txnid,
        email,
        amount,
        productinfo,
        firstname,
        phone,
        surl,
        furl,
      });
      await PaymentTransaction.create({
        email: email,
        transactionId: txnid,
        amount: Number(amount),
        productInfo: productinfo,
        username: firstname,
        phone: phone,
        surl: surl,
        furl: furl,
        generatedHash: hash,
        dealerId: dealerId,
        outletId: outletId,
        machineId: machineId,
        machineMemoId: machineMemoId ? machineMemoId : null,
        cgst: Number(cgst),
        sgst: Number(sgst),
        taxableAmount: Number(taxableAmount),
      });
      res.locals.response = {
        body: { data: { ...res.locals.request, hash: hash } },
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
          transactionDetail.addedon = isTxnIdExist.webhookResponse.addedon;
          transactionDetail.bankcode = isTxnIdExist.webhookResponse.bankcode;
          transactionDetail.mihpayid = isTxnIdExist.webhookResponse.mihpayid;
          transactionDetail.error_Message =
            isTxnIdExist.webhookResponse.error_Message;
        } else if (
          isTxnIdExist.status === config.paymentTransactionStatusObject.FAILED
        ) {
          transactionDetail.status =
            config.paymentTransactionStatusObject.FAILURE.toLocaleLowerCase();
          transactionDetail.txnid = isTxnIdExist.transactionId;
          transactionDetail.addedon = isTxnIdExist.webhookResponse.addedon;
          transactionDetail.bankcode = isTxnIdExist.webhookResponse.bankcode;
          transactionDetail.mihpayid = isTxnIdExist.webhookResponse.mihpayid;
          transactionDetail.error_Message =
            isTxnIdExist.webhookResponse.error_Message;
        } else {
          transactionDetail.status =
            config.paymentTransactionStatusObject.SUCCESS.toLocaleLowerCase();
          transactionDetail.txnid = isTxnIdExist.transactionId;
          transactionDetail.addedon = isTxnIdExist.webhookResponse.addedon;
          transactionDetail.bankcode = isTxnIdExist.webhookResponse.bankcode;
          transactionDetail.mihpayid = isTxnIdExist.webhookResponse.mihpayid;
          transactionDetail.error_Message =
            isTxnIdExist.webhookResponse.error_Message;
        }
        transactionDetail.webhookResponse = isTxnIdExist.webhookResponse;

        const memoDetail = await MachineMemo.findOne({
          where: { machineMemoId: isTxnIdExist.machineMemoId },
        });
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
      const { txnid, field9 }: any = req.body;
      //Check is txn exist or not
      if (txnid) {
        //Validate payment by transaction id
        const validate = await validatePayment(txnid);

        //Get transaction detail from payu response object
        const transactionDetail = validate.transaction_details[txnid];

        //Check is transaction detail exist or not
        if (transactionDetail) {
          //Get transaction from database
          const isTxnIdExist = await PaymentTransaction.findOne({
            where: { transactionId: txnid },
            raw: true,
          });
          //Check is this transaction exist in our database
          if (isTxnIdExist) {
            /**
             * Check database transaction status .
             * Status should be in pending state for moving to other condition.
             * If already payment status should it be change from pending
             */

            if (
              isTxnIdExist.status === config.machineMemoStatusObject.PENDING ||
              isTxnIdExist.status ===
                config.machineMemoStatusObject.PROCESSING ||
              isTxnIdExist.status === config.machineMemoStatusObject.FAILED
            ) {
              //Save payment transaction
              await savePaymentTransaction(
                isTxnIdExist,
                transactionDetail,
                txnid
              );
            }
          }
        }
      }
      res.locals.response = {
        message: field9 ? field9 : '',
      };
      next();
    } catch (err) {
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
