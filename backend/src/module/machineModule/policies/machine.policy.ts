import { dataFromRequest } from '../../../helpers/basic_helper'

class MachinePolicy {
  /**
   * store
   *
   * @param req
   * @param res
   * @param next
   *
   */
  store = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req)

    return next()
  }

  /**
   * index
   *
   * @param req
   * @param res
   * @param next
   *
   */
  index = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req)
    return next()
  }
}

const machinePolicy = new MachinePolicy()
export { machinePolicy }
