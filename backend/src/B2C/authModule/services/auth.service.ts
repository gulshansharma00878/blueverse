import { Op } from 'sequelize';
import { Customer } from '../../models/customer';
import { passwordService } from '../../../services/user/passwordService';
import { jwtService } from '../../../services/user/jwtService';
import { tokenService } from '../../../services/common/tokenService';
import { config } from '../../../config/config';
import { CreateCustomerDTO } from '../dto/customer.dto';
import { generateUniqueReferralCode } from '../../../services/commonService';
import { Status } from '../../models/booking';
import { Referral } from '../../models/reffer';
import { CustomerDeviceToken } from '../../models/customerDeviceToken';
import { UserWashWallet } from '../../models/user_wash_wallet';
import { WashWalletService } from '../../washWalletModule/services/wallet.service';
import {
  WashTypeConstant,
  WashWalletTransaction,
} from '../../models/wash_wallet_transaction';
import { TransactionType } from '../../models/wallet_transection';
import { ReferAndEarn } from '../../models/refer_earn_setting';
import moment from 'moment';
import { CustomerNotification } from '../../models/customerNotification';
import { BookingService } from '../../bookingModule/services/booking.service';
import { sendFirebaseNotificationWithData } from '../../../services/common/firebaseService/firebaseNotification';

class AuthService {
  private readonly passwordService: any;
  private readonly jwtService: any;
  private readonly tokenService: any;

  constructor(passwordService: any, jwtService: any, tokenService: any) {
    this.passwordService = passwordService;
    this.jwtService = jwtService;
    this.tokenService = tokenService;
  }

  async createUser(data: CreateCustomerDTO) {
    try {
      const passwordHash = await this.passwordService.hashPassword(
        data.password
      );
      const user = await Customer.create({
        email: data.email.toLowerCase(),
        password: passwordHash,
        //  username: data.username,
      });

      const userDetails = {
        userId: user.customerId,
        //username: user.username,
        email: user.email,
      };

      const token = await this.jwtService.generateToken(userDetails);
      await this.tokenService.setToken(
        user.customerId,
        token,
        config.authConfig.tokenExpiry
      );
      return {
        token,
        user: userDetails,
      };
    } catch (err) {
      console.log('err ', err);
      throw err;
    }
  }
  async createLoginToken(customerId: string, phone: string) {
    try {
      const token = await jwtService.generateToken({
        userId: customerId,
        phone: phone,
      });
      await tokenService.setToken(
        customerId,
        token,
        config.authConfig.tokenExpiry
      );
      return token;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async createOrGetUser(phone: any) {
    try {
      // Declaring the where condition
      let whereCondition: any = {
        phone: phone,
        isDeleted: false,
      };

      // Try to find user exists or not
      let userData = await Customer.findOne({
        where: whereCondition,
        include: [
          {
            model: Referral,
          },
        ],
      });

      let userDetails: any;

      if (userData) {
        userDetails = {
          customerId: userData.dataValues.customerId,
          firstName: userData.dataValues.firstName,
          lastName: userData.dataValues.lastName,
          city: userData.dataValues.city,
          state: userData.dataValues.state,
          email: userData.dataValues.email,
          lastLogin: userData.dataValues.lastLogin,
          phone: phone,
          isExists: true,
          isActive: userData.dataValues.isActive,
          userReferralCode: userData.dataValues.userReferralCode,
          referralsMade: userData.dataValues.referralsMade,
          address: userData.dataValues.address,
          gender: userData.dataValues.gender,
          is_social_login: userData.dataValues.is_social_login,
        };

        // updating the last login date
        await Customer.update(
          {
            lastLogin: new Date(),
          },
          {
            where: {
              customerId: userData.dataValues.customerId,
            },
          }
        );
      } else {
        // Creating the new entry in data base
        const user = await Customer.create({
          phone: phone,
          lastLogin: new Date(),
          userReferralCode: await generateUniqueReferralCode(),
        });

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

        userDetails = {
          customerId: user.customerId,
          phone: user.phone,
          isExists: false,
        };

        let description = 'Your have been awarded by one silver wash';
        let title = 'Free wash';
        // Creating the notification for customer
        await CustomerNotification.create({
          customerId: user.customerId,
          description: description,
          title: title,
        });

        // Getting the device token of one customer
        const deviceTokens: any = await BookingService.getCustomerDeviceToken(
          user.customerId
        );

        // Making the notification data
        let notificationData: any = {
          type: 'Free wash',
        };

        if (deviceTokens.length) {
          sendFirebaseNotificationWithData(
            deviceTokens,
            title,
            description,
            notificationData
          );
        }
      }

      return userDetails;
    } catch (err) {
      console.log('err ', err);
      throw err;
    }
  }

  async getCustomer(customerId: string) {
    try {
      return await Customer.findOne({
        where: {
          customerId: customerId,
        },
      });
    } catch (err) {
      console.log('err ', err);
      throw err;
    }
  }

  async logout(customerId: string) {
    try {
      // Destroy the previous Token
      await CustomerDeviceToken.destroy({
        where: {
          customerId: customerId,
        },
      });

      // Deleting the exiting token
      return await tokenService.deleteToken(customerId);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async createReferral(customerId: string, referralCode: string) {
    try {
      const referrer = await Customer.findOne({
        where: { userReferralCode: referralCode },
      });

      // Creating the referral entry against current customer
      if (referrer) {
        await Referral.create({
          referrerUserId: referrer.customerId,
          referredUserId: customerId,
          referralStatus: Status.Pending,
        });
      }

      return;
    } catch (err) {
      console.log('err ', err);
      throw err;
    }
  }

  async createDeviceToken(customerId: string, deviceToken: string) {
    try {
      // Destroy the previous Token
      await CustomerDeviceToken.destroy({
        where: {
          deviceToken: deviceToken,
        },
      });

      //creating the device toke entry
      await CustomerDeviceToken.create({
        customerId: customerId,
        deviceToken: deviceToken,
      });

      return;
    } catch (err) {
      console.log('err ', err);
      throw err;
    }
  }
}

const CustomerAuthService = new AuthService(
  passwordService,
  jwtService,
  tokenService
);
export { CustomerAuthService };
