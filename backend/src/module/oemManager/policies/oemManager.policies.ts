import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { User } from '../../../models/User/user';
import stringConstants from '../../../common/stringConstants';
import createError from 'http-errors';
import { config } from '../../../config/config';
import { Op } from 'sequelize';
import { OEM } from '../../../models/oem';

class ValidateOEMManagerApis {
  async validateRegisterRequest(req: any, res: any, next: any) {
    try {
      const { name, email, phone, dealersId, oemId } = req.body;
      if (isNullOrUndefined(name)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('password'));
      }
      if (isNullOrUndefined(email)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('email'));
      }
      let OpCondition: any = [
        {
          email: email.toLowerCase(),
        },
      ];
      if (phone) {
        OpCondition.push({
          phone: phone,
        });
      }
      const user = await User.findOne({
        where: {
          [Op.or]: OpCondition,
          isActive: true,
          deletedAt: null,
        },
      });
      if (user) {
        if (user.email === email) {
          throw createError(400, templateConstants.ALREADY_EXIST('Email Id'));
        } else if (user.phone && user.phone === phone) {
          throw createError(400, templateConstants.ALREADY_EXIST('Phone no'));
        }
      }
      let vaildUUid = true;
      dealersId.map((dealerId: string) => {
        if (!isValidGuid(dealerId)) {
          vaildUUid = false;
        }
      });
      if (!vaildUUid) {
        throw createError(400, templateConstants.INVALID('dealerId'));
      }
      if (oemId) {
        if (!isValidGuid(oemId)) {
          throw createError(400, templateConstants.INVALID('oem'));
        }
        const oem = await OEM.findOne({
          where: {
            oemId: oemId,
          },
        });
        if (!oem) {
          throw createError(400, templateConstants.INVALID('oem'));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateUUID(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      if (!isValidGuid(userId)) {
        throw createError(400, templateConstants.INVALID('oem manager id'));
      }
      const user = await User.findOne({
        where: {
          userId: userId,
          role: config.userRolesObject.OEM,
          deletedAt: null,
        },
      });
      if (!user) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateUpdateOEM(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const { name, description, phone, area, dealersId, oemId, isActive } =
        req.body;
      if (!isValidGuid(userId)) {
        throw createError(400, templateConstants.INVALID('oem manager id'));
      }
      // Check user exist or not
      const user = await User.findOne({
        where: {
          userId: userId,
          role: config.userRolesObject.OEM,
          deletedAt: null,
        },
      });
      if (!user) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      // Check new phone no already exist or not
      if (phone) {
        const isPhoneExist = await User.findOne({
          where: {
            userId: { [Op.ne]: userId },
            phone: phone,
          },
        });
        if (isPhoneExist) {
          throw createError(400, templateConstants.ALREADY_EXIST('Phone no'));
        }
      }
      if (oemId) {
        if (!isValidGuid(oemId)) {
          throw createError(400, templateConstants.INVALID('oem'));
        }
        const oem = await OEM.findOne({
          where: {
            oemId: oemId,
          },
        });
        if (!oem) {
          throw createError(400, templateConstants.INVALID('oem'));
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateOEMManagerApis = new ValidateOEMManagerApis();
export { validateOEMManagerApis };
