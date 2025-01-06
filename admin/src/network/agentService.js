import { API, NetworkManager } from "./core"

export class AgentService {
  static async getAgentList(params) {
    const instance = NetworkManager(API.AGENT.AGENT_LIST)
    return await instance.request({}, params)
  }

  static async addAgent(payload) {
    const instance = NetworkManager(API.AGENT.ADD_AGENT)
    return await instance.request(payload)
  }

  static async editAgent(payload, params) {
    const instance = NetworkManager(API.AGENT.EDIT_AGENT)
    return await instance.request(payload, params)
  }

  static async deleteAgent(params) {
    const instance = NetworkManager(API.AGENT.DELETE_AGENT)
    return await instance.request({}, params)
  }

  static async deactivateAgent(payload, params) {
    const instance = NetworkManager(API.AGENT.EDIT_AGENT)
    return await instance.request(payload, params)
  }
}
