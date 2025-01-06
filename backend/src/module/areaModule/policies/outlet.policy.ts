import { dataFromRequest } from '../../../helpers/basic_helper'
import { State } from '../../../models/state'
import createError from 'http-errors'
import { isEmpty } from 'lodash'
import { CONSTANT } from '../constant'
import { Region } from '../../../models/region'
import { Outlet } from '../../../models/outlet'
import { Op } from 'sequelize'

class OutletPolicy {
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

    const outlet = await Outlet.findOne({
      where: {
        name: {
          [Op.regexp]: data.name,
        },
      },
    })

    if (!isEmpty(outlet)) {
      return next(
        createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'Outlet')
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

const outletPolicy = new OutletPolicy()
export { outletPolicy }
