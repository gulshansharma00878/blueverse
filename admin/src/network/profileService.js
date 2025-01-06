import { API, NetworkManager } from "./core"

export class ProfileService {
  static async updateAdminProfile(payload) {
    const instance = NetworkManager(API.PROFILE.UPDATEPROFILE)
    return await instance.request(payload)
  }
  static async uploadAdminProfile(payload) {
    const instance = NetworkManager(API.PROFILE.UPLOADPROFILE, true)
    return await instance.request(payload)
  }
}
