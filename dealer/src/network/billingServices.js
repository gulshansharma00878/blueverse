import { API, NetworkManager } from "./core"

export class BillingService {
  static async getBillingList(param) {
    const instance = NetworkManager(API.BILLING.BILLINGLIST)
    return await instance.request({}, param)
  }
  static async exportAdvanceMemo(param) {
    const instance = NetworkManager(API.BILLING.EXPORTMEMO)
    return await instance.request({}, param)
  }
  static async memoDetail(param) {
    const instance = NetworkManager(API.BILLING.MEMODETAIL)
    return await instance.request({}, param)
  }
  static async invoiceDetail(param) {
    const instance = NetworkManager(API.BILLING.GETINVOICE)
    return await instance.request({}, param)
  }
  static async paymentDummy() {
    const instance = NetworkManager(API.BILLING.DUMMYPAYMENT)
    return await instance.request()
  }
}
