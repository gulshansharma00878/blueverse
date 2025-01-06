import { templateConstants } from '../../common/templateConstants';
import { otpGenerator, toTitleCase } from '../../common/utility';
import { config } from '../../config/config';
import { otpService } from '../user/otpService';
import { emailService } from './emailService';

class MessageService {
  sendPasswordForgotMessage(emailId: string, userName: string) {
    const otp = otpGenerator();
    const emailSubject = templateConstants.FORGOT_PASSWORD_EMAIL_SUBJECT();
    const emailBody = templateConstants.FORGOT_PASSWORD_EMAIL_BODY({
      userName: toTitleCase(userName),
      code: otp,
      contactDetail: config.notificationContactConfig.contactDetails,
    });
    const emailData = {
      emailSubject: emailSubject,
      emailBody: emailBody,
      otp: otp,
    };
    return otpService.sendOtpToEmail(emailId, emailData, userName);
  }
  sendAgentRegistrationMessageWithPassword(
    emailId: string,
    userName: string,
    password: string
  ) {
    const emailSubject = templateConstants.AGENT_CREATE_EMAIL_SUBJECT();
    const emailBody = templateConstants.AGENT_CREATE_EMAIL_BODY({
      userName: toTitleCase(userName),
      password: password,
      loginURL: process.env.AGENT_LOGIN_URL,
    });
    const emailData = {
      emailSubject: emailSubject,
      emailBody: emailBody,
    };
    return emailService(
      emailId,
      emailData.emailSubject,
      '',
      emailData.emailBody
    );
  }
  sendEmployeeRegistrationMessageWithPassword(
    emailId: string,
    userName: string,
    password: string,
    userType: string
  ) {
    const emailSubject = templateConstants.AGENT_CREATE_EMAIL_SUBJECT();
    const url =
      userType === 'DEALERSHIP’s Employee'
        ? process.env.DEALER_LOGIN_URL
        : process.env.AGENT_LOGIN_URL;
    const emailBody = templateConstants.EMPLOYEE_CREATE_EMAIL_BODY({
      userName: toTitleCase(userName),
      loginURL: url,
      password: password,
      userType: userType,
    });
    const emailData = {
      emailSubject: emailSubject,
      emailBody: emailBody,
    };
    return emailService(
      emailId,
      emailData.emailSubject,
      '',
      emailData.emailBody
    );
  }
}

const messageService = new MessageService();

export { messageService };
