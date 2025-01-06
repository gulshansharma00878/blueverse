import { API, NetworkManager } from "network/core"
export class AreaManagerService {
  static async createAreaManager(payload) {
    const instance = NetworkManager(API.AREAMANAGER.CREATE_AREA_MANAGER)
    return await instance.request(payload)
  }
  static async updateAreaManager(payload, amId) {
    const instance = NetworkManager(API.AREAMANAGER.UPDATE_AREA_MANAGER_DETAILS)
    return await instance.request(payload, [amId])
  }
  static async getAreaManager(payload) {
    const instance = NetworkManager(API.AREAMANAGER.GET_AREA_MANAGER_LISTING)
    return await instance.request({}, payload)
  }
  static async getAreaManagerDetails(amId) {
    const instance = NetworkManager(API.AREAMANAGER.GET_AREA_MANAGER_DETAILS)
    return await instance.request({}, [amId])
  }
  static async deleteAreaManager(amId) {
    const instance = NetworkManager(API.AREAMANAGER.DELETE_AREA_MANAGER)
    return await instance.request({}, [amId])
  }
  static async getStates(params) {
    const instance = NetworkManager(API.AREAMANAGER.GET_STATES)
    return await instance.request({}, params)
  }
  static async getCities(params) {
    const instance = NetworkManager(API.AREAMANAGER.GET_CITIES)
    return await instance.request({}, params)
  }
}
