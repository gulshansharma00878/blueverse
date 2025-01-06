import { outletService } from '../services/outlet.service'
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper'
import { CONSTANT } from '../constant'

class OutletController {
  /**
   * Create Outlet
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await outletService.store(dataFromRequest(req))

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', 'Outlet'),
      results,
      200
    )
  }

  /**
   * Get paginated list of outlets
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const results = await outletService.index(dataFromRequest(req, 'filters'))
    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'Outlets'),
      results,
      200
    )
  }
}

const outletController = new OutletController()
export { outletController }
