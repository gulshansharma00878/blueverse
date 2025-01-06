import { API, NetworkManager } from "./core"

export class RoleService {
  static async getModuleList(param) {
    const instance = NetworkManager(API.ROLE.MODULELIST)
    return await instance.request({}, param)
  }
  static async createSubRole(payLoad) {
    const instance = NetworkManager(API.ROLE.SUBROLECREATE)
    return await instance.request(payLoad)
  }
  static async listSubRole(param) {
    const instance = NetworkManager(API.ROLE.SUBROLELIST)
    return await instance.request({}, param)
  }
  static async deleteSubRole(param) {
    const instance = NetworkManager(API.ROLE.DELETESUBROLE)
    return await instance.request({}, param)
  }
  static async getSubRoleById(param) {
    const instance = NetworkManager(API.ROLE.SUBROLEBYID)
    return await instance.request({}, param)
  }
  static async editSubRoleById(payload, param) {
    const instance = NetworkManager(API.ROLE.EDITSUBROLE)
    return await instance.request(payload, param)
  }
}
