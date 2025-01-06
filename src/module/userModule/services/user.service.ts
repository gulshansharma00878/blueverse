import { jwtService } from '../../../services/user/jwtService';
import { tokenService } from '../../../services/common/tokenService';
import { config } from '../../../config/config';
import { User } from '../../../models/User/user';
import { SubRole } from '../../../models/User/SubRole';
import { Module } from '../../../models/User/Module';
import { SubRoleModulePermission } from '../../../models/User/SubRoleModulePermission';
import { Op } from 'sequelize';

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
      whereCondition.parentUserId = { [Op.not]: null };
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
}
const userService = new UserService();
export { userService };
