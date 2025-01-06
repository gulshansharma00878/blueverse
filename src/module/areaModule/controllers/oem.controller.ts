import { oemService } from '../services/oem.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { templateConstants } from '../../../common/templateConstants';
import { OEM } from '../../../models/oem';

class OemController {
  /**
   * Create Oem
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await oemService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', `New oem ${results.name}`),
      results,
      200
    );
  };

  /**
   * Get paginated list of oems
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const results = await oemService.index(dataFromRequest(req, 'filters'));
    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'OEM'),
      results,
      200
    );
  };
  async updateOEM(req: any, res: any, next: any) {
    try {
      const { oemId } = req.params;
      const { name, status } = req.body;
      const updateData: any = {};
      if (name) updateData['name'] = name;
      if (status === 1 || status === 0) updateData['status'] = status;
      if (Object.keys(updateData).length) {
        await OEM.update(updateData, { where: { oemId: oemId } });
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('OEM'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const oemController = new OemController();
export { oemController };
