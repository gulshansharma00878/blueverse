import { templateConstants } from '../../../common/templateConstants';
import { notificationService } from '../services/notification.service';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import qs from 'qs';
import { config } from '../../../config/config';
class NotificationController {
  async getUserNotificationList(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.userId,
        role: res.user.role,
      };
      const { limit, offset, type, restrictTypes } = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const body = {
        _limit,
        _offset,
        type,
        restrictTypes,
      };
      const notifications = await notificationService.getUserNotification(
        user,
        body
      );
      res.locals.response = {
        body: {
          data: {
            records: notifications.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              notifications.count
            ),
          },
        },
        message: templateConstants.LIST_OF('notifications'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async countUnreadNotifications(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.userId,
        role: res.user.role,
      };
      const { restrictTypes } = req.query;
      const notificationCount =
        await notificationService.getUnreadNotificationsCount(
          user,
          restrictTypes
        );
      res.locals.response = {
        body: {
          data: {
            records: notificationCount,
          },
        },
        message: templateConstants.COUNT('notifications'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateNotificationStatus(req: any, res: any, next: any) {
    try {
      const { notificationId } = req.params;
      await notificationService.updateNotification(notificationId);
      res.locals.response = {
        body: {
          data: {
            notificationId: notificationId,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('notification'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateAllNotificationStatus(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.userId,
      };
      await notificationService.updateAllUnreadStatus(user.userId);
      res.locals.response = {
        body: {
          data: {},
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('notifications'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const notificationController = new NotificationController();
export { notificationController };
