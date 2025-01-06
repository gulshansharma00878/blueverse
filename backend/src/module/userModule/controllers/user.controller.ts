import stringConstants from '../../../common/stringConstants';
import { passwordService } from '../../../services/user/passwordService';
import { jwtService } from '../../../services/user/jwtService';
import { tokenService } from '../../../services/common/tokenService';
import { config } from '../../../config/config';
import { User } from '../../../models/User/user';
import { messageService } from '../../../services/common/messageService';
import { NextFunction, Request } from 'express';
import { templateConstants } from '../../../common/templateConstants';
import {
  generatePassword,
  isNullOrUndefined,
  isValidGuid,
} from '../../../common/utility';
import { Op } from 'sequelize';
import { paginatorService } from '../../../services/commonService';
import { redisService } from '../../../services/common/redisService';
import { OEM } from '../../../models/oem';
import awsDeleteService from '../../../services/common/awsService/deleteService';
import { Module } from '../../../models/User/Module';
import { SubRole } from '../../../models/User/SubRole';
import { SubRoleModulePermission } from '../../../models/User/SubRoleModulePermission';
import { validateUserApis } from '../policies/user.policies';
import { userService } from '../services/user.service';
import db from '../../../models/index';
import createError from 'http-errors';
import { validate as isValidUUID } from 'uuid';
import { Outlet } from '../../../models/outlet';
import { Machine } from '../../../models/Machine/Machine';
import { MachineAgent } from '../../../models/Machine/MachineAgent';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { notificationService } from '../../../services/notifications/notification';
import { notificationConstant } from '../../../common/notificationConstants';
import { UserDevice } from '../../../models/User/UserDevice';
import { oemManagerService } from '../../../module/oemManager/services/oemManger.service';
import { areaManagerService } from '../../../module/areaManagerModule/services/areaManager.service';

