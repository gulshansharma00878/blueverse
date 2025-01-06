// Sample service to make network call

import { API, NetworkManager } from "./core"

export class SettingService {
  static async getSubscriptions(dealerId) {
    const instance = NetworkManager(API.SETTINGS.GET_SUBSCRIPTIONS)
    return await instance.request({}, [dealerId])
  }
}
