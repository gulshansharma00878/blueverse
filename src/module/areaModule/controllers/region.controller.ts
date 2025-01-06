import { regionService } from '../services/region.service'
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper'
import { CONSTANT } from '../constant'

class RegionController {
  /**
   * Create Region
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await regionService.store(dataFromRequest(req))

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', `New region ${results.name}`),
      results,
      200
    )
  }

  /**
   * Get list of regions
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const results = await regionService.index()

    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'Region'),
      results,
      200
    )
  }
}

const regionController = new RegionController()
export { regionController }
