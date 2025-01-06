import { OEM } from '../../../models/oem';

class OEMService {
  async store(data: any): Promise<any> {
    const result = await OEM.create({ ...data });
    return result;
  }

  /**
   * Get list of oem
   *
   *
   * @returns {*}
   */
  async index(filters: any) {
    try {
      return await OEM.findAll({
        attributes: ['oemId', 'name', 'status', 'updatedAt', 'createdAt'],
        where: filters,
        order: [['createdAt', 'DESC']],
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const oemService = new OEMService();
export { oemService };
