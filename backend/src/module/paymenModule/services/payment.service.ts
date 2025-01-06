const PayU = require('payu-websdk');
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { config } from '../../../config/config';
import { Machine } from '../../../models/Machine/Machine';
import { calcPercent } from '../../../common/utility';
import moment from 'moment';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import { OutletMachine } from '../../../models/outlet_machine';
import { PaymentTransaction } from '../../../models/payment_transactions';
import { Op } from 'sequelize';
import { notificationService } from '../../../services/notifications/notification';
import { notificationConstant } from '../../../common/notificationConstants';
import { emailService } from '../../../services/common/emailService';
import { getMemoDetailForJsonb } from '../../../services/commonService';
import { logger } from '../../../services/logger/logger';

const payuClient = new PayU(
  {
    key: config.payUPaymentGatewayCredentials.merchantKey,
    salt: config.payUPaymentGatewayCredentials.merchantSaltKeyVersionOne, // should be on server side only
  },
  config.payUPaymentGatewayCredentials.ENVIRONMENT
); // Possible value  = TEST/LIVE

/**
 * Generate Payment Hash (Initiate Payment)
 * @param param0
 * @returns
 */
export const generateHash = async ({
  txnid,
  email,
  amount,
  productinfo,
  firstname,
  phone,
  surl,
  furl,
}: any) => {
  try {
    return await payuClient.paymentInitiate({
      txnid: txnid,
      email: email,
      amount: String(amount),
      productinfo: productinfo,
      firstname: firstname,
      phone: phone,
      surl: surl,
      furl: furl,
    });
  } catch (err) {
    return Promise.reject(err);
  }
};
export const savePaymentTransaction = async (
  isTxnIdExist: any, //Payment transaction model response
  transactionDetail: any, //getoRder Status response
  txnid: any //orderNo
) => {
  try {
    //Check is transaction detail amount same database amount or not
    if (
      String(transactionDetail.order_amt.toString().split('.')[0]) ===
      String(isTxnIdExist.amount.split('.')[0])
    ) {
      if (
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.successful ||
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.shipped
      ) {
        let machineMemoId = null;
        //Check is transaction type topUp
        if (
          isTxnIdExist.productInfo ===
          config.ccAvenueDetail.productInfoObject.TOPUP
        ) {
          if (isTxnIdExist.status !== config.machineMemoStatusObject.FAILED) {
            //Save if transaction type topUp success
            machineMemoId = await saveTopUpSuccessPayment(isTxnIdExist);
          } else if (
            isTxnIdExist.status === config.machineMemoStatusObject.FAILED
          ) {
            machineMemoId = await saveTopUpFailedToSuccessPayment(isTxnIdExist);
          }
        } else {
          //Save if transaction type wallet success
          await saveWalletSuccessPayment(isTxnIdExist);
        }
        //Update payment transaction
        await updatePaymentTransaction(
          txnid,
          'SUCCESS',
          transactionDetail,
          machineMemoId
        );
      }
      if (
        transactionDetail.order_status.toLowerCase() ===
        config.ccAvenueDetail.status.unsuccessful
      ) {
        let machineMemoId = null;
        //Check is transaction type topUp
        if (
          isTxnIdExist.productInfo ===
          config.ccAvenueDetail.productInfoObject.TOPUP
        ) {
          //Save if transaction type topUp failure
          machineMemoId = await saveTopUpFailPayment(isTxnIdExist);
        } else {
          //Save if transaction type wallet failure
          await saveWalletFailPayment(isTxnIdExist);
        }
        //Update payment transaction
        await updatePaymentTransaction(
          txnid,
          'FAILED',
          transactionDetail,
          machineMemoId
        );
      }
      if (
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.awaited ||
        transactionDetail.order_status.toLowerCase() ===
          config.ccAvenueDetail.status.initiated
      ) {
        await updatePaymentTransaction(
          txnid,
          config.machineMemoStatusObject.PROCESSING,
          transactionDetail,
          ''
        );
        //Check is transaction type topUp
        if (
          isTxnIdExist.productInfo ===
          config.ccAvenueDetail.productInfoObject.TOPUP
        ) {
        } else {
          // Save if transaction type wallet pending
          //Update machine memo
          await MachineMemo.update(
            {
              status: config.machineMemoStatusObject.PROCESSING,
              paidOn: new Date(),
            },
            { where: { machineMemoId: isTxnIdExist.machineMemoId } }
          );
        }
      }
    }
    return;
  } catch (err) {
    logger.error('Error in firebase notifications of device', err);
    return Promise.reject(err);
  }
};