class UserController {
  async register(req: any, res: any, next: any) {
    try {
      const { email, password, username } = req.body;
      const passwordHash = await passwordService.hashPassword(password);
      const user = await User.create({
        email: email.toLowerCase(),
        password: passwordHash,
        username: username,
      });
      const token = await jwtService.generateToken({
        userId: user.dataValues.userId,
        username: user.dataValues.username,
        email: user.dataValues.email,
        role: user.role,
        profileImg: user.profileImg,
        phone: user.phone,
      });
      await tokenService.setToken(
        user.dataValues.userId,
        token,
        config.authConfig.tokenExpiry
      );
      res.locals.response = {
        body: {
          data: {
            user: {
              token: token,
            },
          },
        },
        message: stringConstants.userControllerMessage.REGISTERED,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async login(req: any, res: any, next: any) {
    try {
      const { email } = req.body;
      const {
        role,
        isKycDone,
        phone,
        userId,
        username,
        profileImg,
        subRoleId,
        parentUserId,
        oemId,
        userArea,
        oem,
      } = res.locals.request.user;
      let data: any = {};
      if (role === config.userRolesObject.DEALER && !isKycDone) {
        data = {
          isKycDone: isKycDone,
          role: config.userRolesObject.DEALER,
          token: null,
        };
      } else {
        let permission;
        const userDetail = await userService.getUserWithPermission(userId);
        if (userDetail.subRole) {
          permission = userDetail.subRole;
        }
        const token = await userService.createLoginToken(
          res.locals.request.user,
          email
        );
        data = {
          token: token,
          isKycDone: isKycDone,
          role: role,
          username,
          phone,
          profileImg,
          subRoleId,
          parentUserId,
          oemId,
          userArea,
          permissions: permission,
        };
        if (
          role == config.userRolesObject.AREA_MANAGER ||
          role == config.userRolesObject.OEM
        ) {
          data['oem'] = oem;
        }
      }
      res.locals.response = {
        body: {
          data: {
            user: data,
          },
        },
        message: stringConstants.userControllerMessage.LOGGED_IN,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async logout(req: any, res: any, next: any) {
    try {
      await tokenService.deleteToken(res.user.userId);
      res.locals.response = {
        message: stringConstants.userControllerMessage.LOGGED_OUT,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async forgotPassword(req: any, res: any, next: any) {
    try {
      const { email } = req.body;
      const { userId, username } = res.locals.request.user;
      await messageService.sendPasswordForgotMessage(
        email,
        username ? username : 'User'
      );
      res.locals.response = {
        body: {
          data: {
            name: username,
          },
        },
        message: stringConstants.userControllerMessage.VERIFICATION_MAIL_SENT,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: any, res: any, next: any) {
    try {
      const { email } = req.body;
      const verificationCode = generatePassword();
      await redisService.delete(email);
      await redisService.setWithExpiry(
        email,
        verificationCode + config.SECRET_KEY_FOR_PASSWORD_FORGOT,
        config.otpConfig.otpExpiry
      );
      res.locals.response = {
        message: stringConstants.genericMessage.OTP_VERIFIED_SUCCESSFULLY,
        body: { data: { code: verificationCode } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async resetPassword(req: any, res: any, next: any) {
    try {
      const { new_password, email } = req.body;
      const { password, oldPasswordOne, userId } = res.locals.request.user;
      const passwordHash = await passwordService.hashPassword(new_password);
      await redisService.delete(email);
      await User.update(
        {
          password: passwordHash,
          oldPasswordOne: password,
          oldPasswordTwo: oldPasswordOne,
        },
        { where: { email: email, userId: userId } }
      );
      await tokenService.logoutUserToken(userId);
      res.locals.response = {
        message: stringConstants.userControllerMessage.RESET_PASSWORD,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async createAgent(req: Request, res: any, next: NextFunction) {
    try {
      const { username, email, phone, is_active } = req.body;
      const password = generatePassword();
      const passwordHash = await passwordService.hashPassword(password);
      const agentId = await userService.getUserIdByUserType(
        config.userRolesObject.FEEDBACK_AGENT
      );
      const agent = await User.create({
        uniqueId: agentId,
        email: email.toLowerCase(),
        username: username,
        phone: phone ? phone : null,
        isActive: is_active,
        password: passwordHash,
        role: config.userRolesObject.FEEDBACK_AGENT,
      });
      messageService.sendAgentRegistrationMessageWithPassword(
        email,
        agent.username,
        password
      );
      res.locals.response = {
        message: templateConstants.CREATE_USER('agent', username),
        body: { data: { user_id: agent.userId } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateAgent(req: Request, res: any, next: NextFunction) {
    try {
      const { id } = req.params;
      const { username, email, phone, is_active } = req.body;
      const dbUser = res.user;
      const updateData: any = {};
      let isDeactivate = false;
      if (username) updateData['username'] = username;
      if (phone) updateData['phone'] = phone;
      if (email) updateData['email'] = email;
      if (!isNullOrUndefined(is_active)) updateData['isActive'] = is_active;
      if (Object.keys(updateData).length) {
        await User.update(updateData, { where: { userId: id } });
      }
      let responseMsg = templateConstants.UPDATED_SUCCESSFULLY('Agent');
      if (
        !isNullOrUndefined(is_active) &&
        is_active == false &&
        dbUser.isActive == true
      ) {
        isDeactivate = true;
        responseMsg = `Agent ${dbUser.username} has been deactivated!`;
      } else if (
        !isNullOrUndefined(is_active) &&
        is_active == true &&
        dbUser.isActive == false
      ) {
        responseMsg = `Agent ${dbUser.username} has been activated!`;
      }
      // logout if deactivate
      if (isDeactivate) {
        await tokenService.logoutUserToken(id);
      }
      res.locals.response = {
        message: responseMsg,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteAgent(req: Request, res: any, next: NextFunction) {
    try {
      const { id } = req.params;
      await User.update(
        { deletedBy: res.user.userId, deletedAt: new Date() },
        { where: { userId: id } }
      );
      await tokenService.logoutUserToken(id);
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Agent'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deactivateAgent(req: Request, res: any, next: NextFunction) {
    try {
      const { id } = req.params;
      await User.update({ isActive: false }, { where: { userId: id } });
      // logout if deactivate
      await tokenService.logoutUserToken(id);
      res.locals.response = {
        message: templateConstants.DEACTIVATED_SUCCESSFULLY('Agent'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async activateAgent(req: Request, res: any, next: NextFunction) {
    try {
      const { id } = req.params;
      await User.update({ isActive: true }, { where: { userId: id } });

      res.locals.response = {
        message: templateConstants.ACTIVATED_SUCCESSFULLY('Agent'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getAgentList(req: Request, res: any, next: NextFunction) {
    try {
      let {
        is_active,
        username,
        offset,
        limit,
        sort_key,
        sort_type,
        outletIds,
      }: any = req.query;
      let _limit = Number(limit);
      let _offset = Number(offset);
      if (!_limit) {
        _limit = 10;
      }
      if (!_offset) {
        _offset = 0;
      } else {
        _offset = (_offset - 1) * _limit;
      }
      const whereCondition: any = {
        deletedAt: null,
        role: config.userRolesObject.FEEDBACK_AGENT,
      };
      //for searching
      if (username) {
        whereCondition[Op.or] = [
          { username: { [Op.iLike]: `%${username}%` } },
          { uniqueId: { [Op.iLike]: `%${username}%` } },
        ];
      }
      if (is_active) {
        if (is_active === 'true' || 'false') {
          whereCondition['isActive'] = is_active;
        }
      }
      let sortType = 'DESC';
      if (!!sort_type && (sort_type == 'ASC' || sort_type == 'DESC')) {
        sortType = sort_type;
      }
      let orderCondition: any = [`createdAt`, `${sortType}`];
      if (!!sort_key) {
        if (sort_key == 'username') {
          orderCondition = [
            db.sequelize.fn('lower', db.sequelize.col('username')),
            sortType,
          ];
        }
      }

      //If outlet id pass then return only assigned agent to this outlet and other who are not assigned to other outlet
      if (outletIds) {
        if (outletIds) {
          const outletIdArr = [];
          for (const outletId of outletIds.split(',')) {
            if (isValidUUID(outletId)) {
              outletIdArr.push(outletId);
            }
          }
          if (outletIdArr.length) {
            const machines = await Machine.findAll({
              where: { outletId: { [Op.in]: outletIdArr } },
              include: [
                {
                  model: MachineAgent,
                  attributes: ['agentId'],
                  required: true,
                },
              ],
            });
            const agentIds = [];
            for (const machine of machines) {
              for (const agent of machine.agents) {
                agentIds.push(agent.agentId);
              }
            }
            let _whereCondition: any = {};
            if (agentIds.length) {
              _whereCondition['agentId'] = { [Op.notIn]: agentIds };
            }

            const assignedAgent = await MachineAgent.findAll({
              attributes: ['agentId'],
              where: _whereCondition,
              raw: true,
            });

            whereCondition['userId'] = {
              [Op.notIn]: assignedAgent.map((el) => el.agentId),
            };
          }
        }
      }

      const users = await User.findAndCountAll({
        where: whereCondition,
        limit: _limit,
        offset: _offset,
        raw: true,
        attributes: [
          'userId',
          'uniqueId',
          'email',
          'phone',
          'username',
          'createdAt',
          'updatedAt',
          'isActive',
        ],
        order: [orderCondition],
      });
      res.locals.response = {
        message: templateConstants.LIST_OF('Agent'),
        body: {
          data: {
            records: users.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              users.count
            ),
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: any, res: any, next: any) {
    try {
      const { new_password } = req.body;
      const hashPassword = await passwordService.hashPassword(new_password);
      const { password, oldPasswordOne, userId } = res.locals.request.user;
      await User.update(
        {
          password: hashPassword,
          oldPasswordOne: password,
          oldPasswordTwo: oldPasswordOne,
        },
        { where: { email: res.user.email, userId: userId } }
      );
      await tokenService.logoutUserToken(userId);
      res.locals.response = {
        message: stringConstants.userControllerMessage.PASSWORD_CHANGED,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: any, res: any, next: any) {
    try {
      const { email, profile_img, phone, address, username } = req.body;
      const updateData: any = {};
      if (phone) updateData['phone'] = phone;
      if (profile_img) {
        updateData['profileImg'] = profile_img;
        if (profile_img.toUpperCase() === 'DELETE') {
          updateData['profileImg'] = null;
        }
        if (res.user.profileImg) {
          const imageToRemove = res.user.profileImg.split('/').slice(-1)[0];
          await awsDeleteService.deleteUploadedProfileImage(
            decodeURIComponent(imageToRemove)
          );
        }
      }
      if (address) updateData['address'] = address;
      if (username) updateData['username'] = username;

      // Only admin can change his emailId
      if (res.user.role === config.userRolesObject.ADMIN) {
        if (email) updateData['email'] = email;
      }
      let user = null;
      if (Object.keys(updateData).length) {
        user = await User.update(updateData, {
          where: { userId: res.user.userId },
          returning: true,
        });
      }
      res.locals.response = {
        message:
          stringConstants.userControllerMessage.USER_UPDATED_SUCCESSFULLY,
        body: {
          data: {
            username: user ? user[1][0].dataValues.username : null,
            email: user ? user[1][0].dataValues.email : null,
            phone: user ? user[1][0].dataValues.phone : null,
            profileImg: user ? user[1][0].dataValues.profileImg : null,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getOEMDealer(req: any, res: any, next: any) {
    try {
      const { oemIds, cityId, oemManagerId, areaManagerId } = req.query;
      let dealers: any = {};
      let whereCondition = {};
      if (cityId) {
        whereCondition = {
          cityId: { [Op.in]: cityId.split(',') },
        };
      }

      if (!isNullOrUndefined(oemManagerId)) {
        dealers = await oemManagerService.getOemManagerDealerDetail(
          oemManagerId,
          whereCondition
        );
      } else if (!isNullOrUndefined(areaManagerId)) {
        dealers = await areaManagerService.getAreaManagerDealerDetails(
          areaManagerId,
          whereCondition
        );
      } else {
        dealers = await OEM.findAll({
          where: { oemId: { [Op.in]: oemIds.split(',') }, isDeleted: null },
          attributes: ['oemId', 'name'],
          include: [
            {
              model: User,
              where: {
                deletedAt: null,
                isActive: true,
                role: config.userRolesObject.DEALER,
              },
              attributes: ['userId', 'username', 'isActive'],
              order: [['createdAt', 'DESC']],
              include: [
                {
                  model: Outlet,
                  where: whereCondition,
                  attributes: ['outletId'],
                  include: [
                    {
                      model: Machine,
                      attributes: ['machineGuid', 'name', 'ShortName'],
                    },
                  ],
                },
              ],
            },
          ],
        });
      }

      res.locals.response = {
        message: templateConstants.LIST_OF('OEM dealer'),
        body: {
          data: {
            records: dealers,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getModuleList(req: any, res: any, next: any) {
    try {
      const { type } = req.query;
      const whereCondition: any = {
        deletedAt: null,
        isDeleted: false,
      };
      if (type) {
        whereCondition['moduleType'] = type;
      }
      const modules = await Module.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
      });
      res.locals.response = {
        body: {
          data: {
            modules: modules,
          },
        },
        message: templateConstants.LIST_OF('Module'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getSubRoleList(req: any, res: any, next: any) {
    try {
      const { offset, limit, dealerId, isActive, search } = req.query;
      let _limit = Number(limit);
      let _offset = Number(offset);
      if (!_limit) {
        _limit = 10;
      }
      if (!_offset) {
        _offset = 0;
      } else {
        _offset = (_offset - 1) * _limit;
      }
      const whereCondition: any = {
        deletedAt: null,
        isDeleted: false,
        dealerId: null,
        isDealerRole: false,
        isAdminRole: true,
      };
      const _err = createError(401, templateConstants.INVALID('dealerId'));
      if (dealerId) {
        if (!isValidGuid(dealerId)) {
          throw _err;
        }
        const isDealerExist = await User.findOne({
          where: {
            userId: dealerId,
            deletedAt: null,
            parentUserId: null,
            subRoleId: null,
            role: config.userRolesObject.DEALER,
          },
          attributes: ['userId'],
        });
        if (!isDealerExist) {
          throw _err;
        }
        whereCondition['dealerId'] = dealerId;
        whereCondition['isDealerRole'] = true;
        whereCondition['isAdminRole'] = false;
      }
      if (isActive) {
        if (isActive === 'false') {
          whereCondition['isActive'] = false;
        } else if (isActive === 'true') {
          whereCondition['isActive'] = true;
        }
      }
      if (!!search) {
        whereCondition['name'] = { [Op.iLike]: '%' + search + '%' };
      }
      const includeCondition: any = [
        {
          model: SubRoleModulePermission,
          where: { deletedAt: null, isDeleted: false },
          required: false,
          include: [
            {
              model: Module,
              where: { deletedAt: null, isDeleted: false },
              required: false,
            },
          ],
        },
      ];
      let condition: any = {
        where: whereCondition,
        include: includeCondition,
        distinct: true,
        order: [['createdAt', 'DESC']],
      };
      if (!!limit) {
        condition['limit'] = _limit;
      }
      if (!!offset) {
        condition['offset'] = _offset;
      }
      const subRoles: any = await SubRole.findAndCountAll(condition);

      for (const data of subRoles?.rows) {
        if (dealerId) {
          data.dataValues['userCount'] = await User.count({
            where: {
              subRoleId: data.dataValues.subRoleId,
              deletedAt: null,
              role: config.userRolesObject.DEALER,
            },
          });
        } else {
          data.dataValues['userCount'] = await User.count({
            where: {
              subRoleId: data.dataValues.subRoleId,
              deletedAt: null,
              role: config.userRolesObject.ADMIN,
            },
          });
        }
      }
      res.locals.response = {
        body: {
          data: {
            subRoles: subRoles.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              subRoles.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Module'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async createSubRole(req: any, res: any, next: any) {
    try {
      const { name, description, isActive, permissions, dealerId } = req.body;
      const dataForCreation: any = {
        name: name,
        description: description ? description : null,
        isActive: isActive,
        isAdminRole: true,
      };
      if (dealerId) {
        dataForCreation['dealerId'] = dealerId;
        dataForCreation['isDealerRole'] = true;
        dataForCreation['isAdminRole'] = false;
      }
      const subRole = await SubRole.create({ ...dataForCreation });
      const subRolePermissionData = [];
      for (const permission of permissions) {
        subRolePermissionData.push({
          subRoleId: subRole.subRoleId,
          moduleId: permission.moduleId,
          deletePermission: permission.deletePermission
            ? permission.deletePermission
            : false,
          updatePermission: permission.updatePermission
            ? permission.updatePermission
            : false,
          createPermission: permission.createPermission
            ? permission.createPermission
            : false,
          viewPermission: permission.viewPermission
            ? permission.viewPermission
            : false,
          exportPermission: permission.exportPermission
            ? permission.exportPermission
            : false,
          payPermission: permission.payPermission
            ? permission.payPermission
            : false,
        });
      }
      await SubRoleModulePermission.bulkCreate(subRolePermissionData);
      res.locals.response = {
        message: `A new role "${name}" has been created!`,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async updateSubRole(req: any, res: any, next: any) {
    try {
      const { name, description, isActive, permissions } = req.body;
      const { subRole, newModules } = res.locals.request;
      const { subRoleId } = req.params;
      let isLogoutAssignedUser = false;
      const updateOption: any = {};
      if (name) updateOption['name'] = name;
      if (description) updateOption['description'] = description;
      if (!isNullOrUndefined(isActive)) updateOption['isActive'] = isActive;
      if (Object.keys(updateOption).length) {
        isLogoutAssignedUser = true;
        await SubRole.update(updateOption, { where: { subRoleId: subRoleId } });
      }
      // if new module add then insert this modulet wiht SubRoleModulePermission
      if (newModules.length > 0) {
        const subRolePermissionData = [];
        for (const permission of newModules) {
          subRolePermissionData.push({
            subRoleId: subRole.subRoleId,
            moduleId: permission.moduleId,
            deletePermission: permission.deletePermission
              ? permission.deletePermission
              : false,
            updatePermission: permission.updatePermission
              ? permission.updatePermission
              : false,
            createPermission: permission.createPermission
              ? permission.createPermission
              : false,
            viewPermission: permission.viewPermission
              ? permission.viewPermission
              : false,
            exportPermission: permission.exportPermission
              ? permission.exportPermission
              : false,
            payPermission: permission.payPermission
              ? permission.payPermission
              : false,
          });
        }
        await SubRoleModulePermission.bulkCreate(subRolePermissionData);
      }
      for (const permission of permissions) {
        let updateData: any = {};
        if (permission.action === config.actionType.DELETE) {
          updateData = { deletedAt: new Date(), isDeleted: true };
        }
        if (
          permission.action === config.actionType.UPDATE ||
          permission.action === config.actionType.CREATE
        ) {
          if (!isNullOrUndefined(permission.deletePermission))
            updateData['deletePermission'] = permission.deletePermission;
          if (!isNullOrUndefined(permission.updatePermission))
            updateData['updatePermission'] = permission.updatePermission;
          if (!isNullOrUndefined(permission.createPermission))
            updateData['createPermission'] = permission.createPermission;
          if (!isNullOrUndefined(permission.viewPermission))
            updateData['viewPermission'] = permission.viewPermission;
          if (!isNullOrUndefined(permission.exportPermission))
            updateData['exportPermission'] = permission.exportPermission;
          if (!isNullOrUndefined(permission.payPermission))
            updateData['payPermission'] = permission.payPermission;
        }
        if (Object.keys(updateData).length) {
          isLogoutAssignedUser = true;
          await SubRoleModulePermission.update(updateData, {
            where: { moduleId: permission.moduleId, subRoleId: subRoleId },
          });
        }
      }
      if (isLogoutAssignedUser) {
        userService.logoutOnSubRolePermissionChange(subRoleId);
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY(`Role ${subRole.name}`),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async deleteSubRole(req: any, res: any, next: any) {
    try {
      const { subRole } = res.locals.request;
      await SubRole.update(
        { deletedAt: new Date(), isDeleted: true },
        { where: { subRoleId: subRole.subRoleId } }
      );
      res.locals.response = {
        message: `Role “${subRole.name}“ has been deleted successfully!`,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getProfile(req: any, res: any, next: any) {
    try {
      const userId = res.user.userId;
      const userDetail = await userService.getUserWithPermission(userId);
      res.locals.response = {
        message: templateConstants.DETAIL('User'),
        body: {
          data: {
            user: userDetail,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req: any, res: any, next: any) {
    try {
      const { username, email, phone, parentUserId, subRoleId, isActive } =
        req.body;
      const userRole = parentUserId
        ? config.userRolesObject.DEALER
        : config.userRolesObject.ADMIN;
      const password = generatePassword();
      const passwordHash = await passwordService.hashPassword(password);
      const uniqueId = await userService.getUserIdForEmployeeSubAdmin(
        userRole,
        parentUserId
      );
      let parentUser: any;
      if (userRole == config.userRolesObject.DEALER) {
        parentUser = await User.findOne({
          where: { userId: parentUserId },
          attributes: ['userId', 'isKycDone', 'kycDoneAt'],
        });
      }

      const employee = await User.create({
        username: username,
        uniqueId: uniqueId,
        email: email.toLowerCase(),
        phone: phone,
        password: passwordHash,
        isActive: isActive,
        role: userRole,
        parentUserId: parentUserId ? parentUserId : res.user.userId,
        subRoleId: subRoleId,
        isKycDone: parentUser?.isKycDone,
        kycDoneAt: parentUser?.kycDoneAt,
      });
      const message =
        userRole === config.userRolesObject.DEALER
          ? 'DEALERSHIP’s Employee'
          : `Sub Admins`;
      messageService.sendEmployeeRegistrationMessageWithPassword(
        email,
        username,
        password,
        message
      );
      let messageRole;
      if (userRole == config.userRolesObject.DEALER) {
        messageRole = config.userRolesObject.EMPLOYEE.toLowerCase();
        if (employee) {
          const { type: dealerNotiType, url: dealerNotiUrl } =
            notificationConstant.dealerNotificationObject
              .NEW_EMPLOYEE_ONBOARDED;
          const notificationBody = {
            modelDetail: {
              name: 'User',
              uuid: employee?.userId,
            },
            userId: parentUserId,
            type: dealerNotiType,
            link: `${dealerNotiUrl}/${employee?.userId}`,
          };
          notificationService.generateNotification(
            config.userRolesObject.DEALER,
            notificationBody
          );
        }
      } else {
        messageRole = config.userRolesObject.SUB_ADMIN.toLowerCase();
      }
      res.locals.response = {
        body: {
          data: {
            dealer: { userId: employee.userId },
          },
        },
        message: templateConstants.CREATE_USER(messageRole, username),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getEmployeeList(req: any, res: any, next: any) {
    try {
      const { dealerId, offset, limit, sort, search } = req.query;
      let roleCondition = dealerId
        ? config.userRolesObject.DEALER
        : config.userRolesObject.ADMIN;
      let parentUserId = dealerId ? dealerId : { [Op.ne]: null };
      if (res.user.role !== config.userRolesObject.ADMIN) {
        roleCondition = config.userRolesObject.DEALER;
        parentUserId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }
      const whereCondition: any = {
        parentUserId: parentUserId,
        role: roleCondition,
        deletedAt: null,
      };
      let _limit = Number(limit);
      let _offset = Number(offset);
      if (!_limit) {
        _limit = 10;
      }
      if (!_offset) {
        _offset = 0;
      } else {
        _offset = (_offset - 1) * _limit;
      }

      let order: any = [];
      if (sort) {
        if (sort === 'NEW') {
          order = [['createdAt', 'DESC']];
        }
        if (sort === 'OLD') {
          order = [['createdAt', 'ASC']];
        }
      }
      if (search) {
        whereCondition[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { uniqueId: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const employeeList = await User.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: SubRole,
            include: [
              {
                model: SubRoleModulePermission,
                where: { deletedAt: null, isDeleted: false },
                required: false,
                include: [
                  {
                    model: Module,
                    where: { deletedAt: null, isDeleted: false },
                  },
                ],
              },
            ],
          },
        ],
        attributes: [
          'username',
          'uniqueId',
          'phone',
          'email',
          'isActive',
          'createdAt',
          'updatedAt',
          'userId',
          'subRoleId',
          'role',
          'createdAt',
        ],
        order: order,
        limit: _limit,
        offset: _offset,
        distinct: true, //to get count of only distinct user
      });
      res.locals.response = {
        body: {
          data: {
            employees: employeeList.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              employeeList.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Employee'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteEmployee(req: any, res: any, next: any) {
    try {
      const { employeeId } = req.params;
      await User.update(
        { deletedAt: new Date(), isActive: false, deletedBy: res.user.userId },
        { where: { userId: employeeId } }
      );
      await tokenService.logoutUserToken(employeeId);
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Employee'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getEmployeeDetailById(req: any, res: any, next: any) {
    try {
      const { employeeId } = req.params;
      const employee = await User.findOne({
        attributes: [
          'userId',
          'uniqueId',
          'username',
          'firstName',
          'lastName',
          'email',
          'phone',
          'countryCode',
          'address',
          'role',
          'panNo',
          'isKycDone',
          'profileImg',
          'subRoleId',
          'parentUserId',
          'isActive',
          'kycDoneAt',
          'createdAt',
        ],
        where: { userId: employeeId },
        raw: true,
      });
      if (employee.subRoleId) {
        const subRole: any = await SubRole.findOne({
          attributes: [
            'subRoleId',
            'name',
            'description',
            'isAdminRole',
            'isDealerRole',
            'dealerId',
          ],
          where: {
            deletedAt: null,
            isDeleted: false,
            isActive: true,
            subRoleId: employee.subRoleId,
          },
          include: [
            {
              model: SubRoleModulePermission,
              attributes: [
                'deletePermission',
                'updatePermission',
                'createPermission',
                'viewPermission',
                'exportPermission',
              ],
              required: false,
              where: { deletedAt: null, isDeleted: false, isActive: true },
              include: [
                {
                  model: Module,
                  attributes: [
                    'moduleId',
                    'name',
                    'isActive',
                    'permissions',
                    'moduleType',
                  ],
                  where: {
                    deletedAt: null,
                    isDeleted: false,
                    isActive: true,
                  },
                },
              ],
            },
          ],
        });
        if (subRole) {
          employee['subRole'] = subRole.dataValues;
          employee['subRole'].permission = subRole.dataValues.permission.map(
            (el: any) => {
              const permissionObj: any = {};
              const _module = el.module;
              if (
                _module.permissions.edit &&
                _module.permissions.edit === true
              ) {
                permissionObj['updatePermission'] =
                  el.dataValues.updatePermission;
                delete el.dataValues.updatePermission;
              }
              if (
                _module.permissions.create &&
                _module.permissions.create === true
              ) {
                permissionObj['createPermission'] =
                  el.dataValues.createPermission;
                delete el.dataValues.createPermission;
              }
              if (
                _module.permissions.export &&
                _module.permissions.export === true
              ) {
                permissionObj['exportPermission'] =
                  el.dataValues.exportPermission;
                delete el.dataValues.exportPermission;
              }
              if (
                _module.permissions.view &&
                _module.permissions.view === true
              ) {
                permissionObj['viewPermission'] = el.dataValues.viewPermission;
                delete el.dataValues.viewPermission;
              }
              if (
                _module.permissions.delete &&
                _module.permissions.delete === true
              ) {
                permissionObj['deletePermission'] =
                  el.dataValues.deletePermission;
                delete el.dataValues.deletePermission;
              }
              return {
                ...el.dataValues,
                module: el.module.dataValues,
                permissionObj: permissionObj,
              };
            }
          );
        }
      }

      res.locals.response = {
        body: {
          data: {
            employee: employee,
          },
        },
        message: templateConstants.DETAIL('Employee'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getSubRoleDetailById(req: any, res: any, next: any) {
    try {
      const { subRoleId } = req.params;
      await validateUserApis.isSubRoleExist(subRoleId);
      const subRole: any = await SubRole.findOne({
        where: { subRoleId: subRoleId },
        attributes: [
          'subRoleId',
          'name',
          'description',
          'isActive',
          'isAdminRole',
          'isDealerRole',
          'dealerId',
          'createdAt',
        ],
        raw: true,
      });
      const subRoleModulePermission = await SubRoleModulePermission.findAll({
        where: { deletedAt: null, isDeleted: false, subRoleId: subRoleId },
        attributes: [
          'subRoleModulePermissionId',
          'isActive',
          'moduleId',
          'subRoleId',
          'deletePermission',
          'updatePermission',
          'createPermission',
          'viewPermission',
          'exportPermission',
          'payPermission',
          'createdAt',
        ],
        include: [
          {
            model: Module,
            attributes: [
              'moduleId',
              'name',
              'isActive',
              'permissions',
              'moduleType',
              'createdAt',
            ],
            where: { deletedAt: null, isDeleted: false },
          },
        ],
      });
      let permissions = [];

      for (const iterator of subRoleModulePermission) {
        const obj: any = {
          subRoleModulePermissionId:
            iterator.dataValues.subRoleModulePermissionId,
          isActive: iterator.dataValues.isActive,
          moduleId: iterator.dataValues.moduleId,
          subRoleId: iterator.dataValues.subRoleId,
          module: iterator.dataValues.module,
          permissionObj: {},
        };
        const _module: any = iterator.dataValues.module.dataValues;
        if (_module.permissions.edit && _module.permissions.edit === true) {
          obj['permissionObj']['updatePermission'] =
            iterator.dataValues.updatePermission;
        }
        if (_module.permissions.create && _module.permissions.create === true) {
          obj['permissionObj']['createPermission'] =
            iterator.dataValues.createPermission;
        }
        if (_module.permissions.export && _module.permissions.export === true) {
          obj['permissionObj']['exportPermission'] =
            iterator.dataValues.exportPermission;
        }
        if (_module.permissions.view && _module.permissions.view === true) {
          obj['permissionObj']['viewPermission'] =
            iterator.dataValues.viewPermission;
        }
        if (_module.permissions.delete && _module.permissions.delete === true) {
          obj['permissionObj']['deletePermission'] =
            iterator.dataValues.deletePermission;
        }
        if (_module.permissions.pay && _module.permissions.pay === true) {
          obj['permissionObj']['payPermission'] =
            iterator.dataValues.payPermission;
        }
        permissions.push(obj);
      }
      subRole.permission = permissions;
      res.locals.response = {
        body: {
          data: {
            subRole: subRole,
          },
        },
        message: templateConstants.DETAIL('SubRole'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAgentMachineWithDetail(req: any, res: any, next: any) {
    try {
      const agentMachines = await MachineAgent.findAll({
        where: {
          agentId: res.user.userId,
        },
        attributes: ['machineId', 'createdAt'],
        include: [
          {
            model: Machine,
            include: [
              {
                model: Outlet,
                attributes: ['name', 'address', 'cityId', 'gstNo'],

                include: [
                  {
                    model: User,
                    attributes: [
                      'email',
                      'userId',
                      'username',
                      'profileImg',
                      'phone',
                    ],
                    where: { deletedAt: null },
                  },
                  {
                    model: City,
                    attributes: ['name', 'cityId'],
                    include: [
                      {
                        model: State,
                        attributes: ['name', 'stateId'],
                        include: [
                          { model: Region, attributes: ['name', 'regionId'] },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      res.locals.response = {
        body: {
          data: agentMachines,
        },
        message: templateConstants.DETAIL('Agent Machines'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // add device toke
  async addDeviceToken(req: any, res: any, next: any) {
    try {
      const { userId, userName } = res.user;
      const { deviceToken } = req.body;
      await UserDevice.create({
        userId: userId,
        deviceToken: deviceToken,
      });
      res.locals.response = {
        body: {
          data: userId,
        },
        message: templateConstants.MAPPED_TO_USER('DeviceToken', userName),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getUserDeviceTokens(req: any, res: any, next: any) {
    try {
      const { userId } = res.user;
      const user = await userService.getUserDevices(userId);
      res.locals.response = {
        body: {
          data: user,
        },
        message: templateConstants.DETAIL('User device tokens'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  // delete device toke
  async deleteDeviceToken(req: any, res: any, next: any) {
    try {
      const { userId } = res.user;
      const { deviceToken } = req.query;
      await UserDevice.destroy({
        where: {
          userId: userId,
          deviceToken: deviceToken,
        },
      });
      res.locals.response = {
        body: {
          data: userId,
        },
        message: templateConstants.DELETED_SUCCESSFULLY('DeviceToken'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async permanentDeleteUser(req: any, res: any, next: any) {
    try {
      const { userId, role } = req.body;
      await userService.permanentDeleteUser(userId, role);
      res.locals.response = {
        body: {
          data: userId,
        },
        message: templateConstants.DELETED_SUCCESSFULLY('User'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getUserDetails(req: any, res: any, next: any) {
    try {
      const { userId } = req.param;
      let userData = await userService.getUserDetails(userId);
      res.locals.response = {
        body: {
          data: userData,
        },
        message: stringConstants.genericMessage.DETAILS_OF_USER,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getLoginResponse(req: any, res: any, next: any) {
    try {
      const {
        role,
        email,
        isKycDone,
        phone,
        userId,
        username,
        profileImg,
        subRoleId,
        parentUserId,
        oemId,
        userArea,
        oem,
      } = res.user;
      let data: any = {};
      if (
        role === config.userRolesObject.DEALER &&
        !isNullOrUndefined(isKycDone) &&
        !isKycDone
      ) {
        data = {
          isKycDone: isKycDone,
          role: config.userRolesObject.DEALER,
          token: null,
          email,
        };
      } else {
        let permission;
        const userDetail = await userService.getUserWithPermission(userId);
        if (userDetail.subRole) {
          permission = userDetail.subRole;
        }
        data = {
          token: req.headers['authorization'] || req.body.authorization,
          isKycDone: isKycDone,
          email,
          role: role,
          username,
          phone,
          profileImg,
          subRoleId,
          parentUserId,
          oemId,
          userArea,
          permissions: permission,
        };
        if (
          role == config.userRolesObject.AREA_MANAGER ||
          role == config.userRolesObject.OEM
        ) {
          data['oem'] = oem;
        }
      }
      res.locals.response = {
        body: {
          data: {
            user: data,
          },
        },
        message: stringConstants.userControllerMessage.LOGGED_IN,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
export { userController };
