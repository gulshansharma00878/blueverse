import { passwordService } from '../../../services/user/passwordService';
import { User } from '../../../models/User/user';
import { config } from '../../../config/config';
import { Outlet } from '../../../models/outlet';
import { DealerDocument } from '../../../models/User/Dealer/dealer_document';
import { templateConstants } from '../../../common/templateConstants';
import { Machine } from '../../../models/Machine/Machine';
import { OutletMachine } from '../../../models/outlet_machine';
import { Op } from 'sequelize';
import {
  isAdmin,
  paginatorService,
  removeMachineMappingData,
} from '../../../services/commonService';
import createError from 'http-errors';
import { OEM } from '../../../models/oem';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import {
  generatePassword,
  isNullOrUndefined,
  otpGenerator,
} from '../../../common/utility';
import { messageService } from '../../../services/common/messageService';
import awsDeleteService from '../../../services/common/awsService/deleteService';
import { SubRole } from '../../../models/User/SubRole';
import { userService } from '../services/user.service';
import stringConstants from '../../../common/stringConstants';
import db from '../../../models/index';
import { sendDealerKycOTPToPhone } from '../../../services/common/smsService';
import { verifyRoleAndApp } from '../../../services/common/requestResponseHandler';
import { paginatorParamFormat } from '../../../services/commonService';
import dealerConstants from '../constant';

class DealerController {
  async deleteUserConstraints(req: any, res: any, next: any) {
    for (let i = 1; i < 500; i++) {
      await db.sequelize.query(
        'ALTER TABLE public.user DROP CONSTRAINT user_email_key' + i + ';'
      );
      await db.sequelize.query(
        'ALTER TABLE public.user DROP CONSTRAINT user_phone_key' + i + ';'
      );
    }
  }

