import { verifyClient } from '../../services/common/requestResponseHandler';
import { notificationController } from './controllers/notification.controller';

class NotificationRoutes {
  constructor(private notificationRouter: any) {
    this.notificationRouter = notificationRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.notificationRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      notificationController.getUserNotificationList
    );
    this.notificationRouter.get(
      '/unReadCount',
      verifyClient.bind(verifyClient),
      notificationController.countUnreadNotifications
    );
    this.notificationRouter.put(
      '/status/:notificationId',
      verifyClient.bind(verifyClient),
      notificationController.updateNotificationStatus
    );
    this.notificationRouter.put(
      '/markAllRead',
      verifyClient.bind(verifyClient),
      notificationController.updateAllNotificationStatus
    );
  }
}
const notificationRoutes = (notificationRouter: any) => {
  return new NotificationRoutes(notificationRouter);
};

export = {
  NotificationRoutes: NotificationRoutes,
  notificationRoutes: notificationRoutes,
};
