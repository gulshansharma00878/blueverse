// Sample service to make network call

import { API, NetworkManager } from "./core"

export class AuthService {
  static async loginByEmail(payload) {
    const instance = NetworkManager(API.AUTH.LOGIN)
    return await instance.request(payload)
  }
  static async logoutOnClick(payload) {
    const instance = NetworkManager(API.AUTH.LOGOUT)
    return await instance.request(payload)
  }

  static async uploadFile(payload) {
    const instance = NetworkManager(API.FILE.UPLOAD, true)
    return await instance.request(payload)
  }

  static async resetPassword(payload) {
    const instance = NetworkManager(API.AUTH.RESETPASSWORD)
    return await instance.request(payload)
  }
  static async updatePassword(payload) {
    const instance = NetworkManager(API.AUTH.UPDATEPASSWORD)
    return await instance.request(payload)
  }
  static async forgetPassword(payload) {
    const instance = NetworkManager(API.AUTH.FORGETPASSWORD)
    return await instance.request(payload)
  }
  static async otpVerification(payload) {
    const instance = NetworkManager(API.AUTH.VERIFYOTP)
    return await instance.request(payload)
  }
  static async getUserProfile() {
    const instance = NetworkManager(API.AUTH.USERPROFILE)
    return await instance.request()
  }
  static async getTerms() {
    const instance = NetworkManager(API.AUTH.TERMS)
    return await instance.request({}, { type: "ADMIN" })
  }
}
