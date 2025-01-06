import { dataFromRequest } from '../../../helpers/basic_helper';
import { State } from '../../../models/state';
import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { CONSTANT } from '../constant';
import { Region } from '../../../models/region';
import { City } from '../../../models/city';
import { Op } from 'sequelize';
import { templateConstants } from '../../../common/templateConstants';

class CityPolicy {
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

    const doesStateExist = await State.findOne({
      where: {
        stateId: data.stateId,
      },
    });

    if (isEmpty(doesStateExist)) {
      return next(createError(400, CONSTANT.STATE_NOT_EXIST));
    }

    const city = await City.findOne({
      where: {
        name: {
          [Op.regexp]: data.name,
        },
      },
    });

    if (!isEmpty(city)) {
      return next(
        createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'City')
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

  async updateCityRequestValidation(req: any, res: any, next: any) {
    try {
      const { cityId } = req.params;
      const { stateId, name } = req.body;
      const isExist = await City.findOne({ where: { cityId: cityId } });
      if (!isExist) {
        throw createError(400, templateConstants.INVALID('cityId'));
      }
      if (stateId) {
        const isExist = await State.findOne({ where: { stateId: stateId } });
        if (!isExist) {
          throw createError(400, templateConstants.INVALID('stateId'));
        }
      }
      const isNameExist = await City.findOne({
        where: { name: { [Op.regexp]: name }, cityId: { [Op.ne]: cityId } },
      });
      if (isNameExist) {
        throw createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'City')
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

const cityPolicy = new CityPolicy();
export { cityPolicy };
