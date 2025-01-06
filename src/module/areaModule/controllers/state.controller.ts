import { stateService } from '../services/state.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { templateConstants } from '../../../common/templateConstants';
import { State } from '../../../models/state';

class StateController {
  /**
   * Create State
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await stateService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', `New state ${results.name}`),
      results,
      200
    );
  };

  /**
   * Get paginated list of states
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const results = await stateService.index(dataFromRequest(req, 'filters'));
    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'State'),
      results,
      200
    );
  };
  async updateState(req: any, res: any, next: any) {
    try {
      const { stateId } = req.params;
      const { regionId, name } = req.body;
      const updateData: any = {};
      if (regionId) updateData['regionId'] = regionId;
      if (name) updateData['name'] = name;
      if (Object.keys(updateData).length) {
        await State.update(updateData, { where: { stateId: stateId } });
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('State'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const stateController = new StateController();
export { stateController };