  async createDealer(req: any, res: any, next: any) {
    try {
      const { oem_id, username, email, phone, pan_no, outlets, documents } =
        req.body;

      const password = generatePassword();
      const passwordHash = await passwordService.hashPassword(password);
      const dealerId = await userService.getUserIdByUserType(
        config.userRolesObject.DEALER
      );
      const dealer = await User.create({
        username: username,
        uniqueId: dealerId,
        email: email.toLowerCase(),
        phone: phone,
        panNo: pan_no,
        password: passwordHash,
        isActive: true,
        role: config.userRolesObject.DEALER,
        oemId: oem_id,
      });
      messageService.sendEmployeeRegistrationMessageWithPassword(
        email,
        username,
        password,
        `DEALERSHIP’s Employee`
      );
      const dealerOutlet = outlets.map((el: any) => {
        return {
          name: el.name,
          gstNo: el.gst_no,
          cityId: el.city_id,
          address: el.address,
          dealerId: dealer.userId,
        };
      });
      const outletsRes = await Outlet.bulkCreate(dealerOutlet);
      if (documents && documents.length) {
        const docs = documents.map((el: any) => {
          return {
            name: el.name,
            url: el.url,
            dealerId: dealer.userId,
          };
        });
        await DealerDocument.bulkCreate(docs);
      }
      const outletIds = outletsRes.map((el) => el.outletId);
      const outletsWithCity = await Outlet.findAll({
        where: { outletId: { [Op.in]: outletIds } },
        include: [
          {
            model: City,
            attributes: ['name'],
            include: [
              {
                model: State,
                attributes: ['name', 'stateId'],
                include: [{ model: Region, attributes: ['name', 'regionId'] }],
              },
            ],
          },
        ],
      });
      res.locals.response = {
        body: {
          data: {
            dealerOutlet: outletsWithCity,
            dealer: { dealer_id: dealer.userId },
          },
        },
        message: stringConstants.userControllerMessage.DEALER_ADD,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async assignMachineToDealerOutlet(req: any, res: any, next: any) {
    try {
      const { data } = req.body;

      const dataForCreation = [];
      const machineIds = [];
      for (const id of data) {
        for (const machine of id.machine_ids) {
          dataForCreation.push({
            outletId: id.outlet_id,
            machineId: machine,
          });
          machineIds.push(machine);

          await Machine.update(
            { isAssigned: true, outletId: id.outlet_id },
            { where: { machineGuid: machine } }
          );
        }
      }
      await OutletMachine.bulkCreate(dataForCreation);

      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY(
          'Outlet machine mapping'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getMachineListForAssignDealer(req: any, res: any, next: any) {
    try {
      const machines = await Machine.findAll({
        where: { isAssigned: false },
        attributes: ['machineGuid', 'name'],
        order: [['createdAt', 'DESC']],
      });
      res.locals.response = {
        body: {
          data: {
            machines: machines,
          },
        },
        message: templateConstants.LIST_OF('Machine'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealersOutletList(req: any, res: any, next: any) {
    try {
      const { dealerIds } = res.locals.response;
      const outlets = await Outlet.findAll({
        where: { dealerId: { [Op.in]: dealerIds }, status: 1 },
        include: [
          {
            model: Machine,
            attributes: ['name', 'machineGuid'],
          },
          {
            model: City,
            attributes: ['name'],
            include: [
              {
                model: State,
                attributes: ['name', 'stateId'],
                include: [{ model: Region, attributes: ['name', 'regionId'] }],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.locals.response = {
        body: {
          data: {
            outlets: outlets,
          },
        },
        message: templateConstants.LIST_OF('Dealer outlets'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async deleteDealer(req: any, res: any, next: any) {
    try {
      const { dealerId } = req.params;
      const dealerOutletMachine = await Outlet.findAll({
        where: { dealerId: dealerId },
        attributes: ['outletId'],
        include: [{ model: Machine, attributes: ['name'] }],
      });
      for (const outlet of dealerOutletMachine) {
        if (outlet.machines.length) {
          throw createError(
            400,
            dealerConstants.MACHINES_ASSIGNED_TO_THIS_DEALER
          );
        }
      }
      await User.update(
        {
          deletedAt: new Date(),
          isActive: false,
          deletedBy: res.user.userId,
        },
        { where: { userId: dealerId } }
      );

      await User.update(
        { deletedAt: new Date(), isActive: false, deletedBy: res.user.userId },
        {
          where: { parentUserId: dealerId },
        }
      );
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Dealer'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateDealer(req: any, res: any, next: any) {
    try {
      const { dealerId } = req.params;
      const {
        dealerData,
        dealerOutletUpdateDate,
        dealerOutletCreateData,
        dealerDocumentCreateData,
        dealerDocumentDeleteData,
        dealerDocumentUpdateData,
      } = res.locals.request;
      await User.update(dealerData, {
        where: { userId: dealerId },
      });
      for (const outlet of dealerOutletUpdateDate) {
        const outletId = outlet.outletId;
        delete outlet.outletId;
        await Outlet.update(outlet, { where: { outletId: outletId } });
      }
      if (dealerOutletCreateData.length) {
        await Outlet.bulkCreate(dealerOutletCreateData);
      }
      if (dealerDocumentUpdateData.length) {
        for (const document of dealerDocumentUpdateData) {
          const documentId = document.dealerDocumentId;
          delete document.dealerDocumentId;
          await DealerDocument.update(document, {
            where: { dealerDocumentId: documentId },
          });
        }
      }
      if (dealerDocumentCreateData.length) {
        await DealerDocument.bulkCreate(dealerDocumentCreateData);
      }
      if (dealerDocumentDeleteData.length) {
        const documentIds: any = [];
        for (const document of dealerDocumentDeleteData) {
          documentIds.push(document.document_id);
          const imageToRemove = document.url.split('/').slice(-1)[0];
          await awsDeleteService.deleteUploadedProfileImage(
            decodeURIComponent(imageToRemove)
          );
        }
        await DealerDocument.destroy({
          where: { dealerDocumentId: { [Op.in]: documentIds } },
        });
      }

      if (dealerData) {
        if (!isNullOrUndefined(dealerData.isActive)) {
          User.update(
            { isActive: dealerData.isActive },
            { where: { parentUserId: dealerId } }
          );
        }
      }
      let msg;
      const userObj = await User.findByPk(dealerId);
      if (dealerData.isActive === false) {
        msg = 'Dealership ' + userObj.username + ' has been deactivated!';
      } else if (dealerData.isActive === true) {
        msg = 'Dealership ' + userObj.username + ' has been activated!';
      } else {
        msg = templateConstants.UPDATED_SUCCESSFULLY('Dealership details');
      }
      res.locals.response = {
        message: msg,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async createDealerSubscriptionSetting(req: any, res: any, next: any) {
    try {
      const { data, dealershipName } = res.locals.request;
      for (const outlet of data) {
        await OutletMachine.update(outlet.data, { where: outlet.where });
      }
      res.locals.response = {
        message: stringConstants.subscription.SUBSCRITPION_ADD,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getDealerList(req: any, res: any, next: any) {
    try {
      let { offset, limit, search, sort, mapping } = req.query;
      let { _limit, _offset } = paginatorParamFormat(limit, offset);
      const whereCondition: any = {
        role: config.userRolesObject.DEALER,
        deletedAt: null,
        parentUserId: null,
        subRoleId: null,
      };

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
      let addInclude: any = [
        {
          model: Outlet,
          attributes: ['outletId', 'name', 'address'],
          include: [
            {
              model: Machine,
              attributes: ['blueverseCredit', 'walletBalance', 'topUpBalance'],
            },
          ],
        },
      ];
      if (mapping && mapping == 'false') {
        addInclude = [];
      }

      const dealers: any = await User.findAll({
        where: whereCondition,
        limit: _limit,
        offset: _offset,
        attributes: [
          'username',
          'uniqueId',
          'phone',
          'isKycDone',
          'email',
          'userId',
          'createdAt',
          'userId',
          'isActive',
          'address',
          'kycDoneAt',
        ],
        order: order,
        include: addInclude,
      });
      const dealerCount = await User.count({
        where: whereCondition,
      });

      for (let i = 0; i < dealers.length; i++) {
        let totalAmount = 0;

        for (const outlet of dealers[i].outlets) {
          for (const machine of outlet.machines) {
            totalAmount +=
              Number(machine.walletBalance) + Number(machine.topUpBalance);
          }
        }
        dealers[i].dataValues['machinesWalletBalance'] = totalAmount.toFixed(2);
      }
      res.locals.response = {
        body: {
          data: {
            dealers: dealers,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              dealerCount
            ),
          },
        },
        message: templateConstants.LIST_OF('Dealer'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateOutletAssignMachine(req: any, res: any, next: any) {
    try {
      const { data } = req.body;
      const { dealerId } = req.params;
      for (const outlet of data) {
        const outletId = outlet.outlet_id;
        const isDealerOutletExist = await Outlet.findOne({
          where: { dealerId: dealerId, outletId: outletId, status: 1 },
        });
        if (!isDealerOutletExist) {
          throw createError(400, templateConstants.INVALID('outlet_id'));
        }
        const machines = outlet.machines;
        const dataForCreation = [];
        for (const machine of machines) {
          if (machine.action === config.actionType.CREATE) {
            await Machine.update(
              { isAssigned: true, outletId: outletId },
              { where: { machineGuid: machine.machineGuid } }
            );
            dataForCreation.push({
              outletId: outletId,
              machineId: machine.machineGuid,
            });
          }

          if (machine.action === config.actionType.DELETE) {
            await Promise.all([
              Machine.update(
                { isAssigned: false, outletId: null },
                { where: { machineGuid: machine.machineGuid } }
              ),
              OutletMachine.destroy({
                where: { outletId: outletId, machineId: machine.machineGuid },
              }),
            ]);
            await removeMachineMappingData(machine.machineGuid, outletId);
          }
        }
        if (dataForCreation.length) {
          await OutletMachine.bulkCreate(dataForCreation);
        }
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Outlet machine'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealerDetailById(req: any, res: any, next: any) {
    try {
      let dealerId = req.params.dealerId;
      const dealerDetail = res.locals.response.dealer;
      if (dealerDetail.parentUserId && dealerDetail.subRoleId) {
        dealerId = dealerDetail.parentUserId;
      }
      const dealer = await User.findOne({
        where: {
          userId: dealerId,
        },
        attributes: [
          'username',
          'email',
          'isActive',
          'createdAt',
          'panNo',
          'oemId',
          'userId',
          'phone',
          'kycDoneAt',
          'uniqueId',
        ],
        include: [
          { model: OEM, attributes: ['oemId', 'name', 'status'] },
          {
            model: Outlet,
            attributes: [
              'outletId',
              'name',
              'address',
              'status',
              'cityId',
              'dealerId',
              'gstNo',
            ],
            include: [
              {
                model: City,
                attributes: ['cityId', 'name', 'status'],
                include: [
                  {
                    model: State,
                    attributes: ['stateId', 'name', 'status'],
                    include: [
                      {
                        model: Region,
                        attributes: ['regionId', 'name', 'status'],
                      },
                    ],
                  },
                ],
              },
              {
                model: Machine,
                attributes: [
                  'name',
                  'machineGuid',
                  'status',
                  'isAssigned',
                  'feedbackFormId',
                  'walletBalance',
                  'blueverseCredit',
                  'topUpBalance',
                ],
                include: [{ model: OutletMachine }],
              },
            ],
          },
          {
            model: DealerDocument,
            attributes: ['dealerDocumentId', 'name', 'url', 'createdAt'],
            where: { deletedAt: null },
            required: false,
          },
        ],
      });
      res.locals.response = { body: { data: dealer } };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req: any, res: any, next: any) {
    try {
      const { username, email, phone, subRoleId, isActive } = req.body;
      const { employeeId } = req.params;
      const { user } = res.locals.request;
      const updateData: any = {};
      if (username) updateData['username'] = username;
      if (email) updateData['email'] = email;
      if (phone || phone == null) updateData['phone'] = phone;
      if (subRoleId) updateData['subRoleId'] = subRoleId;
      if (!isNullOrUndefined(isActive)) {
        updateData['isActive'] = isActive;
      }
      if (Object.keys(updateData).length) {
        await User.update(updateData, { where: { userId: employeeId } });
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY(
          `Employee ${user.username}`
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async verifyDealerKycOTP(req: any, res: any, next: any) {
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
      } = res.locals.request.user;
      let data = {};
      await User.update(
        { isKycDone: true, kycDoneAt: new Date() },
        { where: { email: email, userId: userId } }
      );
      const token = await userService.createLoginToken(
        res.locals.request.user,
        email
      );
      let permission: any;
      if (subRoleId && parentUserId) {
        const userDetail = await userService.getUserWithPermission(userId);
        if (userDetail.subRole) {
          permission = userDetail.subRole;
        }
      }

      if (!subRoleId && !parentUserId) {
        await User.update(
          { isKycDone: true, kycDoneAt: new Date() },
          { where: { parentUserId: userId } }
        );
      }
      data = {
        token: token,
        isKycDone: true,
        role: role,
        username,
        phone,
        profileImg,
        subRoleId,
        parentUserId,
        permissions: permission,
      };

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

  async sendDealerKycOtpOnPhonePhone(req: any, res: any, next: any) {
    try {
      const { email, phone } = req.body;
      const otp = otpGenerator();
      await sendDealerKycOTPToPhone(otp, phone, email);
      res.locals.response = {
        message: 'Otp Send Successfully',
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

export = new DealerController();
