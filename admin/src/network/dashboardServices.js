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

  static async getDealerDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_DEALER_DETAIL)
    return await instance.request({}, params)
  }

  static async getDealersipCountDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_DEALERSHIP_COUNT_DETAIL)
    return await instance.request({}, params)
  }

  static async getTopDealersipDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.TOP_DEALERSHIP)
    return await instance.request({}, params)
  }

  static async getMachineStatus() {
    const instance = NetworkManager(API.DASHBOARD.MACHINE_STATUS)
    return await instance.request()
  }

  static async getMachineList() {
    const instance = NetworkManager(API.DASHBOARD.MACHINE_LIST)
    return await instance.request()
  }

  static async getMapMachineList() {
    const instance = NetworkManager(API.DASHBOARD.MACHINE_MAP_LIST)
    return await instance.request()
  }

  static async getOemMachineList() {
    const instance = NetworkManager(API.DASHBOARD.OEM_MACHINE_LIST)
    return await instance.request()
  }

  static async getOemTopDealersipDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.OEM_TOP_DEALERSHIP)
    return await instance.request({}, params)
  }

  static async getOemWaterDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_OEM_WATER_DETAIL)
    return await instance.request({}, params)
  }

  static async getOemElectricityDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_OEM_ELECTRICITY_DETAIL)
    return await instance.request({}, params)
  }

  static async getOemDealersipCountDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_OEM_DEALERSHIP_COUNT_DETAIL)
    return await instance.request({}, params)
  }

  static async getoemWashDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_OEM_WASH_DETAIL)
    return await instance.request({}, params)
  }

  // ................... Area Manager
  static async getAreaManagerMachineList() {
    const instance = NetworkManager(API.DASHBOARD.AREAMANAGER_MACHINE_LIST)
    return await instance.request()
  }

  static async getAreaManagerTopDealersipDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.AREAMANAGER_TOP_DEALERSHIP)
    return await instance.request({}, params)
  }

  static async getAreaManagerWaterDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_AREAMANAGER_WATER_DETAIL)
    return await instance.request({}, params)
  }

  static async getAreaManagerElectricityDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_AREAMANAGER_ELECTRICITY_DETAIL)
    return await instance.request({}, params)
  }

  static async getAreaManagerDealersipCountDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_AREAMANAGER_DEALERSHIP_COUNT_DETAIL)
    return await instance.request({}, params)
  }

  static async getAreaManagerWashDetail(params) {
    const instance = NetworkManager(API.DASHBOARD.GET_AREAMANAGER_WASH_DETAIL)
    return await instance.request({}, params)
  }

  static async getNotification(params) {
    const instance = NetworkManager(API.DASHBOARD.NOTIFICATION_STATUS)
    return await instance.request({}, params)
  }
}
