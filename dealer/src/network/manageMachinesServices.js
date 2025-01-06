import { API, NetworkManager } from "./core"
export class ManageMachinesServices {
  static async machinesList(params) {
    const instance = NetworkManager(API.MANAGEMACHINES.MACHINESLIST)
    return await instance.request({}, params)
  }

  static async machinesStatusCount() {
    const instance = NetworkManager(API.MANAGEMACHINES.MACHINESSTATUS)
    return await instance.request()
  }

  static async machineDetailsById(param) {
    const instance = NetworkManager(API.MANAGEMACHINES.MAACHINEDETAIL)
    return await instance.request({}, param)
  }
  static async machineWaterQuality(param) {
    const instance = NetworkManager(API.MANAGEMACHINES.WATERQUALITY)
    return await instance.request({}, param)
  }
  static async machineWaterConsumption(param) {
    const instance = NetworkManager(API.MANAGEMACHINES.WATERCONSUMPTION)
    return await instance.request({}, param)
  }
  static async machineTransaction(param) {
    const instance = NetworkManager(API.MANAGEMACHINES.MACHINETRANSACTIONS)
    return await instance.request({}, param)
  }
  static async exportMachineTransaction(param) {
    const instance = NetworkManager(API.MANAGEMACHINES.EXPORTTRANSACTIONS)
    return await instance.request({}, param)
  }

  static async machinesHealth(params) {
    const instance = NetworkManager(API.MANAGEMACHINES.GETMACHINEHEALTH)
    return await instance.request({}, params)
  }

  static async machinesWashes(params) {
    const instance = NetworkManager(API.MANAGEMACHINES.GETMACHINEWASHES)
    return await instance.request({}, params)
  }

  static async machineList(params) {
    const instance = NetworkManager(API.MANAGEMACHINES.MACHINESLIST)
    return await instance.request({}, params)
  }

  static async getMachines() {
    const instance = NetworkManager(API.MANAGEMACHINES.GETMACHINES)
    return await instance.request()
  }
  static async machinesServices(params) {
    const instance = NetworkManager(API.MANAGEMACHINES.GET_MACHINE_SERVICE_REQUESTS)
    return await instance.request({}, params)
  }
  static async exportmachinesServices(params) {
    const instance = NetworkManager(API.MANAGEMACHINES.EXPORT_MACHINE_SERVICE_REQUESTS)
    return await instance.request({}, params)
  }
  static async generateMachineRequest(mID) {
    const instance = NetworkManager(API.MANAGEMACHINES.GENERATE_MACHINE_REQUESTS)
    return await instance.request({}, [mID])
  }
}
