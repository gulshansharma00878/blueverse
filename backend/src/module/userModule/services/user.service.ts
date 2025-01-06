import { jwtService } from '../../../services/user/jwtService';
import { tokenService } from '../../../services/common/tokenService';
import { config } from '../../../config/config';
import { User } from '../../../models/User/user';
import { SubRole } from '../../../models/User/SubRole';
import { Module } from '../../../models/User/Module';
import { SubRoleModulePermission } from '../../../models/User/SubRoleModulePermission';
import { Op } from 'sequelize';
import { isValidGuid } from '../../../common/utility';
import { Outlet } from '../../../models/outlet';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { OEM } from '../../../models/oem';
import { UserDevice } from '../../../models/User/UserDevice';
import { UserArea } from '../../../models/User/UserArea';
import { logger } from '../../../services/logger/logger';
class UserService {
  async createLoginToken(user: any, email: string) {
    try {
      const {
        userId,
        username,
        role,
        profileImg,
        phone,
        isKycDone,
        parentUserId,
        subRoleId,
      } = user;
      const token = await jwtService.generateToken({
        userId: userId,
        username: username,
        email: email,
        role: role,
        profileImg: profileImg,
        phone: phone,
        parentUserId: parentUserId,
        subRoleId: subRoleId,
      });
      await tokenService.setToken(userId, token, config.authConfig.tokenExpiry);
      return token;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getUserIdByUserType(userType: string) {
    let format = '';
    const whereCond: any = { role: userType };
    if (userType === config.userRolesObject.DEALER) {
      format = 'BV/DL/';
      whereCond.parentUserId = { [Op.is]: null };
    } else if (userType === config.userRolesObject.AREA_MANAGER) {
      format = 'BV/AM/';
    } else if (userType === config.userRolesObject.OEM) {
      format = 'BV/OM/';
    } else {
      format = 'BV/AG/';
    }
    const lastEntry = await User.findOne({
      where: whereCond,
      order: [['createdAt', 'DESC']],
      attributes: ['uniqueId'],
    });
    let serialNo = '01';
    if (lastEntry && lastEntry.uniqueId) {
      const number = lastEntry.uniqueId.split('/');
      const newNumber = parseInt(number.at(-1)) + 1;
      serialNo = String(newNumber);
    }
    return format + serialNo;
  }

  async getUserIdForEmployeeSubAdmin(userType: string, dealerId: string) {
    let format = '';
    const whereCondition: any = { role: userType };
    if (userType === config.userRolesObject.DEALER) {
      const dealerUniqueId = await User.findOne({
        where: { userId: dealerId },
        attributes: ['uniqueId'],
      });

      format = dealerUniqueId.uniqueId + '/';
      whereCondition.parentUserId = dealerId;
    } else {
      format = 'BV/SA/';
      // whereCondition.parentUserId = { [Op.not]: null };
    }
    const lastEntry = await User.findOne({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      attributes: ['uniqueId'],
    });
    let serialNo = '01';
    if (lastEntry && lastEntry.uniqueId) {
      const number = lastEntry.uniqueId.split('/');
      const newNumber = parseInt(number.at(-1)) + 1;
      serialNo = String(newNumber);
    }
    return format + serialNo;
  }

  async getUserWithPermission(userId: string) {
    try {
      const user: any = await User.findOne({
        where: { userId: userId },
        attributes: [
          'userId',
          'username',
          'firstName',
          'lastName',
          'email',
          'phone',
          'address',
          'role',
          'panNo',
          'isKycDone',
          'profileImg',
          'oemId',
          'subRoleId',
          'parentUserId',
        ],
        raw: true,
      });

      if (user.subRoleId) {
        const subRole: any = await SubRole.findOne({
          attributes: [
            'subRoleId',
            'name',
            'description',
            'isAdminRole',
            'isDealerRole',
          ],
          where: {
            deletedAt: null,
            isDeleted: false,
            isActive: true,
            subRoleId: user.subRoleId,
          },
          include: [
            {
              model: SubRoleModulePermission,
              attributes: [
                'subRoleModulePermissionId',
                'deletePermission',
                'updatePermission',
                'createPermission',
                'viewPermission',
                'exportPermission',
                'payPermission',
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
          user['subRole'] = subRole.dataValues;
          user['subRole'].permission = subRole.dataValues.permission.map(
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
              if (_module.permissions.pay && _module.permissions.pay === true) {
                permissionObj['payPermission'] = el.dataValues.payPermission;
                delete el.dataValues.payPermission;
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
      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async permanentDeleteUser(userid: string, role: string) {
    try {
      if (config.userRoles.includes(role)) {
        return await User.destroy({
          where: {
            userId: userid,
            role: role,
          },
        });
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async temporaryDeleteUser(
    userid: string,
    role: string,
    loggedInUserID: string
  ) {
    try {
      if (config.userRoles.includes(role)) {
        return await User.update(
          { deletedAt: new Date(), isActive: false, deletedBy: loggedInUserID },
          { where: { userId: userid } }
        );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getDealerDetails(dealerId: string) {
    try {
      return await User.findOne({
        attributes: ['uniqueId', 'username'],
        where: { userId: dealerId },
        include: [
          { model: OEM, attributes: ['name'] },
          {
            model: Outlet,
            attributes: ['outletId', 'name', 'address'],
            include: [
              {
                model: City,
                attributes: ['name'],
                include: [
                  {
                    model: State,
                    attributes: ['name'],
                    include: [
                      {
                        model: Region,
                        attributes: ['name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getEmployeeDetails(employeeId: string) {
    try {
      return await User.findOne({
        attributes: ['uniqueId', 'username'],
        where: { userId: employeeId },
        include: [{ model: User, attributes: ['uniqueId', 'username'] }],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getUserDevices(userId: string) {
    try {
      return await User.findOne({
        attributes: ['uniqueId', 'username'],
        where: { userId: userId },
        include: [{ model: UserDevice, attributes: ['deviceToken'] }],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  formatDeviceTokens(tokenDetails: any) {
    let result: string[] = [];
    tokenDetails.forEach((ele: { deviceToken: string }) => {
      result.push(ele.deviceToken);
    });
    return result;
  }

  // User details
  async getUserDetails(employeeId: string) {
    try {
      return await User.findOne({
        attributes: ['userId', 'firstName','lastName','uniqueId', 'username', 'oemId'],
        where: { userId: employeeId },
        include:[
          {
            model:OEM
          }
        ]
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // get user Area details
  async getUserAreaDetails(userId: string) {
    try {
      return await User.findOne({
        attributes: ['userId', 'username'],
        where: {
          userId: userId,
          isActive: true,
        },
        include: [
          {
            model: UserArea,
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async logoutOnSubRolePermissionChange(subRoleId: string) {
    try {
      const users = await User.findAll({
        where: { subRoleId: subRoleId },
        attributes: ['userId'],
        raw: true,
      });
      for (const user of users) {
        await tokenService.logoutUserToken(user.userId);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  // get regionId base outlet
  async getRegionBasedOutlets(
    regionIdArr: any,
    stateIdArr: any,
    cityIdArr: any
  ) {
    try {
      let cityWhereCondition = {};
      let stateWhereCondition = {};
      if (cityIdArr && cityIdArr.length > 0) {
        cityWhereCondition = {
          cityId: {
            [Op.in]: cityIdArr,
          },
        };
      }
      if (stateIdArr && stateIdArr.length > 0) {
        stateWhereCondition = {
          stateId: {
            [Op.in]: stateIdArr,
          },
        };
      }
      const outletArr: any = [];
      const outlets = await Outlet.findAll({
        attributes: ['outletId'],
        include: [
          {
            model: City,
            required: true,
            attributes: ['cityId'],
            where: cityWhereCondition,
            include: [
              {
                model: State,
                required: true,
                attributes: ['stateId'],
                where: stateWhereCondition,
                include: [
                  {
                    model: Region,
                    required: true,
                    attributes: ['regionId'],
                    where: {
                      regionId: {
                        [Op.in]: regionIdArr,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      });
      if (outlets && outlets.length) {
        outlets.forEach((outlet: any) => {
          outletArr.push(outlet.outletId);
        });
      }
      return outletArr;
    } catch (err) {}
  }

  
}
const userService = new UserService();
export { userService };
