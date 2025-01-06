import { API, NetworkManager } from "./core"

export class ManageWashService {
  static async getWashList(payload) {
    const instance = NetworkManager(API.MANAGEWASH.WASHLIST)
    return await instance.request(payload)
  }
  static async downloadWashList(payload) {
    const instance = NetworkManager(API.MANAGEWASH.DOWNLOADWASHLIST)
    return await instance.request(payload)
  }
  static async importWashList(payload) {
    const instance = NetworkManager(API.MANAGEWASH.IMPORTWASHLIST)
    return await instance.request(payload)
  }
  static async getWashDetail(param) {
    const instance = NetworkManager(API.MANAGEWASH.WASHDETAIL)
    return await instance.request({}, param)
  }
  static async getFeedBackDetail(param) {
    const instance = NetworkManager(API.MANAGEWASH.FEEDBACKDETAIL)
    return await instance.request({}, param)
  }
  static async getWashTypeCount(payload) {
    const instance = NetworkManager(API.MANAGEWASH.WASHCOUNT)
    return await instance.request(payload)
  }

  static async getMachines(params) {
    const instance = NetworkManager(API.MANAGEWASH.GET_MACHINES)
    return await instance.request({}, params)
  }

  static async getOutlet(params) {
    const instance = NetworkManager(API.MANAGEWASH.GET_OUTLET)
    return await instance.request({}, params)
  }
  static async getOEMDealer(params) {
    const instance = NetworkManager(API.FEEDBACK.GET_ALL_DEALERS)
    return await instance.request({}, params)
  }
}
