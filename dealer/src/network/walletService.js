import { API, NetworkManager } from "./core"

export class WalletService {
  /**
   * @description This API is common for Transaction History, Machine Transaction History, Credit and Wallet History
   * * Possible Filter Values :
   * * * transactionType = 'ADDED', 'DEBITED'
   * * * sourceType = "WALLET", "CREDIT", "TOPUP"
   */
  static async getTransactionHistory(payload) {
    const instance = NetworkManager(API.WALLET.GET_TRANSACTIONHISTORY)
    return await instance.request(payload, [])
  }
  static async getMachineBalance(payload) {
    const instance = NetworkManager(API.WALLET.GET_MACHINEBALANCE)
    return await instance.request(payload, [])
  }
  static async getMachineDetail(param) {
    const instance = NetworkManager(API.WALLET.MACHINEDETAIL)
    return await instance.request({}, param)
  }
  static async exportHistory(payload) {
    const instance = NetworkManager(API.WALLET.EXPORT_HISTORY)
    return await instance.request(payload, [])
  }
  static async createPayment(payload) {
    const instance = NetworkManager(API.WALLET.CREATE_PAYMENT)
    return await instance.request(payload, [])
  }
  static async paymentStatus(param) {
    const instance = NetworkManager(API.WALLET.PAYMENT_STATUS)
    return await instance.request({}, param)
  }
  static async getMemoDetail(param) {
    const instance = NetworkManager(API.WALLET.GET_MEMODETAIL)
    return await instance.request({}, param)
  }
}
