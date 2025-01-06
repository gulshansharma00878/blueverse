import { Machine } from '../../../models/Machine/Machine';

class MachineService {
  async store(data: any): Promise<any> {
    const result = await Machine.create({ ...data });
    return result;
  }

  /**
   * Get list of machine
   *
   *
   * @returns {*}
   */
  async index(filters: any) {
    try {
      return await Machine.findAll({
        where: filters,
        order:[['createdAt','DESC']]
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const machineService = new MachineService();
export { machineService };
