import { API, NetworkManager } from "./core"

export class ManageEmployeeService {
  static async getEmployeeList(params) {
    const instance = NetworkManager(API.MANAGEMPLOYEES.GET_EMPLOYEES_LIST)
    return await instance.request({}, params)
  }
  static async getEmployeeDetails(empId) {
    const instance = NetworkManager(API.MANAGEMPLOYEES.GET_EMPLOYEE_DETAILS)
    return await instance.request({}, [empId])
  }
}
