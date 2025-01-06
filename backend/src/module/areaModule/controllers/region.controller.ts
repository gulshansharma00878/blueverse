import { regionService } from '../services/region.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
class RegionController {
  /**
   * Create Region
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await regionService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', `New region ${results.name}`),
      results,
      200
    );
  };

  /**
   * Get list of regions
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any) => {
    const { manageWash } = req.query;
    const { role, userId } = res.user;
    let regionList;
    if (
      !isNullOrUndefined(manageWash) &&
      (role === config.userRolesObject.AREA_MANAGER ||
        role == config.userRolesObject.OEM)
    ) {
      regionList = await regionService.getUserRegionList(userId);
    } else {
      regionList = await regionService.index();
    }

    return createResponseObject(
      res,
      CONSTANT.INDEX.replace('ENTITY', 'Region'),
      regionList,
      200
    );
  };
}

const regionController = new RegionController();
export { regionController };
