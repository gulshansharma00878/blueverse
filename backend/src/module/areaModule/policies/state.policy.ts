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
    let OpCondition: any = [];
    if (data.name) {
      OpCondition.push({
        name: {
          [Op.regexp]: data.name,
        },
      });
    }
    if (data.stateGstNo) {
      OpCondition.push({
        stateGstNo: data.stateGstNo,
      });
    }
    const state = await State.findOne({
      where: {
        [Op.or]: OpCondition,
      },
    });
    if (!isEmpty(state)) {
      let errorMessage = '';
      if (data.stateGstNo && state.stateGstNo == data.stateGstNo) {
        errorMessage = CONSTANT.ALREADY_EXIST.replace('ENTITY', 'stateGstNo');
      } else {
        errorMessage = CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace(
          'ENTITY',
          'State'
        );
      }
      if (errorMessage) {
        return next(createError(400, errorMessage));
      }
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
      const { regionId, name, stateGstNo } = req.body;
      const isExist = await State.findOne({ where: { stateId: stateId } });
      if (!isExist) {
        throw createError(400, templateConstants.INVALID('stateId'));
      }
      let OpCondition: any = [];
      if (name) {
        OpCondition.push({
          name: {
            [Op.regexp]: name,
          },
        });
      }
      if (stateGstNo) {
        OpCondition.push({
          stateGstNo: stateGstNo,
        });
      }
      const isNameExist = await State.findOne({
        where: {
          [Op.or]: OpCondition,
          stateId: { [Op.ne]: stateId },
        },
      });
      if (isNameExist) {
        let errorMessage = '';
        if (stateGstNo && isNameExist.stateGstNo == stateGstNo) {
          errorMessage = CONSTANT.ALREADY_EXIST.replace('ENTITY', 'stateGstNo');
        } else {
          errorMessage = CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace(
            'ENTITY',
            'State'
          );
        }
        if (errorMessage) {
          return next(createError(400, errorMessage));
        }
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

  async validateStateNameExist(req: any, res: any, next: any) {
    try {
      const { cityName, stateName } = dataFromRequest(req);
      let state = await State.findOne({
        where: {
          name: {
            [Op.iLike]: stateName,
          },
        },
      });
      if (!state) {
        throw createError(
          400,
          templateConstants.DOES_NOT_EXIST('State with this name')
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  }
}

const statePolicy = new StatePolicy();
export { statePolicy };
