import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { User } from '../../../models/User/user';
import { UserArea } from '../../../models/User/UserArea';
import stringConstants from '../../../common/stringConstants';
import createError from 'http-errors';
import { config } from '../../../config/config';
import { Op } from 'sequelize';
import { OEM } from '../../../models/oem';

class ValidateAreaManagerApis {
  async validateRegisterRequest(req: any, res: any, next: any) {
    try {
      const { name, email, description, phone, area, isActive, oemId } =
        req.body;
      if (isNullOrUndefined(name)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('password'));
      }
      if (isNullOrUndefined(email)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('email'));
      }
      if (isNullOrUndefined(oemId)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('oemId'));
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
        attributes: ['email', 'phone', 'oemId', 'role'],
        where: {
          [Op.or]: OpCondition,
          isActive: true,
          deletedAt: null,
        },
        include: [
          {
            model: UserArea,
            attributes: ['regionId', 'stateId', 'cityId'],
          },
        ],
      });
      if (user) {
        if (user.email === email) {
          throw createError(400, templateConstants.ALREADY_EXIST('Email Id'));
        } else if (user.phone && user.phone === phone) {
          throw createError(400, templateConstants.ALREADY_EXIST('Phone no'));
        }
      }
      if (isValidGuid(oemId)) {
        const oemDetails = await OEM.findOne({
          where: {
            oemId: oemId,
          },
        });

        if (!oemDetails) {
          throw createError(400, templateConstants.DOES_NOT_EXIST('OEM'));
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
        throw createError(400, templateConstants.INVALID('area manager id'));
      }
      const user = await User.findOne({
        where: {
          userId: userId,
          role: config.userRolesObject.AREA_MANAGER,
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
  async validateUpdateAreaManager(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const { phone, area, oemId } = req.body;
      if (!isValidGuid(userId)) {
        throw createError(400, templateConstants.INVALID('area manager id'));
      }
      // Check area manager exist or not
      const user = await User.findOne({
        where: {
          userId: userId,
          role: config.userRolesObject.AREA_MANAGER,
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
            deletedAt: null,
            isActive: true,
          },
        });
        if (isPhoneExist) {
          throw createError(400, templateConstants.ALREADY_EXIST('Phone no'));
        }
      }
      if (isValidGuid(oemId)) {
        const oemDetails = await OEM.findOne({
          where: {
            oemId: oemId,
          },
        });

        if (!oemDetails) {
          throw createError(400, templateConstants.DOES_NOT_EXIST('OEM'));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateAreaManagerApis = new ValidateAreaManagerApis();
export { validateAreaManagerApis };