/**
 * Validate payment is exist or not
 * @param txnID
 * @returns
 */
export const validatePayment = async (txnID: string) => {
  try {
    return await payuClient.verifyPayment(txnID);
  } catch (err) {
    return Promise.reject(err);
  }
};

/**
 * Generate Unique MemoId
 * @param memoType : ex - TM - AM - TI - BC
 * @param type - ex - ADVANCE_MEMO - TOPUP_MEMO - TAX_INVOICE - BLUEVERSE_CREDIT
 * @returns UniqueId string ex : TM/BE/001
 */
export const getMemoUniqueID = async (memoType: string, type: string) => {
  try {
    let format = memoType + '/' + 'BV' + '/';
    const lastEntry = await MachineMemo.count({
      where: { type: type },
    });
    return format + (lastEntry + 1);
  } catch (err) {
    return Promise.reject(err);
  }
};
/**
 * This function create for save topUp failed payment
 * @param isTxnIdExist Object
 * @returns
 */
export const saveTopUpFailPayment = async (isTxnIdExist: any) => {
  try {
    //Generate memo unique id
    const memoId = await getMemoUniqueID(
      'TM',
      config.machineMemoTypeObject.TOPUP_MEMO
    );

    //Create Machine Memo for topUp
    const memo = await MachineMemo.create({
      memoId: memoId,
      machineId: isTxnIdExist.machineId,
      dealerId: isTxnIdExist.dealerId,
      dueDate: new Date(),
      month: String(moment(new Date()).get('month') + 1),
      status: config.machineMemoStatusObject.FAILED,
      type: config.machineMemoTypeObject.TOPUP_MEMO,
      paidOn: new Date(),
      outletId: isTxnIdExist.outletId,
      taxableAmount: Number(isTxnIdExist.taxableAmount),
      cgst: Number(isTxnIdExist.sgst),
      sgst: Number(isTxnIdExist.cgst),
      totalAmount: Number(isTxnIdExist.amount),
      memoDetail: getMemoDetailForJsonb(isTxnIdExist.machine),
    });
    if (memo) {
      // Notifications

      // FOR ADMIN
      const { type: adminNotiType, url: adminNotiUrl } =
        notificationConstant.adminNotificationObject.DEALER_PAYMENT_FAILED;

      const notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: memo?.machineMemoId,
        },
        type: adminNotiType,
        link: `${adminNotiUrl}/${memo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // FOR DEALER
      const { type: dealerNotiType, url: dealerNotiUrl } =
        notificationConstant.dealerNotificationObject.PAYEMENT_FAILED;
      const notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: memo?.machineMemoId,
        },
        userId: memo?.dealerId,
        type: dealerNotiType,
        link: `${dealerNotiUrl}/${memo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
    }

    return memo.machineMemoId;
  } catch (err) {
    return Promise.reject(err);
  }
};
/**
 * This function create for save topUp success payment
 * @param isTxnIdExist Object
 * @returns
 */
