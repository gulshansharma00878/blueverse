import { cityService } from '../services/city.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { templateConstants } from '../../../common/templateConstants';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import cities from '../../../common/stateCity';
import { validate as isValidUUID } from 'uuid';
import db from '../../../models/index';
import { Op } from 'sequelize';
import { Region } from '../../../models/region';
import { config } from '../../../config/config';
import { isNullOrUndefined } from '../../../common/utility';
class CityController {
  /**
   * Create City
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await cityService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', `New city ${results.name}`),
      results,
      200
    );
  };

  /**
   * Get paginated list of citys
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const { manageWash } = req.query;
    const { role, userId } = res.user;
    let cityList;
    if (
      !isNullOrUndefined(manageWash) &&
      (role === config.userRolesObject.AREA_MANAGER ||
        role == config.userRolesObject.OEM)
    ) {
      cityList = await cityService.getUserCityList(
        userId,
        dataFromRequest(req, 'filters')
      );
    } else {
      cityList = await cityService.index(dataFromRequest(req, 'filters'));
    }
    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'City'),
      cityList,
      200
    );
  };

  async updateCity(req: any, res: any, next: any) {
    try {
      const { cityId } = req.params;
      const { stateId, name } = req.body;
      const updateData: any = {};
      if (stateId) updateData['stateId'] = stateId;
      if (name) updateData['name'] = name;
      if (Object.keys(updateData).length) {
        await City.update(updateData, { where: { cityId: cityId } });
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('City'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async syncCityFromState(req: any, res: any, next: any) {
    try {
      const cityList: any = cities;
      const states: any = await State.findAll({
        where: { status: 1 },
        raw: true,
      });
      for (const citystate of states) {
        const data = [];
        const citylist = cityList[citystate.name];
        if (citylist) {
          for (const city of citylist) {
            if (
              city !== 'Surat' &&
              city !== 'New Delhi' &&
              city !== 'Gurgaon'
            ) {
              data.push({
                name: city,
                stateId: citystate.stateId,
                status: 1,
              });
            }
          }
          if (data.length > 0) {
            await City.bulkCreate(data);
          }
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  }

  // city list for oem and area manager
  async getMultipleCityList(req: any, res: any, next: any) {
    try {
      const { stateIds } = req.query;
      const stateIdArr = [];
      if (stateIds) {
        for (const id of stateIds.split(',')) {
          if (isValidUUID(id)) {
            stateIdArr.push(id);
          }
        }
      }
      const result: any = await City.findAll({
        include: [
          {
            model: State,
            attributes: ['stateId', 'name', 'status'],
            include: [
              {
                model: Region,
                attributes: ['regionId', 'name', 'status'],
              },
            ],
          },
        ],
        where: {
          stateId: {
            [Op.or]: stateIdArr,
          },
        },
        order: [
          [db.sequelize.fn('lower', db.sequelize.col('City.name')), 'ASC'],
        ],
      });
      res.locals.response = {
        message: CONSTANT.INDEX.replace('ENTITY', 'City'),
        body: {
          data: result,
        },
      };
      next();
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // City list for customer
  async getCityListForCustomer(req: any, res: any, next: any) {
    try {
      const { stateIds } = req.query;
      const stateIdArr = [];
      if (stateIds) {
        for (const id of stateIds.split(',')) {
          if (isValidUUID(id)) {
            stateIdArr.push(id);
          }
        }
      }
      const stateWhereCondition: any = {};
      if (stateIdArr.length > 0) {
        stateWhereCondition['stateId'] = {
          [Op.in]: stateIdArr,
        };
      }
      const result: any = await City.findAll({
        include: [
          {
            model: State,
            attributes: ['stateId', 'name'],
            // include: [
            //   {
            //     model: Region,
            //     attributes: ['regionId', 'name', ],
            //   },
            // ],
          },
        ],
        where: stateWhereCondition,
        order: [
          [db.sequelize.fn('lower', db.sequelize.col('City.name')), 'ASC'],
        ],
      });
      res.locals.response = {
        message: CONSTANT.INDEX.replace('ENTITY', 'City'),
        body: {
          data: result,
        },
      };
      next();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCityDetail(req: any, res: any, next: any) {
    try {
      const { cityName, stateName } = dataFromRequest(req);

      // First, find the state
      let state = await State.findOne({
        where: {
          name: {
            [Op.iLike]: stateName,
          },
        },
      });
      let city;
      // If the state doesn't exist, create it
      if (state) {
        // state = await State.create({
        //   name: stateName,
        // });
        // Then, find the city
        city = await City.findOne({
          where: {
            name: {
              [Op.iLike]: cityName,
            },
          },
          include: {
            model: State,
            where: {
              name: {
                [Op.iLike]: stateName,
              },
            },
          },
        });

        // If the city doesn't exist, create it
        if (!city) {
          city = await City.create({
            name: cityName,
            stateId: state.stateId,
          });
        }
      }

      res.locals.response = {
        message: templateConstants.DETAIL('city'),
        body: {
          data: city,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const cityController = new CityController();
export { cityController };
