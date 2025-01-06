import { passwordService } from '../../../services/user/passwordService';
import { generatePassword, isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
import { areaManagerService } from '../services/areaManager.service';
import { userService } from '../../userModule/services/user.service';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { messageService } from '../../../services/common/messageService';
import { tokenService } from '../../../services/common/tokenService';

class AreaManagerController {
  async getAreaManagerlist(req: any, res: any, next: any) {
    try {
      const { search, limit, offset } = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const body = {
        search,
        _limit,
        _offset,
      };
      const areaManagers = await areaManagerService.getAreaManagers(body);

      res.locals.response = {
        body: {
          data: {
            records: areaManagers.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              areaManagers.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Area Manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async addAreaManager(req: any, res: any, next: any) {
    try {
      const {
        name,
        email,
        description,
        phone,
        area,
        isActive,
        oemId,
        dealersId,
      } = req.body;
      const password = generatePassword();
      const passwordHash = await passwordService.hashPassword(password);
      const areaMangerId = await userService.getUserIdByUserType(
        config.userRolesObject.AREA_MANAGER
      );
      const userDetails: any = {
        username: name,
        uniqueId: areaMangerId,
        email: email.toLowerCase(),
        password: passwordHash,
        phone: phone,
        isActive: isActive,
        role: config.userRolesObject.AREA_MANAGER,
        description: description,
        isKycDone: null,
        oemId: oemId,
      };
      let user: any = await areaManagerService.createUser(userDetails);
      if (user) {
        let userAreaDetails = area.map((areaDetails: any) => ({
          ...areaDetails,
          userId: user.userId,
        }));
        await areaManagerService.createUserArea(userAreaDetails);
        let AreaManagerDealers: any = [];
        dealersId.map((dealerId: string) => {
          AreaManagerDealers.push({
            areaManagerId: user.userId,
            dealerId: dealerId,
          });
        });
        await areaManagerService.createAreaManagerDealers(AreaManagerDealers);
        messageService.sendManagerRegistrationMessageWithPassword(
          email,
          user.username,
          password,
          config.userRolesObject.AREA_MANAGER
        );
      }
      res.locals.response = {
        body: { data: { user_id: user.userId } },
        message: templateConstants.CREATE_USER('area manager', name),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getAreaManagerDetail(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const areaManagerDetails =
        await areaManagerService.getAreaManagerCompleteDetail(userId);
      res.locals.response = {
        body: {
          data: {
            records: areaManagerDetails,
          },
        },
        message: templateConstants.DETAIL('area manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateAreaManagerDetail(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const { name, description, phone, dealersId, area, isActive, oemId } =
        req.body;
      let user: any = {};
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
        await areaManagerService.updateUser(user, userId);
      }
      // update user area details
      if (area) {
        let userAreaDetails = area.map((areaDetails: any) => ({
          ...areaDetails,
          userId: userId,
        }));
        await areaManagerService.deleteUserArea(userId);
        if (userAreaDetails.length > 0) {
          await areaManagerService.createUserArea(userAreaDetails);
        }
      }
      // update user dealers
      if (dealersId) {
        let AreaManagerDealers: any = [];
        dealersId.map((dealerId: String) => {
          AreaManagerDealers.push({
            areaManagerId: userId,
            dealerId: dealerId,
          });
        });
        await areaManagerService.deleteAreaManagerDealers(userId);
        if (AreaManagerDealers.length > 0) {
          await areaManagerService.createAreaManagerDealers(AreaManagerDealers);
        }
      }
      // logout if deactivate
      if (isDeactivate) {
        await tokenService.logoutUserToken(userId);
      }
      res.locals.response = {
        body: {
          data: {
            areaManagerId: userId,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('area manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async deleteAreaMangerDetail(req: any, res: any, next: any) {
    try {
      const { userId } = req.params;
      const loggedInUserID = res.user.userId;
      // Delete area manager
      await userService.temporaryDeleteUser(
        userId,
        config.userRolesObject.AREA_MANAGER,
        loggedInUserID
      );
      await tokenService.logoutUserToken(userId);
      res.locals.response = {
        body: { data: { user_id: userId } },
        message: templateConstants.DELETED_SUCCESSFULLY('Area manager'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const areaManagerController = new AreaManagerController();
export { areaManagerController };
