import admin from 'firebase-admin';
import firebaseCred from './firebase-adminsdk';
import { logger } from '../../logger/logger';
const serviceAccount: any = firebaseCred;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE,
});
export { admin };
export const sendFirebaseNotification = async (
  deviceToken: any,
  title: string,
  body: string,
  url?: any
) => {
  try {
    const message: any = {
      notification: {
        title: title,
        body: body,
      },
      tokens: deviceToken,
    };
    if (!!url) {
      message['data'] = {
        openURL: url,
      };
      message['webpush'] = {
        fcmOptions: {
          link: url,
        },
      };
    }
    await admin.messaging().sendEachForMulticast(message);
  } catch (err) {
    logger.error('Error in firebase notifications of device', err);
    Promise.reject(err);
  }
};

export const sendFirebaseNotificationWithData = async (
  deviceToken: any,
  title: string,
  body: string,
  data?: any
) => {
  try {
    const message: any = {
      notification: {
        title: title,
        body: body,
      },
      tokens: deviceToken,
    };
    if (data) {
      message['data'] = data;
    }
    await admin.messaging().sendEachForMulticast(message);
  } catch (err) {
    logger.error('Error in firebase notifications of device', err);
    Promise.reject(err);
  }
};
