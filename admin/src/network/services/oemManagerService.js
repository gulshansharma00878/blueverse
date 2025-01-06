import { API, NetworkManager } from "network/core"
export class OEMManagerService {
  static async createOEMManager(payload) {
    const instance = NetworkManager(API.OEMMANAGER.CREATE_MANAGER)
    return await instance.request(payload)
  }
  static async getOemManager(payload) {
    const instance = NetworkManager(API.OEMMANAGER.GET_OEM_MANAGER_LISTING)
    return await instance.request({}, payload)
  }
  static async deleteOEMManager(omID) {
    const instance = NetworkManager(API.OEMMANAGER.DELETE_OEM_MANAGER)
    return await instance.request({}, [omID])
  }
  static async updateOEMManager(payload, omID) {
    const instance = NetworkManager(API.OEMMANAGER.UPDATE_OEM_MANAGER)
    return await instance.request(payload, [omID])
  }
  static async getOEMManagerDetails(omID) {
    const instance = NetworkManager(API.OEMMANAGER.GET_OEM_MANAGER_DETAILS)
    return await instance.request({}, [omID])
  }
}
