import { Request, Response, NextFunction } from 'express';
import { CustomerAuthService } from '../services/auth.service';
import { CreateCustomerDTO } from '../dto/customer.dto';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import stringConstants from '../../../common/stringConstants';
import { messageService } from '../../../services/common/messageService';
import { config } from '../../../config/config';
import { Referral } from '../../models/reffer';
import { isNullOrUndefined } from '../../../common/utility';
import { Customer } from '../../models/customer';
import { generateUniqueReferralCode } from '../../../services/commonService';
import { WashWalletService } from '../../washWalletModule/services/wallet.service';
import { UserWashWallet } from '../../models/user_wash_wallet';
import {
  WashTypeConstant,
  WashWalletTransaction,
} from '../../models/wash_wallet_transaction';
import { TransactionType } from '../../models/wallet_transection';

export class AuthController {
  private authService: typeof CustomerAuthService;
  constructor() {
    this.authService = CustomerAuthService;
  }

  async register(req: Request, res: Response) {
    try {
      const userData: CreateCustomerDTO = req.body;
      const result = await this.authService.createUser(userData);
      return createResponseObject(
        res,
        CONSTANT.CUSTOMER_REGISTER_SUCCESSFULLY,
        result,
        200
      );
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async sendOtpToMobile(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = dataFromRequest(req);

      if (config.serverConfig.env != 'development') {
        // Sending the otp to given phone number
        await messageService.sendOtpForLoginOrSignup(phone);
      }

      res.locals.response = {
        message: stringConstants.genericMessage.OTP_SEND_SUCCESSFULLY,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, deviceToken } = dataFromRequest(req);

      // Fetching the details if exists or create the new user
      const userData: any = await this.authService.createOrGetUser(phone);

      // Creating  login token
      const token = await this.authService.createLoginToken(
        userData.customerId,
        phone
      );

      userData.token = token;

      // If Device token is receive
      if (deviceToken) {
        await this.authService.createDeviceToken(
          userData.customerId,
          deviceToken
        );
      }

      res.locals.response = {
        message: stringConstants.genericMessage.OTP_VERIFIED_SUCCESSFULLY,
        body: { data: { userData: userData } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);

      // Updating the customer details
      const userData = await this.authService.getCustomer(
        data.loggedInUser.userId
      );

      res.locals.response = {
        message: stringConstants.genericMessage.LIST_OF_CUSTOMER,
        body: { data: { userData: userData } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);

      // Log out the current user
      await this.authService.logout(data.loggedInUser.userId);

      res.locals.response = {
        message: stringConstants.genericMessage.LOG_OUT,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async socialSignUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, auth_token, unique_key, deviceToken, referralCode } =
        req.body;
      let { user, firstName, lastName } = res.locals.request.user;

      let isExists = true;

      if (isNullOrUndefined(user)) {
        user = await Customer.create({
          email: email ? email.toLowerCase() : '',
          unique_key: unique_key,
          is_social_login: true,
          firstName: firstName ? firstName : '',
          lastName: lastName ? lastName : '',
          userReferralCode: await generateUniqueReferralCode(),
        });

        isExists = false;

        const washWalletData = await WashWalletService.getUserWashWallet(
          user.customerId
        );

        await UserWashWallet.increment(
          { freeWash: 1 }, // `balance` here is the amount to be added to the existing balance
          {
            where: {
              customerId: user.customerId, // Condition to match the user by their customerId
            },
          }
        );

        // Making the transaction History
        await WashWalletTransaction.create({
          washWalletId: washWalletData.washWalletId,
          washBalance: 1,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.FREE_WASH,
          washType: WashTypeConstant.SILVER,
        });
      } else {
        if (
          (!user.is_social_login && !user.is_active && !user.is_verified) ||
          (!user.is_social_login && user.is_active && user.is_verified)
        ) {
          await Customer.update(
            {
              unique_key: unique_key,
              is_social_login: true,
            },
            { where: { customerId: user.customerId } }
          );
        }
      }
      if (!isNullOrUndefined(user)) {
        const token = await CustomerAuthService.createLoginToken(
          user.customerId,
          user.email
        );

        if (deviceToken) {
          await CustomerAuthService.createDeviceToken(
            user.customerId,
            deviceToken
          );
        }

        let data = {
          token: token,
          customerId: user.customerId,
          deviceToken: req.body.deviceToken,
          user_id: user.user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: email,
          userReferralCode: user.userReferralCode,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isExists: isExists,
          isActive: user.isActive,
          is_social_login: true,
        };

        res.locals.response = {
          body: {
            data: {
              user: {
                ...data,
              },
            },
          },
          message: stringConstants.userControllerMessage.LOGGED_IN,
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async applyReferralCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { referralCode, loggedInUser } = dataFromRequest(req);
      console.log("🚀 ~ AuthController ~ applyReferralCode ~ referralCode:", referralCode)

      // If the user was referred, create a referral record
      if (referralCode) {
        await this.authService.createReferral(
          loggedInUser.userId,
          referralCode
        );
      }

      res.locals.response = {
        message: stringConstants.genericMessage.REFERRAL_APPLIED,
        body: {},
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const authController = new AuthController();
export { authController };
