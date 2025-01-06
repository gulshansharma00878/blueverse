import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { Region } from '../../../models/region';
import { UserArea } from '../../../models/User/UserArea';

class CityService {
  async store(data: any): Promise<any> {
    const result = await City.create({ ...data });
    return result;
  }

  /**
   * Get list of city
   *
   *
   * @returns {*}
   */
  async index(filters: any) {
    try {
      return await City.findAll({
        where: filters,
        attributes: ['cityId', 'name', 'status', 'createdAt', 'updatedAt'],
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
        order: [['name', 'ASC']],
      });
    } catch (e) {
      console.log(e);
    }
  }

  // user City List
  async getUserCityList(userId: string, filters: any) {
    try {
      return await City.findAll({
        where: filters,
        attributes: ['cityId', 'name', 'status', 'createdAt', 'updatedAt'],
        order: [['name', 'ASC']],
        include: [
          {
            model: UserArea,
            attributes: ['userAreaId'],
            where: {
              userId: userId,
            },
          },
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
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async cityExist(cityId: string) {
    try {
      return await City.findOne({
        where: {
          cityId: cityId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const cityService = new CityService();
export { cityService };
