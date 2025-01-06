import { emailService } from '../common/emailService';
import { redisService } from '../common/redisService';
import { templateConstants } from '../../common/templateConstants';
import stringConstants from '../../common/stringConstants';
import { config } from '../../config/config';
import createError from 'http-errors';
import { sendCustomerSignInOTPToPhone, sendDealerKycOTPToPhone } from '../common/smsService';

const otpConfig = config.otpConfig;
// This function checks whether Otp generated and Otp received
// by user is same or not
const isOtpValid = (actualOtp: any, receivedOtp: number) => {
  const _actualOtp = Number(actualOtp);
  const _otpReceived = Number(receivedOtp);
  if (_actualOtp === _otpReceived) {
    return true;
  }
  throw createError(400, templateConstants.INVALID_OTP('OTP'));
};

// This function checks whether Otp generated and Otp received
// by user is same or not
const isCodeValid = (actualCode: any, receivedCode: string) => {
  if (actualCode === receivedCode) {
    return true;
  }
  throw createError(400, templateConstants.INVALID_OTP('Code'));
};

// This function receives Otp from user and validates otp by the
// help of otp validation function
class OtpService {
  //sendOtpToEmail ---> sending otp to email
  async sendOtpToEmail(emailId: string, emailData: any, name: string) {
    try {
      if (!(emailId || name)) {
        throw createError(
          400,
          stringConstants.systemMessage.EMAIL_NOT_PROVIDED
        );
      }
      await redisService.setWithExpiry(
        emailId,
        emailData.otp,
        otpConfig.otpExpiry
      );
      emailService(emailId, emailData.emailSubject, '', emailData.emailBody);
      return stringConstants.otpServiceMessage.OTP_SUCCESS_SENT_MESSAGE;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // validateOtpForEmail ---> validate otp for email
  async validateOtpForEmail(otpRecieved: any, emailId: string) {
    try {
      const otp = await redisService.get(emailId);
      return isOtpValid(otp, otpRecieved);
    } catch (err: any) {
      if (
        err.message === stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
      ) {
        err = createError(401, stringConstants.otpServiceMessage.OTP_EXPIRED);
      }
      return Promise.reject(err);
    }
  }

  // validateOtpForEmail ---> validate otp for email
  async validatePasswordResetCode(code: string, emailId: string) {
    try {
      const _code = await redisService.get(emailId);
      return isCodeValid(_code, code);
    } catch (err: any) {
      if (
        err.message === stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
      ) {
        err = createError(401, stringConstants.otpServiceMessage.OTP_EXPIRED);
      }
      return Promise.reject(err);
    }
  }

  // validateOtpForPhone ---> validate otp for phone
  async validateOtpForPhone(otpRecieved: number, phone: string) {
    try {
      const otp = await redisService.get(phone);

      return isOtpValid(otp, otpRecieved);
    } catch (err: any) {
      if (
        err.message === stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
      ) {
        err = createError(401, stringConstants.otpServiceMessage.OTP_EXPIRED);
      }
      return Promise.reject(err);
    }
  }

  //sendOtpToEmail ---> sending otp to email
  async sendOtpToPhone(phone: string, otp: number) {
    try {
      if (!phone) {
        throw createError(
          400,
          stringConstants.systemMessage.PHONE_NOT_PROVIDED
        );
      }
      await redisService.setWithExpiry(phone, String(otp), otpConfig.otpExpiry);

      // Sending the otp to phone number
      sendCustomerSignInOTPToPhone(otp,phone);

      return stringConstants.otpServiceMessage.OTP_SUCCESS_SENT_MESSAGE;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
const otpService = new OtpService();
export { otpService };
