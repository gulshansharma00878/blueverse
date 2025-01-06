import { notificationConstant } from '../../common/notificationConstants';
import { config } from '../../config/config';
import { MemoType, Notification } from '../../models/Notification';
import { User } from '../../models/User/user';
import { UserDevice } from '../../models/User/UserDevice';
import { messageService } from '../common/messageService';
import { sendFirebaseNotification } from '../common/firebaseService/firebaseNotification';
import {
  toTitleCase,
  deleteFile,
  isNullOrUndefined,
} from '../../common/utility';
import { convertHtmlToPdf, generateAndUploadMemoPdf } from '../htmlToPdf';
import path from 'path';
// Services
import { serviceRequestService } from '../../module/serviceRequestModule/services/serviceRequest.service';
import { userService } from '../../module/userModule/services/user.service';
import { billingAndAccountingService } from '../../module/billingAndAccounting/services/billingAndAccounting.service';
import { machineService } from '../../module/machineModule/services/machine.service';
import { logger } from '../logger/logger';
import { memoService } from '../cron/machineMemo/machineMemo';
import { checkUserPermission } from '../commonService';
import { Op } from 'sequelize';

class NotificationService {
  // admin notification conditions
  async sendAdminEmailNotification(admins: any, notificationBody: any) {
    try {
      const { type } = notificationBody;
      const adminNotification = notificationConstant.adminNotificationObject;
      switch (type) {
        case adminNotification.SERVICE_REQUEST_RECEIVED.type:
          await this.adminServiceRequest(admins, notificationBody);
          break;
        case adminNotification.NEW_DEALER_ONBOARDED.type:
          await this.adminDealerOnBoard(admins, notificationBody);
          break;
        case adminNotification.ADVANCE_MEMO_GENERATE.type:
          await this.adminAdvanceMachineMemo(admins, notificationBody);
          break;
        case adminNotification.ADVANCE_MEMO_PAYMENT_SUCCESS.type:
          await this.adminAdvanceMachineMemoPaid(admins, notificationBody);
          break;
        case adminNotification.ADVANCE_MEMO_PAYMENT_FAILED.type:
          await this.adminAdvanceMachineMemoFailed(admins, notificationBody);
          break;
        case adminNotification.BLUEVERSE_CREDIT_CARRYFORWARD.type:
          await this.adminBlueVerseCreditMemo(admins, notificationBody);
          break;
        case adminNotification.TAX_INVOICE_GENERATE.type:
          await this.adminTaxInvoiceMemo(admins, notificationBody);
          break;
        case adminNotification.TOPU_UP_GENERATE.type:
          await this.adminTopUpGenerate(admins, notificationBody);
          break;
        case adminNotification.DEALER_PAYMENT_FAILED.type:
          await this.adminDealerPaymentFailed(admins, notificationBody);
          break;
        case adminNotification.DEALER_PAYMENT_DONE.type:
          await this.adminDealerPaymentDone(admins, notificationBody);
          break;
        case adminNotification.MACHINE_HEALTH_SENSOR_FAILED.type:
          await this.adminMachineHealthFailed(admins, notificationBody);
          break;
        case adminNotification.LOW_MACHINE_BALANCE.type:
          await this.adminMachineLowBalance(admins, notificationBody);
          break;
        default:
          logger.error(
            'Type not defined in sendAdminEmailNotification Function'
          );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // dealer notification conditions
  async sendDealerEmailNotification(dealers: any, notificationBody: any) {
    try {
      const { type } = notificationBody;
      const dealeNotifications = notificationConstant.dealerNotificationObject;
      switch (type) {
        case dealeNotifications.NEW_EMPLOYEE_ONBOARDED.type:
          await this.dealerNewEmployeeAdd(dealers, notificationBody);
          break;
        case dealeNotifications.ADVANCE_MEMO_GENERATE_BY_ADMIN.type:
          await this.dealerAdvanceMachineMemo(dealers, notificationBody);
          break;
        case dealeNotifications.ADVANCE_MEMO_PAYMENT_SUCCESS.type:
          await this.dealerAdvanceMachineMemoPaid(dealers, notificationBody);
          break;
        case dealeNotifications.ADVANCE_MEMO_PAYMENT_FAILED.type:
          await this.dealerAdvanceMachineMemoFailed(dealers, notificationBody);
          break;
        case dealeNotifications.BLUEVERSE_CREDIT_GENERATE_BY_ADMIN.type:
          await this.dealerBlueVerseCreditMemo(dealers, notificationBody);
          break;
        case dealeNotifications.TAX_INVOICE_GENERATE_BY_ADMIN.type:
          await this.dealerTaxInvoiceMemo(dealers, notificationBody);
          break;
        case dealeNotifications.TOP_UP_GENERATE_BY_ADMIN.type:
          await this.dealerTopUpGenerate(dealers, notificationBody);
          break;
        case dealeNotifications.PAYEMENT_FAILED.type:
          await this.dealerPaymentFailed(dealers, notificationBody);
          break;
        case dealeNotifications.PAYEMENT_SUCCESS.type:
          await this.dealerPaymentDone(dealers, notificationBody);
          break;
        case dealeNotifications.MACHINE_HEALTH_SENSOR_FAILED.type:
          this.dealerMachineHealthFailed(dealers, notificationBody);
          break;
        case dealeNotifications.LOW_MACHINE_BALANCE.type:
          this.dealerMachineLowBalance(dealers, notificationBody);
          break;
        default:
          logger.error(
            'Type not defined in sendDealerEmailNotification Function'
          );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // main function to generate the notifications
  async generateNotification(role: string, notificationPayload: any) {
    try {
      if (role === config.userRolesObject.ADMIN) {
        const admins = await User.findAll({
          where: {
            role: config.userRolesObject.ADMIN,
            isActive: true,
            // for temporary
            email: {
              [Op.notIn]: [
                'siddarth.bapna@blueverseindia.com',
                'rushang.shah@blueverseindia.com',
                'vikram.salvekar@blueverseindia.com',
              ],
            },
            deletedAt: null,
          },
          include: [
            {
              model: UserDevice,
              attributes: ['deviceToken'],
            },
          ],
        });
        if (admins.length > 0) {
          this.sendAdminEmailNotification(admins, notificationPayload);
        }
      } else if (role === config.userRolesObject.DEALER) {
        const dealers = await User.findAll({
          where: {
            role: config.userRolesObject.DEALER,
            [Op.or]: {
              userId: notificationPayload['userId'],
              parentUserId: notificationPayload['userId'],
            },
            isActive: true,
            deletedAt: null,
          },
          include: [
            {
              model: UserDevice,
              attributes: ['deviceToken'],
            },
          ],
        });
        if (dealers.length > 0) {
          this.sendDealerEmailNotification(dealers, notificationPayload);
        }
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async createBulkNotification(notificationBodies: any) {
    try {
      if (notificationBodies.length > 0) {
        return await Notification.bulkCreate(notificationBodies);
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  //notification to admin on new service request
  async adminServiceRequest(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.SERVICE_REQUEST_RECEIVED;
      const serviceDetails: any =
        await serviceRequestService.getServiceRequestDetails(modelDetail?.uuid);

      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.SERVICE_REQUEST
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }

        const userDetails = {
          emailId: admin.email,
          userName: admin.username,
        };
        const emailDetails = {
          emailSubject: emailSubject(serviceDetails?.serviceId),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            serviceId: serviceDetails?.serviceId,
            machineName: serviceDetails?.machine?.name,
            outletName: serviceDetails?.machine?.outlet?.name,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg(serviceDetails?.serviceId);
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // notification to admin on dealer onboard
  async adminDealerOnBoard(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.NEW_DEALER_ONBOARDED;
      const dealer: any = await userService.getDealerDetails(modelDetail?.uuid);

      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.DEALER
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            dealerId: dealer?.uniqueId,
            dealerName: dealer?.username,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            dealerId: dealer?.uniqueId,
            dealerName: dealer?.username,
            oemName: dealer?.oem?.name,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          dealerId: dealer?.uniqueId,
          dealerName: dealer?.username,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // notification to admin on machine health failed
  async adminMachineHealthFailed(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject
          .MACHINE_HEALTH_SENSOR_FAILED;
      const machineHealth = await machineService.getMachineHealth(
        modelDetail?.uuid
      );

      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.MACHINE_DETAIL
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            machineName: machineHealth?.Machine?.name,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            machineName: machineHealth?.Machine?.name,
            alarmName: machineHealth?.HealthMatrix?.Alarm,
            weightage: machineHealth?.HealthMatrix?.Weightage,
            critical: machineHealth?.HealthMatrix?.Critical,
            escalate: machineHealth?.HealthMatrix?.Escalate,
            isValid: machineHealth?.HealthMatrix?.IsValid,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({ machineName: machineHealth?.Machine?.name });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminAdvanceMachineMemo(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.ADVANCE_MEMO_GENERATE;
      // format the meachine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);
      //  generate pdf
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.ADVANCE_MEMO,
        config.userRolesObject.ADMIN,
        formatMemoDetails,
        true
      );
      // update pdfAddress
      if (!isNullOrUndefined(fileDetails?.s3Address)) {
        await memoService.updateMemoPdfAddress(
          formatMemoDetails.machineMemoId,
          fileDetails.s3Address
        );
      }
      let promise = [];
      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_ADVANCE_MEMO
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          memoType:MemoType.ADVANCE_MEMO,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }

      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // notification on advance  memo
  async adminAdvanceMachineMemoPaid(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject
          .ADVANCE_MEMO_PAYMENT_SUCCESS;

      // format the meachine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.ADVANCE_MEMO,
        config.userRolesObject.ADMIN,
        formatMemoDetails,
        true
      );
      // update pdfAddress
      if (!isNullOrUndefined(fileDetails?.s3Address)) {
        await memoService.updateMemoPdfAddress(
          formatMemoDetails.machineMemoId,
          fileDetails.s3Address
        );
      }
      let promise = [];
      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';

        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_ADVANCE_MEMO
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            amount: formatMemoDetails.totalAmount,
          }),
          emailBody: emailBody({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            amount: formatMemoDetails.totalAmount,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          machineName: formatMemoDetails?.machineName,
          amount: formatMemoDetails.totalAmount,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminAdvanceMachineMemoFailed(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject
          .ADVANCE_MEMO_PAYMENT_FAILED;

      // format the meachine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';

        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_ADVANCE_MEMO
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            amount: formatMemoDetails.totalAmount,
          }),
          emailBody: emailBody({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            amount: formatMemoDetails.totalAmount,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          machineName: formatMemoDetails?.machineName,
          amount: formatMemoDetails.totalAmount,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
          // type: notificationConstant.types.ADVANCE_MEMO,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminTaxInvoiceMemo(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.TAX_INVOICE_GENERATE;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.TAX_INVOICE_MEMO,
        config.userRolesObject.ADMIN,
        formatMemoDetails,
        true
      );
      if (!isNullOrUndefined(fileDetails?.s3Address)) {
        await memoService.updateMemoPdfAddress(
          formatMemoDetails.machineMemoId,
          fileDetails.s3Address
        );
      }
      let notificationBodies: any = [];
      let promise = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_TAX_INVOICE
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          memoType:MemoType.TAX_MEMO,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminBlueVerseCreditMemo(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject
          .BLUEVERSE_CREDIT_CARRYFORWARD;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);
      // generate pdf
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.BLUEVERSE_CREDIT_MEMO,
        config.userRolesObject.ADMIN,
        formatMemoDetails,
        true
      );
      if (!isNullOrUndefined(fileDetails?.s3Address)) {
        await memoService.updateMemoPdfAddress(
          formatMemoDetails.machineMemoId,
          fileDetails.s3Address
        );
      }
      let promise = [];
      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_BLUEVERSECREDIT
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminTopUpGenerate(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.TOPU_UP_GENERATE;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      // handle pdf part
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.TOPUP_UP_MEMO,
        config.userRolesObject.ADMIN,
        formatMemoDetails,
        true
      );
      if (!isNullOrUndefined(fileDetails?.s3Address)) {
        await memoService.updateMemoPdfAddress(
          formatMemoDetails.machineMemoId,
          fileDetails.s3Address
        );
      }
      let notificationBodies: any = [];
      let promise = [];
      for (const admin of admins) {
        let role = 'admin';

        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_TOPUP_MEMO
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }

        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        // generate email data
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminDealerPaymentDone(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.DEALER_PAYMENT_DONE;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';

        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_TOPUP_MEMO
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            amount: formatMemoDetails.totalAmount,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            amount: formatMemoDetails.totalAmount,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          machineName: formatMemoDetails?.machineName,
          amount: formatMemoDetails.totalAmount,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async adminDealerPaymentFailed(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.DEALER_PAYMENT_FAILED;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);
      let notificationBodies: any = [];
      for (const admin of admins) {
        let role = 'admin';
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.BILLING_TOPUP_MEMO
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
          // type: notificationConstant.types.TOPUP_UP_MEMO,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // notification to admin on machine balance less than 5000
  async adminMachineLowBalance(admins: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.adminNotificationObject.LOW_MACHINE_BALANCE;
      // Get machine detail from its uuid
      const machineDetails = await machineService.getMachineDealerDetails(
        modelDetail.uuid
      );
      let notificationBodies: any = [];
      let role = 'admin';
      for (const admin of admins) {
        if (
          !isNullOrUndefined(admin.subRoleId) &&
          !isNullOrUndefined(admin.parentUserId)
        ) {
          const permission = await checkUserPermission(
            admin.userId,
            config.adminPermission.MACHINE_DETAIL
          );
          if (permission) {
            role = 'subadmin';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: admin.email,
          userName: admin?.username,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            machineName: machineDetails.name,
            machineBalance: machineDetails?.walletBalance,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            dealerName: machineDetails?.outlet?.dealer?.username,
            machineName: machineDetails.name,
            machineBalance: machineDetails?.walletBalance,
            url: `${process.env.ADMIN_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          machineName: machineDetails.name,
          machineBalance: machineDetails?.walletBalance,
        });
        const newPayload = {
          ...notificationBody,
          userId: admin.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (admin.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            admin.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // For dealer
  async dealerNewEmployeeAdd(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject.NEW_EMPLOYEE_ONBOARDED;
      // get employee details
      const employee: any = await userService.getEmployeeDetails(
        modelDetail.uuid
      );

      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.EMPLOYEE
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            employeeId: employee?.uniqueId,
            employeeName: employee?.username,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            employeeName: employee?.username,
            employeeId: employee?.uniqueId,
            dealerName: employee?.parentUser?.username,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          employeeName: employee?.username,
          employeeId: employee?.uniqueId,
          dealerName: employee?.parentUser?.username,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.DEALER_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }

      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // notification to admin on machine health failed
  async dealerMachineHealthFailed(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject
          .MACHINE_HEALTH_SENSOR_FAILED;
      const machineHealth = await machineService.getMachineHealth(
        modelDetail.uuid
      );
      // generate email data
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.MACHINE_DETAIL
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            machineName: machineHealth?.Machine?.name,
          }),
          emailBody: emailBody({
            userName: toTitleCase(!!dealer.userName ? dealer.userName : ''),
            machineName: machineHealth?.Machine?.name,
            alarmName: machineHealth?.HealthMatrix?.Alarm,
            weightage: machineHealth?.HealthMatrix?.Weightage,
            critical: machineHealth?.HealthMatrix?.Critical,
            escalate: machineHealth?.HealthMatrix?.Escalate,
            isValid: machineHealth?.HealthMatrix?.IsValid,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          machineName: machineHealth?.Machine?.name,
        });
        const newPayload = {
          ...notificationBody,
          userId: dealer.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerAdvanceMachineMemo(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject
          .ADVANCE_MEMO_GENERATE_BY_ADMIN;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.ADVANCE_MEMO,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        false
      );
      // generate email data
      let promise = [];
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_ADVANCE_MEMO
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }

        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };

        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: dealer.userId,
          message: dbMessage,
          memoType:MemoType.ADVANCE_MEMO,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerAdvanceMachineMemoPaid(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject
          .ADVANCE_MEMO_PAYMENT_SUCCESS;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail?.uuid);
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.INVOICE,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        false
      );
      let promise = [];
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_ADVANCE_MEMO
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails.machineName,
            amount: formatMemoDetails.totalAmount,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails.machineName,
            amount: formatMemoDetails.totalAmount,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          amount: formatMemoDetails.totalAmount,
          machineName: formatMemoDetails.machineName,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerAdvanceMachineMemoFailed(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject
          .ADVANCE_MEMO_PAYMENT_FAILED;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail?.uuid);
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_ADVANCE_MEMO
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails.machineName,
            amount: formatMemoDetails.totalAmount,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails.machineName,
            amount: formatMemoDetails.totalAmount,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          amount: formatMemoDetails.totalAmount,
          machineName: formatMemoDetails.machineName,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }

      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async dealerBlueVerseCreditMemo(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject
          .BLUEVERSE_CREDIT_GENERATE_BY_ADMIN;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      // handle pdf part
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.BLUEVERSE_CREDIT_MEMO,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        false
      );
      // generate email data
      let notificationBodies: any = [];
      let promise = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_BLUEVERSECREDIT
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }

        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };

        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          userId: dealer.userId,
          message: dbMessage,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerTaxInvoiceMemo(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject
          .TAX_INVOICE_GENERATE_BY_ADMIN;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      // handle pdf part
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.TAX_INVOICE_MEMO,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        false
      );
      // generate email data
      let notificationBodies: any = [];
      let promise = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_TAX_INVOICE
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };

        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          memoType:MemoType.TAX_MEMO,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async dealerTopUpGenerate(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject.TOP_UP_GENERATE_BY_ADMIN;
      // get machine memo details
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail.uuid);

      // handle pdf part
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.TOPUP_UP_MEMO,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        false
      );
      let notificationBodies: any = [];
      let promise = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_TOPUP_MEMO
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails?.memoId,
            machineName: formatMemoDetails?.machineName,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };

        const dbMessage = msg({
          memoId: formatMemoDetails?.memoId,
          machineName: formatMemoDetails?.machineName,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerPaymentFailed(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject.PAYEMENT_FAILED;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail?.uuid);
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_TOPUP_MEMO
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            amount: formatMemoDetails.totalAmount,
            machineName: formatMemoDetails.machineName,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails.memoId,
            amount: formatMemoDetails.totalAmount,
            machineName: formatMemoDetails.machineName,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          amount: formatMemoDetails.totalAmount,
          machineName: formatMemoDetails.machineName,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }

      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerPaymentDone(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject.PAYEMENT_SUCCESS;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(modelDetail?.uuid);
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.INVOICE,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        false
      );
      let promise = [];
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.BILLING_TOPUP_MEMO
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: dealer.username,
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails.machineName,
            amount: formatMemoDetails.totalAmount,
          }),
          emailBody: emailBody({
            userName: toTitleCase(
              !!userDetails.userName ? userDetails.userName : ''
            ),
            memoId: formatMemoDetails.memoId,
            machineName: formatMemoDetails.machineName,
            amount: formatMemoDetails.totalAmount,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          memoId: formatMemoDetails.memoId,
          amount: formatMemoDetails.totalAmount,
          machineName: formatMemoDetails.machineName,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        promise.push(
          this.sendEmailNotification(
            userDetails,
            emailDetails,
            fileDetails.file
          )
        );
      }
      await Promise.allSettled(promise).then((res) => {
        deleteFile(fileDetails.file[0].path);
      });
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerMachineLowBalance(dealers: any, notificationBody: any) {
    try {
      const { modelDetail, link, type } = notificationBody;
      const { emailSubject, emailBody, msg } =
        notificationConstant.dealerNotificationObject.LOW_MACHINE_BALANCE;
      // Get machine detail from its uuid
      const machineDetails = await machineService.getMachineDealerDetails(
        modelDetail.uuid
      );
      let notificationBodies: any = [];
      for (const dealer of dealers) {
        let role = 'dealer';
        if (
          !isNullOrUndefined(dealer.subRoleId) &&
          !isNullOrUndefined(dealer.parentUserId)
        ) {
          const permission = await checkUserPermission(
            dealer.userId,
            config.dealerPermission.MACHINE_DETAIL
          );
          if (permission) {
            role = 'employee';
          } else {
            continue;
          }
        }
        const userDetails = {
          emailId: dealer.email,
          userName: toTitleCase(dealer.username || ''),
          role: dealer?.role,
        };
        const emailDetails = {
          emailSubject: emailSubject({
            machineName: machineDetails.name,
          }),
          emailBody: emailBody({
            userName: userDetails.userName,
            machineName: machineDetails.name,
            machineBalance: machineDetails?.walletBalance,
            url: `${process.env.DEALER_BASE_URL}/${role}/${link}`,
          }),
        };
        const dbMessage = msg({
          machineName: machineDetails.name,
          machineBalance: machineDetails?.walletBalance,
        });
        const newPayload = {
          ...notificationBody,
          message: dbMessage,
          userId: dealer.userId,
          link: `${role}/${link}`,
        };
        notificationBodies.push(newPayload);
        if (dealer.loggedInDevice) {
          this.sendBulkFirebaseNotification(
            dealer.loggedInDevice,
            type,
            dbMessage,
            `${process.env.ADMIN_BASE_URL}/${role}/${link}`
          );
        }
        // send email notification
        this.sendEmailNotification(userDetails, emailDetails, []);
      }
      await this.createBulkNotification(notificationBodies);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // to send email notifications
  async sendEmailNotification(
    userDetails: any,
    emailDetails: any,
    emailAttachment: any
  ) {
    try {
      if (emailAttachment.length > 0) {
        await messageService.sendNotifications(
          userDetails,
          emailDetails,
          emailAttachment
        );
      } else {
        await messageService.sendNotifications(userDetails, emailDetails);
      }
    } catch (err) {
      logger.error(`Error in email notifications with pdf ${err}`, err);
    }
  }

  sendBulkFirebaseNotification(
    tokens: any,
    heading: any,
    body: any,
    url?: any
  ) {
    try {
      const tokenArr = userService.formatDeviceTokens(tokens);
      if (tokenArr.length > 0) {
        sendFirebaseNotification(tokenArr, heading, body, url);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
const notificationService = new NotificationService();
export { notificationService };
