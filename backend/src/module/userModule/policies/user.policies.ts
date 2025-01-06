import { templateConstants } from '../../../common/templateConstants';
import {
  isNullOrUndefined,
  isEmailValid,
  isValidGuid,
  isStringOnlyContainsNumber,
} from '../../../common/utility';
import { Transactions } from '../../../models/transactions';
import { User } from '../../../models/User/user';
import { UserArea } from '../../../models/User/UserArea';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import stringConstants from '../../../common/stringConstants';
import { passwordService } from '../../../services/user/passwordService';
import { otpService } from '../../../services/user/otpService';
import { config } from '../../../config/config';
import { Op } from 'sequelize';
import createError from 'http-errors';
import { OEM } from '../../../models/oem';
import { WashType } from '../../../models/wash_type';
import { validate as isValidUUID } from 'uuid';
import { Module } from '../../../models/User/Module';
import { MachineAgent } from '../../../models/Machine/MachineAgent';
import { SubRole } from '../../../models/User/SubRole';
import { SubRoleModulePermission } from '../../../models/User/SubRoleModulePermission';
import { verifyRoleAndApp } from '../../../services/common/requestResponseHandler';
import { UserDevice } from '../../../models/User/UserDevice';

class ValidateUserApis {
  async validateLoginRegister(body: any) {
    try {
      const { email, password } = body;
      if (isNullOrUndefined(password)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('password'));
      }
      if (isNullOrUndefined(email)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('email'));
      }
      if (!isEmailValid(email)) {
        throw createError(400, templateConstants.INVALID('email'));
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async validateLoginRequest(req: any, res: any, next: any) {
    try {
      const { email, password, app } = req.body;
      let error = createError(404, templateConstants.INVALID('app'));
      if (!app) {
        throw error;
      }
      if (
        app !== config.userRolesObject.ADMIN &&
        app !== config.userRolesObject.DEALER
      ) {
        throw error;
      }
      await this.validateLoginRegister(req.body);
      const user = await User.findOne({
        where: {
          email: email.toLowerCase(),
          deletedAt: null,
        },
        include: [
          {
            model: User,
            attributes: ['userId', 'role', 'isKycDone', 'isActive'],
          },
          {
            model: UserArea,
            attributes: ['cityId'],
          },
          {
            model: OEM,
            attributes: ['oemId', 'name'],
          },
        ],
        // raw: true,
      });
      if (isNullOrUndefined(user)) {
        throw createError(
          404,
          stringConstants.genericMessage.EMAIL_NOT_REGISTERED
        );
      }
      await verifyRoleAndApp(user.role, app);
      if (user.role === config.userRolesObject.DEALER && user.parentUserId) {
        // Check employee dealer status
        if (!user.parentUser.isActive) {
          throw createError(
            401,
            stringConstants.genericMessage.DEALER_NOT_AUTHORIZED
          );
        }
        if (!user.parentUser.isKycDone) {
          throw createError(401, templateConstants.USER_KYC_PENDING('Dealer'));
        }
      }
      // check user status
      if (
        user.role === config.userRolesObject.DEALER &&
        !user.isActive &&
        user.subRoleId &&
        user.parentUserId
      ) {
        throw createError(
          401,
          stringConstants.authServiceMessage.ACCOUNT_NOT_ACTIVATED
        );
      }
      if (!user.isActive) {
        throw createError(
          401,
          stringConstants.authServiceMessage.ACCOUNT_NOT_ACTIVATED
        );
      }
      await passwordService.verifyPassword(password, user.password);
      res.locals.request = {
        user: user,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateRegisterRequest(req: any, res: any, next: any) {
    try {
      const { username, email } = req.body;
      await this.validateLoginRegister(req.body);
      if (isNullOrUndefined(username)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('username'));
      }
      const user = await User.findOne({
        where: { email: email.toLowerCase(), deletedAt: null },
        raw: true,
      });
      if (!isNullOrUndefined(user)) {
        throw createError(400, stringConstants.genericMessage.USER_EXISTS);
      }
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateForgotPasswordRequest(req: any, res: any, next: any) {
    try {
      const { email, app } = req.body;
      let error = createError(404, templateConstants.INVALID('app'));
      if (!app) {
        throw error;
      }
      if (
        app !== config.userRolesObject.ADMIN &&
        app !== config.userRolesObject.DEALER
      ) {
        throw error;
      }

      let errorMessage = templateConstants.PARAMETER_MISSING('email'),
        isError = false,
        statusCode = 400,
        subCode = 1100;
      if (!email) {
        isError = true;
      } else if (!isEmailValid(email)) {
        isError = true;
        errorMessage = templateConstants.INVALID('email');
        statusCode = 400;
        subCode = 1101;
      }
      if (isError) {
        throw createError(statusCode, errorMessage);
      }
      const isUserExist = await User.findOne({
        where: { email: email.toLowerCase(), deletedAt: null },
        raw: true,
      });
      if (!isUserExist) {
        throw createError(
          404,
          stringConstants.genericMessage.EMAIL_NOT_REGISTERED
        );
      }
      await verifyRoleAndApp(isUserExist.role, app);
      if (
        isUserExist.role === config.userRolesObject.DEALER &&
        !isUserExist.isActive &&
        isUserExist.subRoleId &&
        isUserExist.parentUserId
      ) {
        throw createError(
          401,
          stringConstants.authServiceMessage.ACCOUNT_NOT_ACTIVATED
        );
      }
      if (!isUserExist.isActive) {
        throw createError(
          401,
          stringConstants.authServiceMessage.ACCOUNT_NOT_ACTIVATED
        );
      }
      res.locals.request = {
        user: isUserExist,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateResetPasswordRequest(req: any, _res: any, next: any) {
    try {
      const { new_password, email, verification_code } = req.body;
      let errorMessage = templateConstants.PARAMETER_MISSING('email'),
        isError = false,
        statusCode = 400,
        subCode = 1100;
      if (!email) {
        isError = true;
      } else if (!isEmailValid(email)) {
        isError = true;
        errorMessage = templateConstants.INVALID('email');
        statusCode = 400;
        subCode = 1101;
      } else if (!verification_code) {
        isError = true;
        errorMessage = templateConstants.PARAMETER_MISSING('verification code');
      } else if (!new_password) {
        isError = true;
        errorMessage = templateConstants.PARAMETER_MISSING('new password');
      }

      if (isError) {
        throw createError(statusCode, errorMessage);
      }
      const isUserExist = await User.findOne({
        where: { email: email.toLowerCase(), deletedAt: null },
        raw: true,
      });
      if (!isUserExist) {
        throw createError(
          404,
          stringConstants.genericMessage.EMAIL_NOT_REGISTERED
        );
      }
      await otpService.validatePasswordResetCode(
        req.body.verification_code + config.SECRET_KEY_FOR_PASSWORD_FORGOT,
        req.body.email
      );
      const { password, oldPasswordOne, oldPasswordTwo } = isUserExist;
      //Is same as old password : conditions
      const currentPassword = await passwordService.comparePassword(
        new_password,
        password
      );
      const _oldPasswordOne = oldPasswordOne
        ? await passwordService.comparePassword(new_password, oldPasswordOne)
        : false;
      const _oldPasswordTwo = oldPasswordTwo
        ? await passwordService.comparePassword(new_password, oldPasswordTwo)
        : false;
      if (currentPassword || _oldPasswordOne || _oldPasswordTwo) {
        throw createError(
          401,
          stringConstants.userControllerMessage.PASSWORD_USER_EARLIER
        );
      }

      _res.locals.request = {
        user: isUserExist,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateVerifyOtpRequest(req: any, _res: any, next: any) {
    try {
      const { email, verification_code } = req.body;
      const isUserExist = await User.findOne({
        where: { email: email.toLowerCase(), deletedAt: null },
        attributes: ['username', 'userId'],
        raw: true,
      });
      if (!isUserExist) {
        throw createError(
          404,
          stringConstants.genericMessage.EMAIL_NOT_REGISTERED
        );
      }
      await otpService.validateOtpForEmail(verification_code, email);
      _res.locals.request = {
        user: isUserExist,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateGenerateFeedbackRequest(req: any, res: any, next: any) {
    try {
      const { email_id, phone, name, transaction_guid, hsrp_number } = req.body;
      let missingParameter;
      if (isNullOrUndefined(name)) {
        missingParameter = 'name';
      }

      if (isNullOrUndefined(transaction_guid)) {
        missingParameter = 'transaction_guid';
      }
      if (isNullOrUndefined(hsrp_number)) {
        missingParameter = 'hsrp_number';
      }

      if (missingParameter) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING(missingParameter)
        );
      }
      if (email_id && !isEmailValid(email_id)) {
        throw createError(400, templateConstants.INVALID('email_id'));
      }
      if (phone && !isStringOnlyContainsNumber(phone)) {
        throw createError(400, templateConstants.INVALID('phone'));
      }
      if (!isValidGuid(transaction_guid)) {
        throw createError(400, templateConstants.INVALID('transaction_guid'));
      }

      let isTransactionsGuidExist = await Transactions.findOne({
        where: { Guid: transaction_guid },
        attributes: [
          'Guid',
          'SkuNumber',
          'WashTypeGuid',
          'AddDate',
          'MachineGuid',
        ],
        include: [
          {
            model: WashType,
            attributes: ['Name'],
          },
        ],
      });
      const agentMachine = await MachineAgent.findOne({
        where: {
          machineId: isTransactionsGuidExist.MachineGuid,
          agentId: res.user.userId,
        },
        attributes: ['machineId'],
      });
      if (!agentMachine) {
        throw createError(400, templateConstants.INVALID('transaction_guid'));
      }

      if (!isTransactionsGuidExist) {
        throw createError(400, templateConstants.INVALID('transaction_guid'));
      }
      isTransactionsGuidExist = isTransactionsGuidExist.dataValues;
      const isAlreadyFeedbackExist = await TransactionsFeedback.findOne({
        where: { transactionGuid: transaction_guid },
      });

      if (isAlreadyFeedbackExist) {
        throw createError(
          400,
          stringConstants.userControllerMessage.FEEDBACK_EXIST
        );
      }
      res.locals.request = {
        transactions: isTransactionsGuidExist,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateCreateAgentRequest(req: any, res: any, next: any) {
    try {
      const { email, phone } = req.body;
      let whereCondition: any = {};

      if (phone) {
        whereCondition = { phone: phone };
      }
      const isUserExist = await User.findOne({
        where: {
          [Op.or]: [{ email: email.toLowerCase() }, whereCondition],
          deletedAt: null,
        },
        raw: true,
      });
      if (isUserExist) {
        throw createError(400, stringConstants.genericMessage.AGENT_EXISTS);
      }
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateUpdateAgentRequest(req: any, res: any, next: any) {
    try {
      const { email, phone } = req.body;
      const { id } = req.params;

      let phoneWhereConditionPhone = {};
      let emailWhereConditionPhone = {};

      if (phone) {
        phoneWhereConditionPhone = { phone: phone };
      }
      if (email) {
        emailWhereConditionPhone = { email: email.toLowerCase() };
      }
      let isUserExist = await User.findOne({
        where: {
          userId: id,
          deletedAt: null,
        },
        attributes: ['userId', 'username', 'isActive'],
        raw: true,
      });
      if (!isUserExist) {
        throw createError(400, templateConstants.INVALID('id'));
      }

      const isAnotherUserExist = await User.findOne({
        where: {
          [Op.or]: [phoneWhereConditionPhone, emailWhereConditionPhone],
          userId: { [Op.not]: id },
          deletedAt: null,
        },
        attributes: ['userId'],
        raw: true,
      });
      if (isAnotherUserExist) {
        throw createError(400, stringConstants.genericMessage.AGENT_EXISTS);
      }
      res.user = isUserExist;
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateDeleteAgentRequest(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      let isUserExist = await User.findOne({
        where: {
          userId: id,
          deletedAt: null,
        },
        attributes: ['userId'],
        raw: true,
      });
      if (!isUserExist) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      //check if dealer is assigned to a machine
      const checkAssignment = await MachineAgent.count({
        where: { agentId: id },
      });
      if (checkAssignment) {
        throw createError(
          400,
          'To delete this agent, please ensure it is not currently mapped with machines.'
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateAgent(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      let isUserExist = await User.findOne({
        where: {
          userId: id,
          deletedAt: null,
        },
        attributes: ['userId'],
        raw: true,
      });
      if (!isUserExist) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateGetOEMDealerRequest(req: any, res: any, next: any) {
    try {
      const { oemIds } = req.query;
      if (!oemIds) {
        throw createError(401, templateConstants.INVALID('oemIds'));
      }
      const oemIdArr = [];
      for (const oemId of oemIds.split(',')) {
        if (isValidUUID(oemId)) {
          oemIdArr.push(oemId);
        }
      }
      if (!oemIdArr.length) {
        throw createError(401, templateConstants.INVALID('oemIds'));
      }
      const isExist = await OEM.findAll({
        where: { oemId: { [Op.in]: oemIdArr }, isDeleted: null },
        raw: true,
      });
      if (!isExist.length) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdatePasswordRequest(req: any, res: any, next: any) {
    try {
      const { new_password, old_password } = req.body;
      const user = await User.findOne({
        where: { email: res.user.email.toLowerCase(), deletedAt: null },
        attributes: ['password', 'oldPasswordOne', 'oldPasswordTwo', 'userId'],
        raw: true,
      });
      const isPasswordMatched = await passwordService.comparePassword(
        old_password,
        user.password
      );
      if (!isPasswordMatched) {
        throw createError(
          400,
          stringConstants.userControllerMessage.INVALID_CURRENT_PASSWORD
        );
      }

      const _oldPasswordOne = user.oldPasswordOne
        ? await passwordService.comparePassword(
            new_password,
            user.oldPasswordOne
          )
        : false;
      const _oldPasswordTwo = user.oldPasswordTwo
        ? await passwordService.comparePassword(
            new_password,
            user.oldPasswordTwo
          )
        : false;

      const isNewPasswordAsOldPasswor = new_password === old_password;
      if (isNewPasswordAsOldPasswor || _oldPasswordOne || _oldPasswordTwo) {
        throw createError(
          401,
          stringConstants.userControllerMessage.PASSWORD_USER_EARLIER
        );
      }
      res.locals.request = {
        user: user,
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateGetDealersOutletRequest(req: any, res: any, next: any) {
    try {
      const { dealerIds } = req.query;
      if (!dealerIds) {
        throw createError(400, templateConstants.INVALID('dealerIds'));
      }
      const dealerIdArr = [];
      for (const dealerId of dealerIds.split(',')) {
        if (isValidUUID(dealerId)) {
          dealerIdArr.push(dealerId);
        }
      }
      if (!dealerIdArr.length) {
        throw createError(400, templateConstants.INVALID('dealerIds'));
      }
      const isExist = await User.findAll({
        where: {
          userId: { [Op.in]: dealerIdArr },
          deletedAt: null,
          role: config.userRolesObject.DEALER,
          // isActive: true,
        },
        attributes: [
          'userId',
          'subRoleId',
          'parentUserId',
          'role',
          'kycDoneAt',
        ],
      });
      if (!isExist.length) {
        throw createError(400, templateConstants.INVALID('dealerIds'));
      }
      const _dealerIds = isExist.map((el) => {
        if (el.parentUserId && el.subRoleId) {
          return el.parentUserId;
        } else {
          return el.userId;
        }
      });
      res.locals.response = {
        dealerIds: _dealerIds,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdateProfile(req: any, res: any, next: any) {
    try {
      const { email, phone } = req.body;

      let phoneWhereConditionPhone = {};
      let emailWhereConditionPhone = {};

      if (phone) {
        phoneWhereConditionPhone = { phone: phone };
      }
      if (email) {
        emailWhereConditionPhone = { email: email.toLowerCase() };
      }
      const isUserExist = await User.findOne({
        where: {
          [Op.or]: [phoneWhereConditionPhone, emailWhereConditionPhone],
          userId: { [Op.ne]: res.user.userId },
          deletedAt: null,
        },
        attributes: ['phone', 'email'],
      });

      if (isUserExist) {
        let message = 'User';
        if (!!phone && isUserExist.phone === phone) {
          message = 'Phone';
        }
        if (!!email && isUserExist.email === email) {
          message = 'Email';
        }
        throw createError(401, templateConstants.ALREADY_EXIST(message));
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateCreateSubRoleRequest(req: any, res: any, next: any) {
    try {
      const { permissions, dealerId } = req.body;
      if (dealerId) {
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
          throw createError(401, templateConstants.INVALID('dealerId'));
        }
      }
      for (const permission of permissions) {
        const isModuleExist = await Module.findOne({
          where: {
            isDeleted: false,
            deletedAt: null,
            moduleId: permission.moduleId,
          },
          attributes: ['moduleId'],
        });
        if (!isModuleExist) {
          throw createError(
            401,
            templateConstants.DOES_NOT_EXIST(`ModuleId ${permission.moduleId}`)
          );
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdateSubRoleRequest(req: any, res: any, next: any) {
    try {
      const { permissions, isActive } = req.body;
      const { subRoleId } = req.params;
      const subRole = await validateUserApis.isSubRoleExist(subRoleId);
      const moduleIdMap = new Map();
      // If new module come
      const newModules: any = [];
      for (const permission of permissions) {
        if (moduleIdMap.has(permission.moduleId)) {
          throw createError(
            401,
            templateConstants.INVALID(`moduleId ${permission.moduleId}`)
          );
        } else {
          moduleIdMap.set(permission.moduleId, true);
        }
        const isModuleExist = await validateUserApis.isModuleExist(
          permission.moduleId
        );
        const isExist = await validateUserApis.isModuleAndSubRoleRelationExist(
          subRoleId,
          permission.moduleId
        );
        // If module exist but it is not related with an role that's mean it is new module
        if (isModuleExist && !isExist) {
          newModules.push(permission);
          continue;
        }
        if (permission.config === config.actionType.CREATE && isExist) {
          throw createError(
            401,
            templateConstants.ALREADY_EXIST(
              `Relation ${subRoleId}:${permission.moduleId}`
            )
          );
        }
        if (
          permission.action === config.actionType.DELETE ||
          permission.action === config.actionType.UPDATE
        ) {
          if (!isExist) {
            throw createError(
              401,
              templateConstants.INVALID(`moduleId ${permission.moduleId}`)
            );
          }
        }
      }
      if (!isNullOrUndefined(isActive)) {
        if (isActive === false) {
          const assignedUser = await User.findAll({
            where: { subRoleId: subRoleId, deletedAt: null },
            attributes: ['username'],
          });
          if (assignedUser.length) {
            throw createError(
              400,
              `This role is associated with ${assignedUser.length} Employee`
            );
          }
        }
      }
      res.locals.request = {
        subRole: subRole,
        newModules: newModules,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateDeleteRoleRequest(req: any, res: any, next: any) {
    try {
      const { subRoleId } = req.params;
      if (!subRoleId) {
        throw createError(401, templateConstants.REQUIRED_VALUE('subRoleId'));
      }
      const role = await validateUserApis.isSubRoleExist(subRoleId);
      const userCount = await User.count({
        where: {
          subRoleId: subRoleId,
          deletedAt: null,
        },
      });
      if (userCount > 0) {
        throw createError(
          400,
          templateConstants.ROLE_ALREADY_MAPPED(role?.name, userCount)
        );
      }
      res.locals.request = {
        subRole: role,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async isSubRoleExist(subRoleId: string) {
    try {
      const subRole = await SubRole.findOne({
        where: { subRoleId: subRoleId, isDeleted: false, deletedAt: null },
        attributes: ['subRoleId', 'name'],
      });
      if (!subRole) {
        throw createError(401, templateConstants.INVALID('subRoleId'));
      }
      return subRole;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async isModuleExist(moduleId: string) {
    try {
      const _module = await Module.findOne({
        where: { moduleId: moduleId, isDeleted: false, deletedAt: null },
        attributes: ['moduleId'],
      });
      if (!_module) {
        throw createError(
          401,
          templateConstants.INVALID(`moduleId ${moduleId}`)
        );
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async isModuleAndSubRoleRelationExist(subRoleId: string, moduleId: string) {
    try {
      const subRoleModule = await SubRoleModulePermission.findOne({
        where: {
          moduleId: moduleId,
          subRoleId: subRoleId,
          isDeleted: false,
          deletedAt: null,
        },
        attributes: ['subRoleModulePermissionId'],
      });
      if (subRoleModule) return true;
      return false;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async validateCreateEmployeeRequest(req: any, res: any, next: any) {
    try {
      const { email, phone, parentUserId, subRoleId } = req.body;
      const whereUserCondition = [];
      whereUserCondition.push({ email: email.toLowerCase() });
      if (phone) {
        whereUserCondition.push({ phone: phone });
      }
      const isUserExist = await User.findOne({
        where: {
          [Op.or]: whereUserCondition,
          deletedAt: null,
        },
        attributes: ['email', 'phone'],
      });
      if (isUserExist) {
        let message = 'User';
        if (phone && isUserExist.phone === phone) message = 'Phone';
        if (isUserExist.email === email) message = 'Email';
        throw createError(400, templateConstants.ALREADY_EXIST(message));
      }
      const whereCondition: any = {
        subRoleId: subRoleId,
        deletedAt: null,
        isDeleted: false,
      };
      if (parentUserId) {
        whereCondition['isDealerRole'] = true;
        whereCondition['isAdminRole'] = false;
        whereCondition['dealerId'] = parentUserId;
        const parentDealerExist = await User.findOne({
          where: {
            userId: parentUserId,
            role: config.userRolesObject.DEALER,
            subRoleId: null,
            parentUserId: null,
            deletedAt: null,
          },
          attributes: ['userId'],
        });
        if (!parentDealerExist) {
          throw createError(400, templateConstants.INVALID('parentUserId'));
        }
      } else {
        whereCondition['isDealerRole'] = false;
        whereCondition['isAdminRole'] = true;
        whereCondition['dealerId'] = null;
      }
      const isSubRoleExist = await SubRole.findOne({
        where: whereCondition,
        attributes: ['subRoleId'],
      });
      if (!isSubRoleExist) {
        throw createError(400, templateConstants.INVALID('subRoleId'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdateEmployeeRequest(req: any, res: any, next: any) {
    try {
      const { email, phone, subRoleId } = req.body;
      const { employeeId } = req.params;

      const isEmployeeExist = await User.findOne({
        where: {
          userId: employeeId,
          parentUserId: { [Op.ne]: null },
          subRoleId: { [Op.ne]: null },
          deletedAt: null,
        },
        attributes: ['email', 'phone', 'role', 'username'],
      });

      if (!isEmployeeExist) {
        throw createError(400, templateConstants.INVALID('employeeId'));
      }

      if (email || phone) {
        let condition = [];
        if (email) condition.push({ email: email });
        if (phone) condition.push({ phone: phone });
        const isUserExist = await User.findOne({
          where: {
            [Op.or]: condition,
            userId: { [Op.ne]: employeeId },
            deletedAt: null,
          },
          attributes: ['email', 'phone'],
        });
        if (isUserExist) {
          let message = 'User';
          if (isUserExist.phone === phone) message = 'Phone';
          if (isUserExist.email === email) message = 'Email';
          throw createError(400, templateConstants.ALREADY_EXIST(message));
        }
      }
      if (subRoleId) {
        const whereCondition: any = {
          subRoleId: subRoleId,
          deletedAt: null,
          isDeleted: false,
        };
        if (isEmployeeExist.role === config.userRolesObject.ADMIN) {
          whereCondition['isAdminRole'] = true;
          whereCondition['isDealerRole'] = false;
        } else {
          whereCondition['isAdminRole'] = false;
          whereCondition['isDealerRole'] = true;
        }
        const isSubRoleExist = await SubRole.findOne({
          where: whereCondition,
          attributes: ['subRoleId'],
        });
        if (!isSubRoleExist) {
          throw createError(400, templateConstants.INVALID('subRoleId'));
        }
      }
      res.locals.request = {
        user: isEmployeeExist,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateDeleteEmployeeRequest(req: any, res: any, next: any) {
    try {
      const { employeeId } = req.params;
      const isEmployeeExist = await User.findOne({
        where: {
          userId: employeeId,
          parentUserId: { [Op.ne]: null },
          subRoleId: { [Op.ne]: null },
          deletedAt: null,
        },
        attributes: ['userId'],
      });
      if (!isEmployeeExist) {
        throw createError(400, templateConstants.INVALID('employeeId'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateTokenExist(req: any, res: any, next: any) {
    try {
      const { deviceToken } = req.body;

      if (isNullOrUndefined(deviceToken)) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING('deviceToken')
        );
      }
      if (deviceToken.trim().length == 0) {
        throw createError(400, templateConstants.REQUIRED_VALUE('deviceToken'));
      }
      const isTokenExist = await UserDevice.findOne({
        where: {
          deviceToken: deviceToken,
        },
      });
      if (isTokenExist) {
        throw createError(400, templateConstants.ALREADY_MAPPED('DeviceToken'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateAdmin(req: any, res: any, next: any) {
    try {
      const { userId, role } = res.user;

      if (role != config.userRolesObject.ADMIN) {
        throw createError(400, 'Only admin allow');
      }
      if (isNullOrUndefined(userId) || isNullOrUndefined(role)) {
        throw createError(
          400,
          templateConstants.REQUIRED_VALUE('userid and role')
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateGetMerchantRequest(req: any, res: any, next: any) {
    try {
      const { merchantIds } = req.query;
      if (!merchantIds) {
        throw createError(400, templateConstants.INVALID('merchantIds'));
      }
      const merchantIdArr = [];
      for (const merchantId of merchantIds.split(',')) {
        if (isValidUUID(merchantId)) {
          merchantIdArr.push(merchantId);
        }
      }
      if (!merchantIdArr.length) {
        throw createError(400, templateConstants.INVALID('merchantIds'));
      }

      res.locals.response = {
        merchantIds: merchantIdArr,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateUserApis = new ValidateUserApis();
export { validateUserApis };
