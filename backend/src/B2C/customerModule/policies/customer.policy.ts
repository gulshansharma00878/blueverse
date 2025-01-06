import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { CONSTANT } from '../constant';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { Customer } from '../../models/customer';
import { Op } from 'sequelize';

class ValidateCustomerApis {
  async validateCustomerActivationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destruct the value from request body
      const { isActive } = dataFromRequest(req);

      if (
        isActive != CONSTANT.USER_ACTIVATED &&
        isActive != CONSTANT.USER_DEACTIVATED
      ) {
        throw createHttpError(400, CONSTANT.KEY_OUT_OF_RANGE);
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateCustomerPhone(req: Request, res: Response, next: NextFunction) {
    try {
      // Destruct the value from request body
      const { phone, loggedInUser, email } = dataFromRequest(req);

      const customerData = await Customer.findOne({
        where: {
          isDeleted: false,
          phone: phone,
          customerId: {
            [Op.ne]: loggedInUser.userId,
          },
        },
      });
      if (customerData) {
        throw createHttpError(400, CONSTANT.PHONE_NUMBER_EXISTS);
      }

      if (email) {
        const data = await Customer.findOne({
          where: {
            isDeleted: false,
            email: email,
            customerId: {
              [Op.ne]: loggedInUser.userId,
            },
          },
        });
        if (data) {
          throw createHttpError(400, CONSTANT.EMAIL_NUMBER_EXISTS);
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateCustomerApis = new ValidateCustomerApis();
export { validateCustomerApis };
