import { API, NetworkManager } from "./core"

export class ManageWashService {
  static async getWashList(payload) {
    const instance = NetworkManager(API.MANAGEWASH.WASHLIST)
    return await instance.request(payload)
  }
  static async downloadWashList(payLoad) {
    const instance = NetworkManager(API.MANAGEWASH.DOWNLOADWASHLIST)
    return await instance.request(payLoad)
  }
  static async getWashDetail(param) {
    const instance = NetworkManager(API.MANAGEWASH.WASHDETAIL)
    return await instance.request({}, param)
  }

  static async getMachines(params) {
    const instance = NetworkManager(API.MANAGEWASH.GET_MACHINES)
    return await instance.request({}, params)
  }

  static async getOutlet(params) {
    const instance = NetworkManager(API.MANAGEWASH.GET_OUTLET)
    return await instance.request({}, params)
  }

  static async getWashType() {
    const instance = NetworkManager(API.MANAGEWASH.GET_WASHLIST)
    return await instance.request()
  }
  static async getWashTypeCount(payload) {
    const instance = NetworkManager(API.MANAGEWASH.WASHCOUNT)
    return await instance.request(payload)
  }
}
