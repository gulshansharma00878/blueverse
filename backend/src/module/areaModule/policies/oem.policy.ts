import { dataFromRequest } from '../../../helpers/basic_helper';
import { City } from '../../../models/city';
import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { CONSTANT } from '../constant';
import { Region } from '../../../models/region';
import { OEM } from '../../../models/oem';
import { Op } from 'sequelize';
import { templateConstants } from '../../../common/templateConstants';

class OemPolicy {
  /**
   * store
   *
   * @param req
   * @param res
   * @param next
   *
   */
  store = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req);

    const oem = await OEM.findOne({
      where: {
        name: {
          [Op.regexp]: data.name,
        },
      },
    });

    if (!isEmpty(oem)) {
      return next(
        createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'OEM')
        )
      );
    }

    return next();
  };

  /**
   * index
   *
   * @param req
   * @param res
   * @param next
   *
   */
  index = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req);
    return next();
  };
  async updateOEMRequestValidation(req: any, res: any, next: any) {
    try {
      const { oemId } = req.params;
      const { name } = req.body;
      const isExist = await OEM.findOne({ where: { oemId: oemId } });
      if (!isExist) {
        throw createError(400, templateConstants.INVALID('oemId'));
      }

      const isNameExist = await OEM.findOne({
        where: { name: { [Op.regexp]: name }, oemId: { [Op.ne]: oemId } },
      });
      if (isNameExist) {
        throw createError(
          400,
          CONSTANT.ENTITY_EXIST_WITH_SAME_NAME.replace('ENTITY', 'OEM')
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

const oemPolicy = new OemPolicy();
export { oemPolicy };
