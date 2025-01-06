import { stateService } from '../services/state.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { templateConstants } from '../../../common/templateConstants';
import { State } from '../../../models/state';
import { Op } from 'sequelize';
import { validate as isValidUUID } from 'uuid';
import { City } from '../../../models/city';
import db from '../../../models/index';
import { Region } from '../../../models/region';
import { config } from '../../../config/config';
import { isNullOrUndefined } from '../../../common/utility';
class StateController {
  /**
   * Create State
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await stateService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', `New state ${results.name}`),
      results,
      200
    );
  };

  /**
   * Get paginated list of states
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const { manageWash } = req.query;
    const { role, userId, regionIds } = res.user;
    let stateList;
    if (
      !isNullOrUndefined(manageWash) &&
      (role === config.userRolesObject.AREA_MANAGER ||
        role == config.userRolesObject.OEM)
    ) {
      stateList = await stateService.getUserStateList(
        userId,
        dataFromRequest(req, 'filters')
      );
    } else {
      stateList = await stateService.index(dataFromRequest(req, 'filters'));
    }
    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'State'),
      stateList,
      200
    );
  };
  async updateState(req: any, res: any, next: any) {
    try {
      const { stateId } = req.params;
      const { regionId, name, stateGstNo, blueverseAddress, blueverseEmail } =
        req.body;
      const updateData: any = {
        regionId: regionId,
        name: name,
        stateGstNo: stateGstNo,
        blueverseAddress: blueverseAddress,
        blueverseEmail: blueverseEmail,
      };
      await State.update(updateData, { where: { stateId: stateId } });

      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('State'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // state list for oem and area manager
  async getMultipleStateList(req: any, res: any, next: any) {
    try {
      const { regionIds } = req.query;
      const regionIdArr = [];
      if (regionIds) {
        for (const id of regionIds.split(',')) {
          if (isValidUUID(id)) {
            regionIdArr.push(id);
          }
        }
      }
      const result = await State.findAll({
        attributes: ['stateId', 'name', 'stateGstNo', 'blueverseAddress'],
        include: [
          {
            model: Region,
            attributes: ['regionId', 'name', 'status'],
          },
        ],
        where: {
          regionId: {
            [Op.or]: regionIdArr,
          },
        },
        order: [
          [db.sequelize.fn('lower', db.sequelize.col('State.name')), 'ASC'],
        ],
      });
      res.locals.response = {
        message: CONSTANT.INDEX.replace('ENTITY', 'State'),
        body: {
          data: result,
        },
      };
      next();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getStateListForCustomer(req: any, res: any, next: any) {
    try {
      const { regionIds } = req.query;
      const regionIdArr = [];
      if (regionIds) {
        for (const id of regionIds.split(',')) {
          if (isValidUUID(id)) {
            regionIdArr.push(id);
          }
        }
      }
      const whereCondition: any = {};
      if (regionIdArr.length > 0) {
        whereCondition['regionId'] = {
          [Op.in]: regionIdArr,
        };
      }
      const result = await State.findAll({
        attributes: ['stateId', 'name'],
        include: [
          {
            model: Region,
            attributes: ['regionId', 'name'],
          },
        ],
        where: whereCondition,
        order: [
          [db.sequelize.fn('lower', db.sequelize.col('State.name')), 'ASC'],
        ],
      });
      res.locals.response = {
        message: CONSTANT.INDEX.replace('ENTITY', 'State'),
        body: {
          data: result,
        },
      };
      next();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const stateController = new StateController();
export { stateController };
