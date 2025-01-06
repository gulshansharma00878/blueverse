import { API, NetworkManager } from "network/core"

export class ServiceRequestService {
  static async getServiceRequest(params) {
    const instance = NetworkManager(API.SERVICEREQUEST.GET_SERVICE_REQUEST_LISTING)
    return await instance.request({}, params)
  }
  static async exportServiceRequest(params) {
    const instance = NetworkManager(API.SERVICEREQUEST.EXPORT_SERVICE_REQUEST_LISTING)
    return await instance.request({}, params)
  }
}
