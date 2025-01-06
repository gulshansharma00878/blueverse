import { User } from '../../../models/User/user';
import { Machine } from '../../../models/Machine/Machine';
import { Outlet } from '../../../models/outlet';

class OutletService {
  async store(data: any): Promise<any> {
    const result = await Outlet.create({ ...data });
    return result;
  }

  /**
   * Get list of outlets
   *
   *
   * @returns {*}
   */
  async index(filters: any) {
    try {
      return await Outlet.findAll({
        where: filters,
        include: [
          {
            model: Machine,
            attributes: ['name', 'machineGuid'],
            include: [
              {
                model: User,
                attributes: ['username', 'userId'],
              },
            ],
          },
        ],
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const outletService = new OutletService();
export { outletService };
