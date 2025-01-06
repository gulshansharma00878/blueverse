import { dataFromRequest } from '../../../helpers/basic_helper'
import { Region } from '../../../models/region'
import createError from 'http-errors'
import { isEmpty } from 'lodash'
import { Op } from 'sequelize'
import { CONSTANT } from '../constant'

class RegionPolicy {
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

    const region = await Region.findOne({
      where: {
        name: {
          [Op.regexp]: data.name,
        },
      },
    })

    if (!isEmpty(region)) {
      return next(
        createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'Region')
        )
      )
    }

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

const regionPolicy = new RegionPolicy()
export { regionPolicy }
