// Sample service to make network call

import { API, NetworkManager } from "./core"

export class DashboardService {
  static async getWashDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_WASH_DETAIL)
    return await instance.request({}, params)
  }

  static async getWaterDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_WATER_DETAIL)
    return await instance.request({}, params)
  }

  static async getElectricityDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_ELECTRICITY_DETAIL)
    return await instance.request({}, params)
  }

  static async getMachineRuntimeDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_MACHINE_RUNTIME_DETAIL)
    return await instance.request({}, params)
  }

  static async getWaterQualityDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_WATER_QUALITY_DETAIL)
    return await instance.request({}, params)
  }

  static async getMachineStatus() {
    const instance = NetworkManager(API.DASHBOARD.MACHINE_STATUS)
    return await instance.request()
  }

  static async getNotification(params) {
    const instance = NetworkManager(API.DASHBOARD.NOTIFICATION_STATUS)
    return await instance.request({}, params)
  }
}
