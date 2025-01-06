import { Region } from '../../../models/region';

class RegionService {
  async store(data: any): Promise<any> {
    const result = await Region.create({ ...data });
    return result;
  }

  /**
   * Get paginated list of state
   *
   *
   * @returns {*}
   */
  async index() {
    try {
      return await Region.findAll({
        attributes: ['regionId', 'name', 'status', 'createdAt', 'updatedAt'],
        order: [['name', 'ASC']],
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const regionService = new RegionService();
export { regionService };
