import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import { UserArea } from '../../../models/User/UserArea';

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
        attributes: [
          'stateId',
          'name',
          'status',
          'createdAt',
          'updatedAt',
          'stateGstNo',
          'blueverseAddress',
          'blueverseEmail',
        ],
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

  // user State List
  async getUserStateList(userId: string, filters: any) {
    try {
      return await State.findAll({
        attributes: ['stateId', 'name'],
        order: [['name', 'ASC']],
        where: filters,
        include: [
          {
            model: UserArea,
            attributes: ['userAreaId'],
            where: {
              userId: userId,
            },
          },
          {
            model: Region,
            attributes: ['regionId', 'name', 'status'],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const stateService = new StateService();
export { stateService };
