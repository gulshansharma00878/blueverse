import {
  calcPercent,
  isNullOrUndefined,
  randomValueHex,
} from '../../../common/utility';
import { templateConstants } from '../../../common/templateConstants';
import { config } from '../../../config/config';
import createError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { Customer } from '../../models/customer';
import { CustomerPaymentTransaction } from '../../models/customerPaymentTrasaction';

class PaymentPolicy {
  async validateGenerateHashRequest(req: any, res: any, next: any) {
    try {
      const { surl, furl, amount, loggedInUser } = dataFromRequest(req);

      // Finding the customers details
      const customerData = await Customer.findOne({
        where: {
          customerId: loggedInUser.userId,
        },
      });

      //Check is surl is null or undefined
      if (isNullOrUndefined(surl)) {
        throw createError(404, templateConstants.PARAMETER_MISSING('surl'));
      }
      //Check is furl is null or undefined
      if (isNullOrUndefined(furl)) {
        throw createError(404, templateConstants.PARAMETER_MISSING('furl'));
      }

      //Check is amount is greater than zero or not
      if (Number(amount) <= 0) {
        throw createError(404, templateConstants.INVALID('amount'));
      }

      var stringHex = randomValueHex(4) + Date.now() + randomValueHex(4);
      let isExistStringHex = true;
      while (isExistStringHex) {
        const checkIsStringHexExist = await CustomerPaymentTransaction.findOne({
          where: { transactionId: stringHex },
        });
        if (!checkIsStringHexExist) {
          isExistStringHex = false;
        } else {
          stringHex = randomValueHex(4) + Date.now() + randomValueHex(4);
        }
      }

      //Send data to locals for using in next middleware
      res.locals.request = {
        txnid: stringHex,
        amount: amount,
        phone: customerData.phone,
        surl: surl + '/' + stringHex,
        furl: furl + '/' + stringHex,
        customer: customerData,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const paymentPolicy = new PaymentPolicy();
export { paymentPolicy };
