import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { Region } from '../../../models/region';

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
}

const cityService = new CityService();
export { cityService };
