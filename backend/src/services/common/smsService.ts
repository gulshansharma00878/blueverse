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

export const sendCustomerSignInOTPToPhone = async (
  OTP: any,
  mobileNo: string
) => {
  try {
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

/**
 * Sends an SMS message to a specified mobile number.
 * @param {string} message - The custom message text to be sent.
 * @param {string} mobileNo - The recipient's mobile number.
 * @returns {Promise<void>} - Resolves if the message was sent successfully; otherwise, rejects with an error.
 */
export const sendSMSMessage = async (message: string, mobileNo: string) => {
  try {
    console.log('🚀 ~ sendSMSMessage ~ mobileNo:', mobileNo);
    // Constructs the SMS API URL with necessary parameters such as API key, mobile number, sender ID, message content, and service name.
    const response = await fetch(
      config.smsService.SMS_BASE_URL +
        `?APIKEY=${config.smsService.SMS_API_KEY}` +
        `&MobileNo=${mobileNo}` +
        `&SenderID=${config.smsService.SMS_SENDER_ID}` +
        `&Message=${encodeURIComponent(message)}` + // Encodes the message to handle special characters.
        `&ServiceName=${config.smsService.SMS_SERVICE_NAME}`,
      {
        method: 'GET', // Makes a GET request to the SMS service API.
      }
    );

    console.log('🚀 ~ sendSMSMessage ~ response:', response?.url);

    return; // Returns void on success.
  } catch (err) {
    // If an error occurs, rejects the promise with the error for error handling upstream.
    return Promise.reject(err);
  }
};
