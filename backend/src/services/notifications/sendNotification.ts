/*
 * sendNotification.js
 *
 * Description:
 * This file contains utility functions related to sending notifications within the project.
 * It provides functions for tasks like notifying admins and dealer for certain events like machine failed.
 *
 * Note: The main functionality for sending notifications (e.g., SMS, push notifications) is implemented in notification.ts.
 *
 */
import { isNullOrUndefined } from '../../common/utility';
import { config } from '../../config/config';
import { notificationConstant } from '../../common/notificationConstants';
import { notificationService } from './notification';
import { Machine } from '../../models/Machine/Machine';

export const sendMachineHealtNotification = (machineHealth: any) => {
  let machineHealthDetail = {
    uuid: '',
    dealerId: '',
    machineId: '',
  };
  // machine health if already exist
  if (machineHealth) {
    // store the data required for notification body in machineHealthDetails
    (machineHealthDetail['uuid'] = machineHealth.Guid),
      (machineHealthDetail['dealerId'] =
        machineHealth.Machine?.outlet?.dealer?.userId);
    machineHealthDetail['machineId'] = machineHealth.MachineGuid;
  }
  // Notification for admin
  const { type: adminNotiType, url: adminNotiUrl } =
    notificationConstant.adminNotificationObject.MACHINE_HEALTH_SENSOR_FAILED;

  // For Admin
  const notificationBodyAdmin = {
    modelDetail: {
      name: 'MachineHealth',
      uuid: machineHealthDetail['uuid'],
    },
    type: adminNotiType,
    link: `${adminNotiUrl}/${machineHealthDetail['machineId']}`,
  };

  notificationService.generateNotification(
    config.userRolesObject.ADMIN,
    notificationBodyAdmin
  );
  // Notification for dealer
  if (!isNullOrUndefined(machineHealthDetail['dealerId'])) {
    const { type: dealerNotiType, url: dealerNotiUrl } =
      notificationConstant.dealerNotificationObject
        .MACHINE_HEALTH_SENSOR_FAILED;

    const notificationBodyDealer = {
      modelDetail: {
        name: 'MachineHealth',
        uuid: machineHealthDetail['uuid'],
      },
      userId: machineHealthDetail['dealerId'],
      type: dealerNotiType,
      link: `${dealerNotiUrl}/${machineHealthDetail['machineId']}`,
    };
    notificationService.generateNotification(
      config.userRolesObject.DEALER,
      notificationBodyDealer
    );
  }
};

export const notifyLowMachineWalletBalance = (machines: any) => {
  // function to generate notification body
  const generateNotificationBody = (
    notificationObject: any,
    userType: string
  ) => {
    const { type, url } = notificationObject;
    return {
      modelDetail: {
        name: Machine.name,
        uuid: machines.machineGuid,
      },
      userId:
        userType === config.userRolesObject.ADMIN
          ? null
          : machines.outlet.dealer.userId,
      type,
      link: `${url}/${machines.machineGuid}`,
    };
  };

  // Admin Notification
  const adminNotificationObject =
    notificationConstant.adminNotificationObject.LOW_MACHINE_BALANCE;
  // get notiification body
  const adminNotificationBody = generateNotificationBody(
    adminNotificationObject,
    config.userRolesObject.ADMIN
  );
  // generate admin notification
  notificationService.generateNotification(
    config.userRolesObject.ADMIN,
    adminNotificationBody
  );

  // Dealer Notification
  const dealerNotificationObject =
    notificationConstant.dealerNotificationObject.LOW_MACHINE_BALANCE;
  // get dealer notification body
  const dealerNotificationBody = generateNotificationBody(
    dealerNotificationObject,
    config.userRolesObject.DEALER
  );
  // generate notification body
  notificationService.generateNotification(
    config.userRolesObject.DEALER,
    dealerNotificationBody
  );
};
