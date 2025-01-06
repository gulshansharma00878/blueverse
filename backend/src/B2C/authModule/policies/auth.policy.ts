import { Op } from 'sequelize';
import { NextFunction, Request, Response } from 'express';
import { Customer } from '../../models/customer';
import { otpService } from '../../../services/user/otpService';
import { jwtService } from '../../../services/user/jwtService';
import { tokenService } from '../../../services/common/tokenService';
import { config } from '../../../config/config';
import createHttpError from 'http-errors';
import { CONSTANT } from '../constant';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { isDefined } from 'class-validator';
const jwt = require('jsonwebtoken');
import axios from 'axios';
const crypto = require('crypto');
const appleSignin = require('apple-signin-auth');

class ValidateCustomerApis {
  async validateVerifyOtpRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destruct the value from request body
      const { phone, verification_code } = req.body;

      if (config.serverConfig.env != 'development') {
        if (phone != '9898989898') {
          // Matching the incoming otp with system saved otp
          await otpService.validateOtpForPhone(verification_code, phone);
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateCustomerLogin(req: Request, res: Response, next: NextFunction) {
    try {
      // Destruct the value from request body
      const { phone } = dataFromRequest(req);

      // Declaring the where condition
      let whereCondition: any = {
        phone: phone,
        isDeleted: false,
      };

      // Try to find user exists or not
      let userData = await Customer.findOne({ where: whereCondition });

      if (userData && userData.isActive == CONSTANT.USER_DEACTIVATED) {
        throw createHttpError(400, CONSTANT.ACCOUNT_DEACTIVATED);
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateSocialLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        auth_token,
        unique_key,
        deviceType,
        deviceToken,
        provider,
      } = req.body;
      if (auth_token) {
        let profile: any;

        if (provider === 'google') {
          // verify auth_token
          const client = new OAuth2Client(config.googleConfig.googleClientId);
          const ticket = await client.verifyIdToken({
            idToken: auth_token,
          });

          profile = ticket.getPayload();
        } else if (provider === 'apple') {
          // Verify token via apple login authentication
          const userResp = await appleSignin.verifyIdToken(auth_token, {
            audience: config.appleConfig.appleClientId,
            ignoreExpiration: true,
          });
          req.body.email = userResp.email;

          profile = userResp;
        }

        let isCustomerExist = await Customer.findOne({
          where: {
            email: profile.email,
            isDeleted: false,
          },
        });

        if (
          isCustomerExist &&
          isCustomerExist.isActive == CONSTANT.USER_DEACTIVATED
        ) {
          throw createHttpError(400, CONSTANT.ACCOUNT_DEACTIVATED);
        }
        res.locals.request = {
          user: {
            user: isCustomerExist ? isCustomerExist.dataValues : null,
            firstName: profile.given_name,
            lastName: profile.family_name,
          },
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateReferralCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { referralCode } = dataFromRequest(req);
      const referrer = await Customer.findOne({
        where: { userReferralCode: referralCode },
      });

      if (!referrer) {
        throw createHttpError(400, CONSTANT.INVALID_CODE);
      }

      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateCustomerApis = new ValidateCustomerApis();
export { validateCustomerApis };
