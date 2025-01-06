import { API, NetworkManager } from "./core"
export class FeedBackService {
  static async createForm(payload) {
    const instance = NetworkManager(API.FEEDBACK.CREATE_FORM)
    return await instance.request(payload)
  }
  static async updateForm(payload, formId) {
    const instance = NetworkManager(API.FEEDBACK.UPDATE_FORM)
    return await instance.request(payload, [formId])
  }
  static async getRegion(payload, params) {
    const instance = NetworkManager(API.FEEDBACK.GET_REGION)
    return await instance.request(payload, params)
  }
  static async getState(params) {
    const instance = NetworkManager(API.FEEDBACK.GET_STATE)
    return await instance.request({}, params)
  }
  static async getCity(params) {
    const instance = NetworkManager(API.FEEDBACK.GET_CITY)
    return await instance.request({}, params)
  }
  static async getOEM(params) {
    const instance = NetworkManager(API.FEEDBACK.GET_OEM)
    return await instance.request({}, params)
  }
  static async getOutlets() {
    const instance = NetworkManager(API.FEEDBACK.GET_OUTLETS)
    return await instance.request()
  }
  static async getMachines() {
    const instance = NetworkManager(API.FEEDBACK.GET_MACHINES)
    return await instance.request()
  }
  static async getAllDealers() {
    const instance = NetworkManager(API.DEALER.DEALER_LIST)
    return await instance.request({}, { limit: 10000 })
  }
  static async getDealer(key, oemID, cityKey, cityID) {
    const instance = NetworkManager(API.FEEDBACK.GET_ALL_DEALERS)
    return await instance.request({}, { [key]: oemID, [cityKey]: cityID })
  }
  static async getFormsList(params) {
    const instance = NetworkManager(API.FEEDBACK.PUBLISHED_FORMS)
    return await instance.request({}, params)
  }
  static async getOutletsWithMachines(key, array, formID) {
    const instance = NetworkManager(API.FEEDBACK.GET_OUTLETS_MACHINES)
    return await instance.request({}, { [key]: array, formId: formID })
  }
  static async getFormsDetails(formID) {
    const instance = NetworkManager(API.FEEDBACK.GET_FORM)
    return await instance.request({}, [formID])
  }
  static async deleteForm(formID) {
    const instance = NetworkManager(API.FEEDBACK.DELETE_FORM)
    return await instance.request({}, [formID])
  }
  static async getAnalytics(formID) {
    const instance = NetworkManager(API.FEEDBACK.GET_ANALYTICS)
    return await instance.request({}, [formID])
  }
  static async getExportURL(formID) {
    const instance = NetworkManager(API.FEEDBACK.GET_EXPORTURL)
    return await instance.request({}, [formID])
  }
  static async getQuestionDetails(questionId) {
    const instance = NetworkManager(API.FEEDBACK.GET_QUESTION_DETAILS)
    return await instance.request({}, [questionId + "?limit=1000&offset=1"])
  }
  static async getMapDetails(formID) {
    const instance = NetworkManager(API.FEEDBACK.GET_MAP_DETAILS)
    return await instance.request({}, [formID])
  }
  static async mapDetails(payload, formID) {
    const instance = NetworkManager(API.FEEDBACK.MAP_FORM)
    return await instance.request(payload, [formID])
  }
  static async getAbandonedList(params) {
    const instance = NetworkManager(API.FEEDBACK.GET_ABANDONED_FORM)
    return await instance.request({}, params)
  }
  static async editFeedback(payload, param) {
    const instance = NetworkManager(API.FEEDBACK.UPDATE_CUSTOMER)
    return await instance.request(payload, param)
  }
  static async getWashTypes(param) {
    const instance = NetworkManager(API.MANAGEWASH.WASHFILTER)
    return await instance.request({}, param)
  }
  static async sendWhatsAppNotification(payload) {
    const instance = NetworkManager(API.FEEDBACK.SEND_ABANDONED_FEEDBACKS)
    return await instance.request(payload)
  }
}
