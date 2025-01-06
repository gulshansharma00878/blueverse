// import request fom 'request';
const fetch = require('node-fetch');
import { config } from '../../config/config';
import { templateConstants } from '../../common/templateConstants';
import { redisService } from './redisService';

export const sendDealerKycOTPToPhone = async (
  OTP: any,
  mobileNo: string,
  email: any
) => {
  try {
    await redisService.setWithExpiry(
      email + `${config.smsService.OTP_VERIFICATION_KEYWORD}`,
      OTP,
      config.otpConfig.otpExpiry
    );
    await fetch(
      config.smsService.SMS_BASE_URL +
        `?APIKEY=${
          config.smsService.SMS_API_KEY
        }&MobileNo=${mobileNo}&SenderID=${
          config.smsService.SMS_SENDER_ID
        }&Message=${templateConstants.SMS_TEMPLATE(OTP)}&ServiceName=${
          config.smsService.SMS_SERVICE_NAME
        }`,
      {
        method: 'GET',
      }
    );
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
