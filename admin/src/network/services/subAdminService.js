import { API, NetworkManager } from "network/core"

export class SubAdminService {
  static async getSubAdminList(params) {
    const instance = NetworkManager(API.SUBADMIN.SUBADMINLIST)
    return await instance.request({}, params)
  }
  static async deleteSubAdmin(saId) {
    const instance = NetworkManager(API.SUBADMIN.DELETE_SUBADMIN)
    return await instance.request({}, [saId])
  }
  static async createSubAdmin(payload) {
    const instance = NetworkManager(API.SUBADMIN.CREATE_SUBADMIN)
    return await instance.request(payload)
  }
  static async getRoles(param) {
    const instance = NetworkManager(API.SUBADMIN.GET_ROLES)
    return await instance.request({}, param)
  }
  static async updateSubAdmin(payLoad, saId) {
    const instance = NetworkManager(API.SUBADMIN.UPDATE_SUBADMIN)
    return await instance.request(payLoad, [saId])
  }
  static async getSubAdmin(saId) {
    const instance = NetworkManager(API.SUBADMIN.GET_SUBADMIN)
    return await instance.request({}, [saId])
  }
}