export const saveTopUpSuccessPayment = async (isTxnIdExist: any) => {
  try {
    //Calculate amount
    const { machineBalance } = await calculateAmount(
      isTxnIdExist.machineId,
      isTxnIdExist.amount
    );

    //Get memo unique id
    const memoId = await getMemoUniqueID(
      'TM',
      config.machineMemoTypeObject.TOPUP_MEMO
    );
    //Save success topUp memo
    const memo = await MachineMemo.create({
      memoId: memoId,
      machineId: isTxnIdExist.machineId,
      dealerId: isTxnIdExist.dealerId,
      dueDate: new Date(),
      month: String(moment(new Date()).get('month') + 1),
      status: config.machineMemoStatusObject.PAID,
      paidOn: new Date(),
      type: config.machineMemoTypeObject.TOPUP_MEMO,
      outletId: isTxnIdExist.outletId,
      taxableAmount: Number(isTxnIdExist.taxableAmount),
      cgst: Number(isTxnIdExist.cgst),
      sgst: Number(isTxnIdExist.sgst),
      totalAmount: Number(isTxnIdExist.amount),
      memoDetail: getMemoDetailForJsonb(isTxnIdExist.machine),
    });
    //Update machine topUp balance
    await Machine.update(
      {
        topUpBalance:
          Number(machineBalance.topUpBalance) + Number(isTxnIdExist.amount),
      },
      { where: { machineGuid: isTxnIdExist.machineId } }
    );

    //Create Machine Wallet Entry
    await MachineWallet.create({
      description: 'TopUp Recharge Successful',
      machineId: isTxnIdExist.machineId,
      sourceType: 'TOPUP',
      transactionType: config.machineWalletTransactionType.ADDED,
      cgst: Number(isTxnIdExist.cgst),
      sgst: Number(isTxnIdExist.sgst),
      topUpBalance:
        Number(machineBalance.topUpBalance) + Number(isTxnIdExist.amount),
      baseAmount: Number(isTxnIdExist.taxableAmount),
      walletBalance: Number(machineBalance.walletBalance),
      blueverseCredit: Number(machineBalance.blueverseCredit),
      totalAmount: Number(isTxnIdExist.amount),
    });
    if (Number(machineBalance.walletBalance) < 0) {
      await topUpBalanceMoveToWalletBalance(
        isTxnIdExist.machineId,
        isTxnIdExist.amount
      );
    }
    if (memo) {
      //NOTIFICATIONS
      // notifications for admin for TOPUP GENERATE
      const { type: adminNotiType, url: adminNotiUrl } =
        notificationConstant.adminNotificationObject.TOPU_UP_GENERATE;
      let notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: memo?.machineMemoId,
        },
        type: adminNotiType,
        link: `${adminNotiUrl}/${memo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // notifications to admin for success payment
      const { type: adminPayNotiType, url: adminPayNotiUrl } =
        notificationConstant.adminNotificationObject.DEALER_PAYMENT_DONE;

      notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: memo?.machineMemoId,
        },
        type: adminPayNotiType,
        link: `${adminPayNotiUrl}/${memo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // notifications for dealer
      const { type: dealerNotiType, url: dealerNotiUrl } =
        notificationConstant.dealerNotificationObject.TOP_UP_GENERATE_BY_ADMIN;
      let notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: memo?.machineMemoId,
        },
        userId: memo?.dealerId,
        type: dealerNotiType,
        link: `${dealerNotiUrl}/${memo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
      // notification to dealer for success payment
      const { type: dealerPayNotiType, url: dealerPayNotiUrl } =
        notificationConstant.dealerNotificationObject.PAYEMENT_SUCCESS;
      notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: memo?.machineMemoId,
        },
        userId: memo?.dealerId,
        type: dealerPayNotiType,
        link: `${dealerPayNotiUrl}/${memo?.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
    }

    return memo.machineMemoId;
  } catch (err) {
    return Promise.reject(err);
  }
};
/**
 * This function create for save wallet failed payment
 * @param isTxnIdExist Object
 * @returns
 */
