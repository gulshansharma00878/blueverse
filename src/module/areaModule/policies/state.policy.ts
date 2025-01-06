import { dataFromRequest } from '../../../helpers/basic_helper';
import { State } from '../../../models/state';
import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { CONSTANT } from '../constant';
import { Region } from '../../../models/region';
import { Op } from 'sequelize';
import { templateConstants } from '../../../common/templateConstants';

class StatePolicy {
  /**
   * store
   *
   * @param req
   * @param res
   * @param next
   *
   */
  store = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req);

    const doesRegionExist = await Region.findOne({
      where: {
        regionId: data.regionId,
      },
    });

    if (isEmpty(doesRegionExist)) {
      return next(createError(400, CONSTANT.REGION_NOT_EXIST));
    }

    const state = await State.findOne({
      where: {
        name: {
          [Op.regexp]: data.name,
        },
      },
    });

    if (!isEmpty(state)) {
      return next(
        createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'State')
        )
      );
    }

    return next();
  };

  /**
   * index
   *
   * @param req
   * @param res
   * @param next
   *
   */
  index = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req);
    return next();
  };
  async updateStateRequestValidation(req: any, res: any, next: any) {
    try {
      const { stateId } = req.params;
      const { regionId, name } = req.body;
      const isExist = await State.findOne({ where: { stateId: stateId } });
      if (!isExist) {
        throw createError(400, templateConstants.INVALID('stateId'));
      }
      const isNameExist = await State.findOne({
        where: { name: { [Op.regexp]: name }, stateId: { [Op.ne]: stateId } },
      });
      if (isNameExist) {
        throw createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'State')
        );
      }
      if (regionId) {
        const isExist = await Region.findOne({ where: { regionId: regionId } });
        if (!isExist) {
          throw createError(400, templateConstants.INVALID('regionId'));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

const statePolicy = new StatePolicy();
export { statePolicy };
