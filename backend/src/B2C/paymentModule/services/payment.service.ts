import { UserWallet } from '../../models/user_wallet';
import { CustomerPaymentTransaction } from '../../models/customerPaymentTrasaction';
import { config } from '../../../config/config';
import {
  TransactionType,
  WalletTransaction,
} from '../../models/wallet_transection';
import { WalletService } from '../../walletModule/services/wallet.service';

class PaymentServices {
  async callBackWebhookHandle(txnid: string, transactionDetail: any) {
    try {
      const isTxnIdExist = await CustomerPaymentTransaction.findOne({
        where: { transactionId: txnid },
      });

      if (isTxnIdExist) {
        if (
          isTxnIdExist.status === config.machineMemoStatusObject.PENDING ||
          isTxnIdExist.status === config.machineMemoStatusObject.PROCESSING ||
          isTxnIdExist.status === config.machineMemoStatusObject.FAILED
        ) {
          await this.savePaymentTransaction(
            isTxnIdExist,
            transactionDetail,
            txnid
          );
        }
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async savePaymentTransaction(
    isTxnIdExist: any, //Payment transaction model response
    transactionDetail: any, //get oRder Status response
    txnid: any //orderNo
  ) {
    try {
      const { customerId, amount } = isTxnIdExist;

      if (
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.successful ||
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.shipped
      ) {
        // Increment the user's wallet balance
        await UserWallet.increment(
          { balance: amount },
          { where: { customerId: customerId } }
        );

        // Getting the user wallet data
        const walletData = await WalletService.getUserWallet(customerId);

        // Create a wallet transaction record
        // Making the transaction History
        await WalletTransaction.create({
          walletId: walletData.walletId,
          amount: amount,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.TOPUP,
        });

        //Update payment transaction
        await this.updatePaymentTransaction(
          txnid,
          'SUCCESS',
          transactionDetail
        );
      }
      if (
        transactionDetail.order_status.toLowerCase() ===
        config.ccAvenueDetail.status.unsuccessful
      ) {
        //Update payment transaction
        await this.updatePaymentTransaction(txnid, 'FAILED', transactionDetail);
      }
      if (
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.awaited ||
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.initiated
      ) {
        await this.updatePaymentTransaction(
          txnid,
          config.machineMemoStatusObject.PROCESSING,
          transactionDetail
        );
      }

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updatePaymentTransaction(
    txnID: string, //orderNo
    status: string, //status external
    transactionDetail: any //get oRder Status response
  ) {
    try {
      await CustomerPaymentTransaction.update(
        { webhookResponse: transactionDetail, status: status },
        { where: { transactionId: txnID } }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const CustomerPaymentServices = new PaymentServices();
export { CustomerPaymentServices };
