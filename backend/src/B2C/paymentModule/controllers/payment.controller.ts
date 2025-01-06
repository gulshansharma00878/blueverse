import { templateConstants } from '../../../common/templateConstants';
import { config } from '../../../config/config';
import {
  ccPaymentIntEncrypt,
  getOrderStatus,
} from '../../../services/common/ccAvenue/ccAvenue';
import { CustomerPaymentTransaction } from '../../models/customerPaymentTrasaction';

class PaymentController {
  async generateHash(req: any, res: any, next: any) {
    try {
      let { txnid, email, amount, phone, surl, furl, customer } =
        res.locals.request;

      const paymentBody: any = {
        merchant_id: config.ccAvenueDetail.merchantId,
        order_id: txnid,
        type: 'customer',
        currency: config.ccAvenueDetail.currency,
        amount: amount,
        redirect_url: surl,
        cancel_url: furl,
        billing_name: customer.firstName,
        billing_address: customer.address,
        billing_city: customer.city,
        billing_state: customer.state,
        billing_country: config.ccAvenueDetail.country,
        billing_tel: customer.phone,
        billing_email: customer.email,
      };
      const { enc, form } = ccPaymentIntEncrypt(paymentBody);
      await CustomerPaymentTransaction.create({
        email: email,
        transactionId: txnid,
        amount: Number(amount),
        phone: phone,
        surl: surl,
        furl: furl,
        generatedHash: enc,
        customerId: customer.customerId,
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
}
const paymentController = new PaymentController();
export { paymentController };
