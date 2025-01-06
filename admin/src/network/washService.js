import { API, NetworkManager } from "./core"

export class WashService {
  static async getAllWashTile(payload) {
    const instance = NetworkManager(API.WASH.WASHTILE)
    return await instance.request(payload)
  }
  static async generateFeedback(payload) {
    const instance = NetworkManager(API.WASH.ADD_FEEDBACK)
    return await instance.request(payload)
  }
  static async editGenerateFeedback(payload, param) {
    const instance = NetworkManager(API.WASH.EDIT_FEEDBACK)
    return await instance.request(payload, param)
  }
}
