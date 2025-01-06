import { Region } from '../../../models/region';
import { State } from '../../../models/state';

class StateService {
  async store(data: any): Promise<any> {
    const result = await State.create({ ...data });
    return result;
  }

  /**
   * Get paginated list of state
   *
   *
   * @returns {*}
   */
  async index(filters: any) {
    try {
      return await State.findAll({
        attributes: ['stateId', 'name', 'status', 'createdAt', 'updatedAt'],
        where: filters,
        include: [
          {
            model: Region,
            attributes: ['regionId', 'name', 'status'],
          },
        ],
        order: [['name', 'ASC']],
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const stateService = new StateService();
export { stateService };
