import {
  calcPercent,
  isNullOrUndefined,
  isValidGuid,
  randomValueHex,
} from '../../../common/utility';
import { templateConstants } from '../../../common/templateConstants';
import { config } from '../../../config/config';
import { User } from '../../../models/User/user';
import createError from 'http-errors';
import { Machine } from '../../../models/Machine/Machine';
import { Outlet } from '../../../models/outlet';
import { OutletMachine } from '../../../models/outlet_machine';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import { Op } from 'sequelize';
import moment from 'moment';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { PaymentTransaction } from '../../../models/payment_transactions';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { billingAndAccountingService } from '../../billingAndAccounting/services/billingAndAccounting.service';

class PaymentPolicy {
  async validateGenerateHashRequest(req: any, res: any, next: any) {
    try {
      const { userId, parentUserId, role, email } = res.user;
      //Check is user role dealer or not
      if (role !== config.userRolesObject.DEALER) {
        throw createError(404, templateConstants.INVALID('user'));
      }

      const { surl, furl, type, amount, machineId, machineMemoId } = req.body;
      let taxableAmount = amount ? Number(amount) : 0;
      let cgst = 0;
      let sgst = 0;
      let totalAmount = 0;

      //Get user from database
      let user = await User.findOne({
        where: { userId: parentUserId ? parentUserId : userId },
        raw: true,
        attributes: ['email', 'username', 'phone', 'role', 'userId'],
      });

      //Check is user role dealer or not
      if (user.role !== config.userRolesObject.DEALER) {
        throw createError(404, templateConstants.INVALID('user'));
      }
      //Check is surl is null or undefined
      if (isNullOrUndefined(surl)) {
        throw createError(404, templateConstants.PARAMETER_MISSING('surl'));
      }
      //Check is furl is null or undefined
      if (isNullOrUndefined(furl)) {
        throw createError(404, templateConstants.PARAMETER_MISSING('furl'));
      }

      //Check is type is null or undefined
      if (isNullOrUndefined(type)) {
        throw createError(404, templateConstants.PARAMETER_MISSING('type'));
      }

      //Check is type same as config types
      if (!config.ccAvenueDetail.productInfoArr.includes(type.toUpperCase())) {
        throw createError(404, templateConstants.INVALID('type'));
      }

      //Check is type same as topup memo or not
      if (
        type.toUpperCase() === config.ccAvenueDetail.productInfoObject.TOPUP
      ) {
        //Amount field and Amount should be greater than 0 and required

        //Check is amount is null or undefined
        if (isNullOrUndefined(amount)) {
          throw createError(404, templateConstants.PARAMETER_MISSING('amount'));
        }

        //Check is amount is greater than zero or not
        if (Number(amount) <= 0) {
          throw createError(404, templateConstants.INVALID('amount'));
        }
        cgst = calcPercent(taxableAmount, config.cgstPercentage);
        sgst = calcPercent(taxableAmount, config.sgstPercentage);
        totalAmount = Number(cgst + sgst + taxableAmount);
      }

      //Check is machine id is null or undefined
      if (isNullOrUndefined(machineId)) {
        throw createError(
          404,
          templateConstants.PARAMETER_MISSING('machineId')
        );
      }
      //Check is machine id uuid type
      if (!isValidGuid(machineId)) {
        throw createError(404, templateConstants.INVALID('machineId'));
      }

      //Get machine from database
      const machine = await Machine.findOne({
        where: { machineGuid: machineId },
        attributes: ['name', 'machineGuid', 'topUpBalance', 'walletBalance'],
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'dealerId', 'name', 'address'],
            include: [
              {
                model: User,
                attributes: [
                  'username',
                  'email',
                  'phone',
                  'countryCode',
                  'address',
                ],
              },
              {
                model: City,
                attributes: ['name'],
                include: [
                  {
                    model: State,
                    attributes: ['name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      //Check is machine null
      if (!machine) {
        throw createError(404, templateConstants.INVALID('machineId'));
      }

      //Check is machine owner same as login dealer id
      if (machine.outlet.dealerId !== user.userId) {
        throw createError(404, templateConstants.INVALID('machineId'));
      }
      if (!isNullOrUndefined(parentUserId)) {
        // check pending advance memo of this machine
        const pendingAdvanceMemoCount =
          await billingAndAccountingService.getMachinePendingAdvanceMemo(
            machineId,
            parentUserId
          );
        if (pendingAdvanceMemoCount > 0) {
          throw createError(
            404,
            'You have pending advance memo payments from previous months. Please clear them before proceeding with new payments.'
          );
        }
      }

      //Check is type wallet
      if (type === config.ccAvenueDetail.productInfoObject.WALLET) {
        /**
         * If type === WALLET machine memo id is required
         */

        //Find outlet and machine subscription
        const outletMachineSubscriptionSetting = await OutletMachine.findOne({
          where: { machineId: machineId, outletId: machine.outlet.outletId },
        });

        //If machine outlet subscription not found throw error
        if (!outletMachineSubscriptionSetting) {
          throw createError(404, templateConstants.INVALID('machineId'));
        }

        //If machine memo id is null or undefined throw error
        if (isNullOrUndefined(machineMemoId)) {
          throw createError(
            404,
            templateConstants.PARAMETER_MISSING('machineMemoId')
          );
        }

        //Find machine memo
        const machineMemo = await MachineMemo.findOne({
          where: {
            machineMemoId: machineMemoId,
            outletId: machine.outlet.outletId,
            machineId: machine.machineGuid,
          },
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

        //If machine memo is null throw error
        if (!machineMemo) {
          throw createError(404, templateConstants.INVALID('machineMemoId'));
        }
        //If wallet payment already paid
        if (machineMemo.status === config.machineMemoStatusObject.PAID) {
          throw createError(404, templateConstants.INVALID('machineMemoId'));
        }
        totalAmount = machineMemo.totalAmount;
        taxableAmount = machineMemo.taxableAmount;
        sgst = machineMemo.sgst;
        cgst = machineMemo.cgst;
        // Get updated amount for commencement memo
        if (machineMemo.type === config.machineMemoTypeObject.ADVANCE_MEMO) {
          const washCount =
            billingAndAccountingService.getWashesForCommencmentMemo(
              machineMemo
            );
          if (washCount > 0) {
            const { newTaxableAmount, newCgst, newSgst, updatedTotalAmount } =
              billingAndAccountingService.getCommencmentMemoAmount(
                machineMemo,
                washCount
              );
            totalAmount = Number(updatedTotalAmount);
            taxableAmount = newTaxableAmount;
            cgst = newCgst;
            sgst = newSgst;
          }
        }
      }
      var stringHex = randomValueHex(4) + Date.now() + randomValueHex(4);
      let isExistStringHex = true;
      while (isExistStringHex) {
        const checkIsStringHexExist = await PaymentTransaction.findOne({
          where: { transactionId: stringHex },
        });
        if (!checkIsStringHexExist) {
          isExistStringHex = false;
        } else {
          stringHex = randomValueHex(4) + Date.now() + randomValueHex(4);
        }
      }

      if (type === config.ccAvenueDetail.productInfoObject.WALLET) {
        /**
         * Check is wallet already recharge or not
         */
        const machineWallet = await MachineWallet.findOne({
          where: {
            machineId: machine.machineGuid,
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

        if (
          process.env.NODE_ENV !== 'development' &&
          process.env.NODE_ENV !== 'qa'
        ) {
          //If wallet already recharge then throw error
          if (machineWallet) {
            throw createError(
              404,
              "This month's wallet recharge is already done."
            );
          }
        }
      }

      //Send data to locals for using in next middleware
      res.locals.request = {
        txnid: stringHex,
        email: email,
        amount: String(totalAmount),
        cgst: cgst ? cgst : 0,
        sgst: sgst ? sgst : 0,
        taxableAmount: taxableAmount ? taxableAmount : 0,
        productinfo: type.toUpperCase(),
        firstname: user.username,
        phone: user.phone,
        surl: surl + '/' + stringHex,
        furl: furl + '/' + stringHex,
        dealerId: user.userId,
        outletId: machine.outlet.outletId,
        machineId: machine.machineGuid,
        machine,
      };

      next();
    } catch (err) {
      next(err);
    }
  }
}
const paymentPolicy = new PaymentPolicy();
export { paymentPolicy };
