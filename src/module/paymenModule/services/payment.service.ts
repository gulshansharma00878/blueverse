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
import { emailService } from '../../../services/common/emailService';

const payuClient = new PayU(
  {
    key: "oZ7oo9",
    salt: "UkojH5TS", // should be on server side only
  },"TEST"
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
  isTxnIdExist: any,
  transactionDetail: any,
  txnid: any
) => {
  try {
    //Check is transaction detail amount same database amount or not
    if (
      String(transactionDetail.amt.split('.')[0]) ===
      String(isTxnIdExist.amount.split('.')[0])
    ) {
      if (
        transactionDetail.status ===
        config.payUPaymentGatewayCredentials.status.success
      ) {
        let machineMemoId = null;

        //Check is transaction type topUp
        if (
          isTxnIdExist.productInfo ===
          config.payUPaymentGatewayCredentials.productInfoObject.TOPUP
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
        transactionDetail.status ===
        config.payUPaymentGatewayCredentials.status.failure
      ) {
        let machineMemoId = null;
        //Check is transaction type topUp
        if (
          isTxnIdExist.productInfo ===
          config.payUPaymentGatewayCredentials.productInfoObject.TOPUP
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
        transactionDetail.status ===
        config.payUPaymentGatewayCredentials.status.pending
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
          config.payUPaymentGatewayCredentials.productInfoObject.TOPUP
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
    });

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

    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
const updatePaymentTransaction = async (
  txnID: string,
  status: string,
  transactionDetail: any,
  machineMemoId: any
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
    // // //Create Machine Wallet Entry
    // await MachineWallet.create({
    //   description:
    //     'If wallet balance is -300 and topUp Recharge balance is 500 then we add 300 in wallet balance and remaining 200 in topUp Balance',
    //   machineId: machineId,
    //   sourceType: 'TOPUP',
    //   transactionType: config.machineWalletTransactionType.ADDED,
    //   topUpBalance: Number(updateData.topUpBalance),
    //   walletBalance: Number(updateData.walletBalance),
    //   blueverseCredit: Number(machine.blueverseCredit),
    // });
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
