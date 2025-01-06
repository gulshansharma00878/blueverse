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
    const results = await cityService.index(dataFromRequest(req, 'filters'));
    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'City'),
      results,
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
        console.log(citystate, '========');
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
}

const cityController = new CityController();
export { cityController };
