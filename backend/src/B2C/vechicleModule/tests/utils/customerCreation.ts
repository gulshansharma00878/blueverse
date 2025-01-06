
import { CustomerAuthService } from '../../../authModule/services/auth.service';
import { Customer } from '../../../models/customer';

export const createCustomer = async () => {
  const phone: any = `${Date.now()}-${Math.floor(Math.random() * 100)}`;

  const user = await Customer.create({
    phone: phone,
  });

  // Creating the login token
  const token = await CustomerAuthService.createLoginToken(
    user.customerId,
    phone
  );

  return { token: token, customerId: user.customerId };
};
