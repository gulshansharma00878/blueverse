import { API, NetworkManager } from "network/core"

export class NotificationService {
  static async getNotification(params) {
    const instance = NetworkManager(API.NOTIFICATION.GET_NOTIFICATION_LISTING)
    return await instance.request({}, params)
  }
  static async readOne(params) {
    const instance = NetworkManager(API.NOTIFICATION.READ_SINGLENOTIFICATION)
    return await instance.request({}, [params])
  }
  static async getUnreadcount(params) {
    const instance = NetworkManager(API.NOTIFICATION.GET_UNREAD_COUNT)
    return await instance.request({}, params)
  }
  static async storeDeviceToken(token) {
    const instance = NetworkManager(API.NOTIFICATION.STORE_DEVICE_TOKEN)
    return await instance.request({ deviceToken: token })
  }
  static async deleteDeviceToken(token) {
    const instance = NetworkManager(API.NOTIFICATION.DELETE_DEVICE_TOKEN)
    return await instance.request({}, { deviceToken: token })
  }

  static async readAllNotifications() {
    const instance = NetworkManager(API.NOTIFICATION.READ_ALL_NOTIFICATONS)
    return await instance.request()
  }
}
