import { Notification } from '../../../models/Notification';
import {
  filterKeyType,
  notificationConstant,
} from '../../../common/notificationConstants';
import { Op } from 'sequelize';
import { config } from '../../../config/config';

class NotificationService {
  async getUserNotification(user: any, body: any) {
    try {
      const { _limit, _offset, type, restrictTypes } = body;
      const { userId, role } = user;
      let whereCondition: any = {
        userId: userId,
      };
      // Only for accounting notifications
      if (!!type) {
        if (role == config.userRolesObject.ADMIN && type == 'ADMIN_BILLING') {
          whereCondition['type'] = {
            [Op.or]: filterKeyType.ADMIN_BILLING,
          };
        } else if (
          role == config.userRolesObject.DEALER &&
          type == 'DEALER_BILLING'
        ) {
          whereCondition['type'] = {
            [Op.or]: filterKeyType.DEALER_BILLING,
          };
        }
      }
      // to extract only selected fields ,according to user permission
      if (!!restrictTypes) {
        whereCondition['type'] = this.getRestrictTypeConditions(
          role,
          restrictTypes
        );
      }
      const notification = await Notification.findAndCountAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: _limit,
        offset: _offset,
      });
      return notification;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getUnreadNotificationsCount(user: any, restrictTypes?: string) {
    try {
      const { userId, role } = user;
      let whereCondition: any = {
        userId: userId,
        read: false,
      };
      // to extract only selected fields ,according to user permission
      if (!!restrictTypes) {
        whereCondition['type'] = this.getRestrictTypeConditions(
          role,
          restrictTypes
        );
      }
      const notification = await Notification.count({
        where: whereCondition,
      });
      return notification;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async updateNotification(notificationId: string) {
    try {
      const notification = await Notification.update(
        {
          read: true,
          readAt: new Date(),
        },
        {
          where: {
            notificationId: notificationId,
          },
        }
      );
      return notification;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateAllUnreadStatus(userId: string) {
    try {
      const notification = await Notification.update(
        {
          read: true,
          readAt: new Date(),
        },
        {
          where: {
            userId: userId,
            read: false,
          },
        }
      );
      return notification;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getRestrictTypeConditions(role: string, restrictTypes: any) {
    let restrictTypeArr = [];
    let typeCondition;
    if (role == config.userRolesObject.ADMIN) {
      for (const types of restrictTypes.split(',')) {
        if (
          notificationConstant.adminNotificationObject.hasOwnProperty(types)
        ) {
          restrictTypeArr.push(types);
        }
      }
    } else {
      for (const types of restrictTypes.split(',')) {
        if (
          notificationConstant.dealerNotificationObject.hasOwnProperty(types)
        ) {
          restrictTypeArr.push(types);
        }
      }
    }
    if (restrictTypeArr.length) {
      typeCondition = { [Op.in]: restrictTypeArr };
    } else {
      typeCondition = { [Op.in]: ['NO_NOTIFICATIONS'] };
    }
    return typeCondition;
  }
}

const notificationService = new NotificationService();
export { notificationService };
