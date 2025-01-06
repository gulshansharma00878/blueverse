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
      userType === 'Sub Admins'
        ? process.env.AGENT_LOGIN_URL
        : process.env.DEALER_LOGIN_URL;
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
  sendManagerRegistrationMessageWithPassword(
    emailId: string,
    userName: string,
    password: string,
    role: string
  ) {
    let userRole = config.userRolesObject.AREA_MANAGER;
    if (role == config.userRolesObject.OEM) {
      userRole = 'OEM Manager';
    }
    const emailSubject = templateConstants.AGENT_CREATE_EMAIL_SUBJECT();
    const emailBody = templateConstants.MANAGER_CREATE_EMAIL_BODY({
      userName: toTitleCase(userName),
      password: password,
      loginURL: process.env.AGENT_LOGIN_URL,
      userRole,
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

  async sendNotifications(
    userDetails: any,
    emailDetails: any,
    attachement?: any
  ) {
    const { emailId, userName } = userDetails;
    const { emailSubject, emailBody } = emailDetails;
    return await emailService(
      emailId,
      emailSubject,
      '',
      emailBody,
      attachement
    );
  }

  sendOtpForLoginOrSignup(phone: any) {
    const otp = otpGenerator();

    // Calling the service to send otp on phone
    return otpService.sendOtpToPhone(phone, otp);
  }
}

const messageService = new MessageService();

export { messageService };
