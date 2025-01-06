import { API, NetworkManager } from "./core"

export class DealerService {
  static async getDealerList(params) {
    const instance = NetworkManager(API.DEALER.DEALER_LIST)
    return await instance.request({}, params)
  }
  static async addDealer(payload) {
    const instance = NetworkManager(API.DEALER.ADD_DEALER)
    return await instance.request(payload)
  }

  static async deleteDealer(params) {
    const instance = NetworkManager(API.DEALER.DELETE_DEALER)
    return await instance.request({}, params)
  }

  static async getOemList(param) {
    const instance = NetworkManager(API.DEALER.OEM_LIST)
    return await instance.request({}, param)
  }
  static async getRegionList() {
    const instance = NetworkManager(API.DEALER.REGION_LIST)
    return await instance.request()
  }
  static async getStateList(params) {
    const instance = NetworkManager(API.DEALER.STATE_LIST)
    return await instance.request({}, params)
  }
  static async getCityList(params) {
    const instance = NetworkManager(API.DEALER.CITY_LIST)
    return await instance.request({}, params)
  }

  static async getOutletList(params) {
    const instance = NetworkManager(API.DEALER.OUTLET_LIST)
    return await instance.request({}, params)
  }
  static async getMachineList() {
    const instance = NetworkManager(API.DEALER.MACHINE_LIST)
    return await instance.request()
  }
  static async addMachine(payload) {
    const instance = NetworkManager(API.DEALER.ADD_MACHINE)
    return await instance.request(payload)
  }

  static async setSubscription(params) {
    const instance = NetworkManager(API.DEALER.SUBSCRIPTION_LIST)
    return await instance.request({}, params)
  }
  static async deactivateDealer(payload, params) {
    const instance = NetworkManager(API.DEALER.EDIT_DEALER)
    return await instance.request(payload, params)
  }
  static async submitSubscriptionSettings(payload, dealer_id) {
    const instance = NetworkManager(API.DEALER.SET_SUBSCRIPTION)
    return await instance.request(payload, [dealer_id])
  }

  static async getDealerDetails(dealer_id) {
    const instance = NetworkManager(API.DEALER.DEALER_DETAILS)
    return await instance.request({}, [dealer_id])
  }

  static async updateDealerDetails(payload, dealer_id) {
    const instance = NetworkManager(API.DEALER.EDIT_DEALER)

    return await instance.request(payload, [dealer_id])
  }
  static async updateOutletMachineMapping(payload, dealer_id) {
    const instance = NetworkManager(API.DEALER.EDIT_OUTLET_MACHINE_MAPPING)

    return await instance.request(payload, [dealer_id])
  }

  static async getEmployeeList(params) {
    const instance = NetworkManager(API.DEALER.EMPLOYEE_LIST)
    return await instance.request({}, params)
  }

  static async addEmployee(payload) {
    const instance = NetworkManager(API.DEALER.ADD_EMPLOYEE)
    return await instance.request(payload)
  }

  static async getRoleList(params) {
    const instance = NetworkManager(API.DEALER.ROLE_LIST)
    return await instance.request({}, params)
  }

  static async editEmployee(payload, params) {
    const instance = NetworkManager(API.DEALER.EDIT_EMPLOYEE)
    return await instance.request(payload, params)
  }

  static async deleteEmployee(params) {
    const instance = NetworkManager(API.DEALER.DELETE_EMPLOYEE)
    return await instance.request({}, params)
  }

  static async deactivateEmployee(payload, params) {
    const instance = NetworkManager(API.DEALER.EDIT_EMPLOYEE)
    return await instance.request(payload, params)
  }

  static async deactivateRole(payload, params) {
    const instance = NetworkManager(API.DEALER.EDIT_ROLE)
    return await instance.request(payload, params)
  }

  static async deleteRole(params) {
    const instance = NetworkManager(API.DEALER.DELETE_ROLE)
    return await instance.request({}, params)
  }
}
