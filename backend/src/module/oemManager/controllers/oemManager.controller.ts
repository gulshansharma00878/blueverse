import { passwordService } from '../../../services/user/passwordService';
import { generatePassword, isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
import { userService } from '../../userModule/services/user.service';
import { oemManagerService } from '../services/oemManger.service';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { messageService } from '../../../services/common/messageService';
import { tokenService } from '../../../services/common/tokenService';

class OEMManagerController {
  async getOEMMangerlist(req: any, res: any, next: any) {
    try {
      const { search, limit, offset } = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const body = {
        search,
        _limit,
        _offset,
      };
      const oemManagers = await oemManagerService.getOEMManagers(body);
      res.locals.response = {
        body: {
          data: {
            records: oemManagers.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              oemManagers.count
            ),
          },
        },
        message: templateConstants.LIST_OF('OEM Manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async addOEMManger(req: any, res: any, next: any) {
    try {
      const {
        name,
        email,
        description,
        phone,
        area,
        oemId,
        isActive,
        dealersId,
      } = req.body;
      const password = generatePassword();
      const passwordHash = await passwordService.hashPassword(password);
      const oemMangerId = await userService.getUserIdByUserType(
        config.userRolesObject.OEM
      );
      const userDetails: any = {
        username: name,
        uniqueId: oemMangerId,
        email: email.toLowerCase(),
        password: passwordHash,
        phone: phone,
        isActive: isActive,
        role: config.userRolesObject.OEM,
        description: description,
        isKycDone: null,
        oemId: oemId,
      };
      let user: any = await oemManagerService.createUser(userDetails);
      if (user) {
        let userAreaDetails = area.map((areaDetails: any) => ({
          ...areaDetails,
          userId: user.userId,
        }));
        await oemManagerService.createUserArea(userAreaDetails);
        let OEMDealersDetails: any = [];
        dealersId.map((dealerId: string) => {
          OEMDealersDetails.push({
            oemManagerId: user.userId,
            dealerId: dealerId,
          });
        });
        await oemManagerService.createOEMDealerships(OEMDealersDetails);
        messageService.sendManagerRegistrationMessageWithPassword(
          email,
          user.username,
          password,
          config.userRolesObject.OEM
        );
      }
      res.locals.response = {
        body: { data: { user_id: user.userId } },
        message: templateConstants.CREATE_USER('oem manager', name),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getOEMManagerDetail(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const oemManagerDetails =
        await oemManagerService.getOEMManagerCompleteDetail(userId);
      res.locals.response = {
        body: {
          data: {
            records: oemManagerDetails,
          },
        },
        message: templateConstants.DETAIL('oem manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateOEMManagerDetail(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const { name, description, phone, area, dealersId, oemId, isActive } =
        req.body;
      let user: any = {};
      let OEMDealersDetails: any = [];
      let isDeactivate = false;
      // update user details
      if (name) {
        user['username'] = name;
      }
      if (description) {
        user['description'] = description;
      }
      if (phone) {
        user['phone'] = phone;
      }
      if (oemId) {
        user['oemId'] = oemId;
      }
      if (!isNullOrUndefined(isActive)) {
        user['isActive'] = isActive;
        if (isActive === false) {
          isDeactivate = true;
        }
      }
      if (Object.keys(user).length) {
        await oemManagerService.updateUser(user, userId);
      }
      // update user area details
      if (area) {
        let userAreaDetails = area.map((areaDetails: any) => ({
          ...areaDetails,
          userId: userId,
        }));
        await oemManagerService.deleteUserArea(userId);
        if (userAreaDetails.length > 0) {
          await oemManagerService.createUserArea(userAreaDetails);
        }
      }
      // update user dealers
      if (dealersId) {
        dealersId.map((dealerId: String) => {
          OEMDealersDetails.push({
            oemManagerId: userId,
            dealerId: dealerId,
          });
        });
        await oemManagerService.deleteOEMDealers(userId);
        if (OEMDealersDetails.length > 0) {
          await oemManagerService.createOEMDealerships(OEMDealersDetails);
        }
      }
      // logout if deactivate
      if (isDeactivate) {
        await tokenService.logoutUserToken(userId);
      }
      res.locals.response = {
        body: {
          data: {
            oemManagerId: userId,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('oem manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async deleteOEMManagerDetail(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const loggedInUserID = res.user.userId;
      await userService.temporaryDeleteUser(
        userId,
        config.userRolesObject.OEM,
        loggedInUserID
      );
      await tokenService.logoutUserToken(userId);
      res.locals.response = {
        body: { data: { user_id: userId } },
        message: templateConstants.DELETED_SUCCESSFULLY('OEM manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const oemManagerController = new OEMManagerController();
export { oemManagerController };
