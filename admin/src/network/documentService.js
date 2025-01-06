import { API, NetworkManager } from "./core"

export class DocumentService {
  static async uploadDocument(payload) {
    const instance = NetworkManager(API.DOCUMENT.UPLOADDOCUMENT, true)
    return await instance.request(payload)
  }

  static async deleteDocuments(payload) {
    const instance = NetworkManager(API.DOCUMENT.DELETEDOCUMENT)
    return await instance.request(payload)
  }
}