export const saveWalletFailPayment = async (isTxnIdExist: any) => {
  try {
    // advance memo failed
    //Update machine memo
    const memo = await MachineMemo.update(
      {
        status: config.machineMemoStatusObject.FAILED,
        paidOn: new Date(),
      },
      { where: { machineMemoId: isTxnIdExist.machineMemoId } }
    );
    // notification for fail advance memo payment
    if (memo) {
      const { type: adminNotiType, url: adminNotiUrl } =
        notificationConstant.adminNotificationObject
          .ADVANCE_MEMO_PAYMENT_FAILED;
      let notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: isTxnIdExist.machineMemoId,
        },
        type: adminNotiType,
        link: `${adminNotiUrl}/${isTxnIdExist.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // dealer notification
      const { type: dealerNotiType, url: dealerNotiUrl } =
        notificationConstant.dealerNotificationObject
          .ADVANCE_MEMO_PAYMENT_FAILED;
      const notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: isTxnIdExist.machineMemoId,
        },
        userId: isTxnIdExist.dealerId,
        type: dealerNotiType,
        link: `${dealerNotiUrl}/${isTxnIdExist.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
/**
 * This function create for save wallet success payment
 * @param isTxnIdExist Object
 * @returns
 */
export const saveWalletSuccessPayment = async (isTxnIdExist: any) => {
  try {
    //Calculate payment
    const { machineBalance } = await calculateAmount(
      isTxnIdExist.machineId,
      isTxnIdExist.amount
    );

    // Update machine memo
    await MachineMemo.update(
      {
        status: config.machineMemoStatusObject.PAID,
        paidOn: new Date(),
      },
      { where: { machineMemoId: isTxnIdExist.machineMemoId } }
    );
    const amountToSave =
      Number(machineBalance.walletBalance) + Number(isTxnIdExist.amount);

    //Update Machine wallet balance
    await Machine.update(
      {
        walletBalance: amountToSave,
      },
      { where: { machineGuid: isTxnIdExist.machineId } }
    );
    // machine advance memo paid
    // Update Machine wallet : wallet balance
    const machineWallet = await MachineWallet.create({
      description: 'Wallet Recharge Successful',
      machineId: isTxnIdExist.machineId,
      sourceType: isTxnIdExist.productInfo,
      transactionType: config.machineWalletTransactionType.ADDED,
      cgst: Number(isTxnIdExist.cgst),
      sgst: Number(isTxnIdExist.sgst),
      topUpBalance: Number(machineBalance.topUpBalance),
      baseAmount: Number(isTxnIdExist.taxableAmount),
      walletBalance: amountToSave,
      blueverseCredit: Number(machineBalance.blueverseCredit),
      totalAmount: Number(isTxnIdExist.amount),
    });

    // Notification  for advance memo paid
    if (machineWallet) {
      // admin
      const { type: adminNotiType, url: adminNotiUrl } =
        notificationConstant.adminNotificationObject
          .ADVANCE_MEMO_PAYMENT_SUCCESS;
      let notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: isTxnIdExist.machineMemoId,
        },
        type: adminNotiType,
        link: `${adminNotiUrl}/${isTxnIdExist.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // dealer
      // dealerid=isTxnIdExist.dealerId
      const { type: dealerNotiType, url: dealerNotiUrl } =
        notificationConstant.dealerNotificationObject
          .ADVANCE_MEMO_PAYMENT_SUCCESS;
      const notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: isTxnIdExist.machineMemoId,
        },
        userId: isTxnIdExist.dealerId,
        type: dealerNotiType,
        link: `${dealerNotiUrl}/${isTxnIdExist.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
    }

    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
const updatePaymentTransaction = async (
  txnID: string, //orderNo
  status: string, //status external
  transactionDetail: any, //getoRder Status response
  machineMemoId: any //external macineMemoId
) => {
  try {
    if (machineMemoId) {
      await PaymentTransaction.update(
        {
          webhookResponse: transactionDetail,
          status: status,
          machineMemoId: machineMemoId,
        },
        { where: { transactionId: txnID } }
      );
    } else {
      await PaymentTransaction.update(
        { webhookResponse: transactionDetail, status: status },
        { where: { transactionId: txnID } }
      );
    }
  } catch (err) {
    return Promise.reject(err);
  }
};
export const calculateAmount = async (machineId: string, amount: number) => {
  try {
    const machineBalance = await Machine.findOne({
      where: { machineGuid: machineId },
      attributes: ['topUpBalance', 'walletBalance', 'blueverseCredit'],
      raw: true,
    });

    return {
      machineBalance: machineBalance,
    };
  } catch (err) {
    return Promise.reject(err);
  }
};

const saveTopUpFailedToSuccessPayment = async (isTxnIdExist: any) => {
  try {
    const paymentTransaction = await PaymentTransaction.findOne({
      where: { transactionId: isTxnIdExist.transactionId },
      raw: true,
    });
    //Calculate amount
    const { machineBalance } = await calculateAmount(
      isTxnIdExist.machineId,
      isTxnIdExist.amount
    );
    //update advance memo
    await MachineMemo.update(
      { status: config.machineMemoStatusObject.PAID },
      { where: { machineMemoId: paymentTransaction.machineMemoId } }
    );
    //Update machine topUp balance
    await Machine.update(
      {
        topUpBalance:
          Number(machineBalance.topUpBalance) + Number(isTxnIdExist.amount),
      },
      { where: { machineGuid: isTxnIdExist.machineId } }
    );

    //Create Machine Wallet Entry
    await MachineWallet.create({
      description: 'TopUp Recharge Successful',
      machineId: isTxnIdExist.machineId,
      sourceType: 'TOPUP',
      transactionType: config.machineWalletTransactionType.ADDED,
      cgst: Number(isTxnIdExist.cgst),
      sgst: Number(isTxnIdExist.sgst),
      topUpBalance:
        Number(machineBalance.topUpBalance) + Number(isTxnIdExist.amount),
      baseAmount: Number(isTxnIdExist.taxableAmount),
      walletBalance: Number(machineBalance.walletBalance),
      blueverseCredit: Number(machineBalance.blueverseCredit),
      totalAmount: Number(isTxnIdExist.amount),
    });
    if (Number(machineBalance.walletBalance) < 0) {
      await topUpBalanceMoveToWalletBalance(
        isTxnIdExist.machineId,
        isTxnIdExist.amount
      );
    }

    //NOTIFICATION FOR TOPUP GENERATE
    if (paymentTransaction) {
      // notifications for admin
      const { type: adminNotiType, url: adminNotiUrl } =
        notificationConstant.adminNotificationObject.TOPU_UP_GENERATE;

      let notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: paymentTransaction.machineMemoId,
        },
        type: adminNotiType,
        link: `${adminNotiUrl}/${paymentTransaction.machineMemoId}`,
      };
      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // notifications to admin for success payment
      const { type: adminPayNotiType, url: adminPayNotiUrl } =
        notificationConstant.adminNotificationObject.DEALER_PAYMENT_DONE;
      notificationBodyAdmin = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: paymentTransaction.machineMemoId,
        },
        type: adminPayNotiType,
        link: `${adminPayNotiUrl}/${paymentTransaction.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.ADMIN,
        notificationBodyAdmin
      );

      // notifications for dealer
      const { type: dealerNotiType, url: dealerNotiUrl } =
        notificationConstant.dealerNotificationObject.TOP_UP_GENERATE_BY_ADMIN;

      let notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: paymentTransaction.machineMemoId,
        },
        userId: paymentTransaction?.dealerId,
        type: dealerNotiType,
        link: `${dealerNotiUrl}/${paymentTransaction.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );

      // notification to dealer for success payment
      const { type: dealerPayNotiType, url: dealerPayNotiUrl } =
        notificationConstant.dealerNotificationObject.PAYEMENT_SUCCESS;

      notificationBodyDealer = {
        modelDetail: {
          name: 'MachineMemo',
          uuid: paymentTransaction.machineMemoId,
        },
        userId: paymentTransaction?.dealerId,
        type: dealerPayNotiType,
        link: `${dealerPayNotiUrl}/${paymentTransaction.machineMemoId}`,
      };

      notificationService.generateNotification(
        config.userRolesObject.DEALER,
        notificationBodyDealer
      );
    }
    return paymentTransaction.machineMemoId;
  } catch (err) {
    return Promise.reject(err);
  }
};

const topUpBalanceMoveToWalletBalance = async (
  machineId: string,
  amount: any
) => {
  try {
    const machine = await Machine.findOne({
      where: { machineGuid: machineId },
      raw: true,
      attributes: ['topUpBalance', 'walletBalance', 'blueverseCredit'],
    });
    const topUpAmountRemaining = Number(machine.walletBalance) + Number(amount);
    let updateData = {
      walletBalance: topUpAmountRemaining,
      topUpBalance: 0,
    };
    if (topUpAmountRemaining > 0) {
      updateData = {
        walletBalance: 0,
        topUpBalance: topUpAmountRemaining,
      };
    }
    await Machine.update(updateData, { where: { machineGuid: machineId } });
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
