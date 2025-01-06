// Sample service to make network call

import { API, NetworkManager } from "./core"

export class CmsService {
  static async getStateList() {
    const instance = NetworkManager(API.CMS.STATELIST)
    return await instance.request()
  }
  static async getRegionList() {
    const instance = NetworkManager(API.CMS.REGIONLIST)
    return await instance.request()
  }
  static async addState(payLoad) {
    const instance = NetworkManager(API.CMS.CREATESTATE)
    return await instance.request(payLoad)
  }
  static async editState(payLoad, param) {
    const instance = NetworkManager(API.CMS.EDITSTATE)
    return await instance.request(payLoad, param)
  }
  static async getPageList() {
    const instance = NetworkManager(API.CMS.PAGELIST)
    return await instance.request()
  }
  static async editPage(payLoad, param) {
    const instance = NetworkManager(API.CMS.EDITPAGE)
    return await instance.request(payLoad, param)
  }
  static async getCityList() {
    const instance = NetworkManager(API.CMS.CITYLIST)
    return await instance.request()
  }
  static async getStateByRegion(key, id) {
    const instance = NetworkManager(API.CMS.STATEBYREGION)
    return await instance.request({}, { [key]: id })
  }
  static async addCity(payLoad) {
    const instance = NetworkManager(API.CMS.CREATECITY)
    return await instance.request(payLoad)
  }
  static async editCity(payLoad, param) {
    const instance = NetworkManager(API.CMS.EDITCITY)
    return await instance.request(payLoad, param)
  }
  static async getOemList() {
    const instance = NetworkManager(API.CMS.OEMLIST)
    return await instance.request()
  }
  static async addOem(payLoad) {
    const instance = NetworkManager(API.CMS.CREATEOEM)
    return await instance.request(payLoad)
  }
  static async editOem(payLoad, param) {
    const instance = NetworkManager(API.CMS.EDITOEM)
    return await instance.request(payLoad, param)
  }
}
