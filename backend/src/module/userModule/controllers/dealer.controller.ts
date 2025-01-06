import { passwordService } from '../../../services/user/passwordService';
import { User } from '../../../models/User/user';
import { config } from '../../../config/config';
import { Outlet } from '../../../models/outlet';
import { DealerDocument } from '../../../models/User/Dealer/dealer_document';
import { templateConstants } from '../../../common/templateConstants';
import { Machine } from '../../../models/Machine/Machine';
import { OutletMachine } from '../../../models/outlet_machine';
import { Op, Transaction } from 'sequelize';
import { validate as isValidUUID } from 'uuid';
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
import { Transactions } from '../../../models/transactions';
import {
  calcPercent,
  generatePassword,
  isNullOrUndefined,
  otpGenerator,
} from '../../../common/utility';
import { messageService } from '../../../services/common/messageService';
import awsDeleteService from '../../../services/common/awsService/deleteService';
import { notificationService } from '../../../services/notifications/notification';
import { SubRole } from '../../../models/User/SubRole';
import { userService } from '../services/user.service';
import stringConstants from '../../../common/stringConstants';
import db from '../../../models/index';
import { sendDealerKycOTPToPhone } from '../../../services/common/smsService';
import { verifyRoleAndApp } from '../../../services/common/requestResponseHandler';
import { paginatorParamFormat } from '../../../services/commonService';
import dealerConstants from '../constant';
import { notificationConstant } from '../../../common/notificationConstants';
import moment from 'moment';
import { tokenService } from '../../../services/common/tokenService';
import { feedbackService } from '../../feedbackModule/services/feedback.service';
import { machineService } from '../../machineModule/services/machine.service';
import { billingAndAccountingService } from '../../billingAndAccounting/services/billingAndAccounting.service';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { washService } from '../../washModule/services/wash.service';
import { MachineWallet } from '../../../models/Machine/MachineWallet';

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
        `Dealer`
      );
      // notification to admin
      if (dealer) {
        const { type: adminNotiType, url: adminNotiUrl } =
          notificationConstant.adminNotificationObject.NEW_DEALER_ONBOARDED;

        const notificationBody = {
          modelDetail: {
            name: 'User',
            uuid: dealer?.userId,
          },
          type: adminNotiType,
          link: `${adminNotiUrl}/${dealer?.userId}`,
        };
        notificationService.generateNotification(
          config.userRolesObject.ADMIN,
          notificationBody
        );
      }

      //notification complete
      const dealerOutlet = outlets.map((el: any) => {
        return {
          name: el.name,
          gstNo: el.gst_no,
          cityId: el.city_id,
          address: el.address,
          dealerId: dealer.userId,
          latitude: el.latitude ? el.latitude : '',
          longitude: el.longitude ? el.longitude : '',
          isTwoWheeler: el.isTwoWheeler ? el.isTwoWheeler : false,
          isFourWheeler: el.isFourWheeler ? el.isFourWheeler : false,
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
        where: {
          isAssigned: false,
          merchantId: null,
        },
        attributes: ['machineGuid', 'name', 'status'],
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
            attributes: ['name', 'machineGuid', 'status'],
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
      await tokenService.deleteToken(dealerId);
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
       console.log("🚀 ~ DealerController ~ updateDealer ~ outlet:", outlet)      
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
      let isDeactivate = false;
      const userObj = await User.findByPk(dealerId);
      if (dealerData.isActive === false) {
        await machineService.updateDealerMachinesStatus(
          dealerId,
          config.machineStatusObject.INACTIVE
        );
        isDeactivate = true;
        msg = 'Dealership ' + userObj.username + ' has been deactivated!';
      } else if (dealerData.isActive === true) {
        await machineService.updateDealerMachinesStatus(
          dealerId,
          config.machineStatusObject.ACTIVE
        );
        msg = 'Dealership ' + userObj.username + ' has been activated!';
      } else {
        msg = templateConstants.UPDATED_SUCCESSFULLY('Dealership details');
      }
      // logout if deactivate
      if (isDeactivate) {
        await tokenService.logoutUserToken(dealerId);
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
      const {
        oemIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        startDate,
        endDate,
        sort,
        mapping,
        limit,
        offset,
        search,
        revenueStartDate,
        revenueEndDate,
        dealerIdArr,
      } = res.locals.request.queryBody;
      let { showRecords } = res.locals.request.queryBody; //
      if (isNullOrUndefined(showRecords)) {
        showRecords = true;
      }
      let whereCondition: any = {};
      let OpAndArr: any = [];
      let outletArr: any = [];
      if (oemIdArr.length) {
        OpAndArr.push({
          oemId: {
            [Op.in]: oemIdArr,
          },
        });
      }
      if (regionIdArr.length) {
        // find outletIds from the region Ids
        outletArr = await userService.getRegionBasedOutlets(
          regionIdArr,
          stateIdArr,
          cityIdArr
        );
        // if no outletIds were found then show no data
        if (outletArr.length === 0) {
          showRecords = false;
        }
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
      // search on the basis of user name and uniquId
      if (search) {
        whereCondition[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { uniqueId: { [Op.iLike]: `%${search}%` } },
        ];
      }
      whereCondition = {
        ...whereCondition,
        [Op.and]: OpAndArr,
      };
      let addInclude: any = [
        {
          model: OEM,
          attributes: ['oemId', 'name', 'status'],
        },
        {
          model: Outlet,
          where:
            outletArr.length > 0
              ? {
                  outletId: {
                    [Op.in]: outletArr,
                  },
                }
              : null,
          required: outletArr.length > 0 ? true : false,
          attributes: ['outletId', 'name', 'address'],
          include: [
            {
              model: Machine,
              attributes: [
                'blueverseCredit',
                'walletBalance',
                'topUpBalance',
                'machineGuid',
              ],
            },
            {
              model: City,
              attributes: ['cityId'],
              include: [
                {
                  model: State,
                  attributes: ['stateId'],
                  include: [
                    {
                      model: Region,
                      attributes: ['regionId', 'name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      if (mapping && mapping == 'false') {
        addInclude = [];
      }
      if (startDate && endDate) {
        if (moment(startDate).isValid() && moment(endDate).isValid()) {
          whereCondition['createdAt'] = {
            [Op.between]: [
              moment(startDate).startOf('day').toISOString(),
              moment(endDate).endOf('day').toISOString(),
            ],
          };
        }
      }
      whereCondition = {
        ...whereCondition,
        role: config.userRolesObject.DEALER,
        deletedAt: null,
        parentUserId: null,
        subRoleId: null,
      };
      if (dealerIdArr.length) {
        whereCondition['userId'] = {
          [Op.in]: dealerIdArr,
        };
      }
      let dealerRow: any = [];
      let dealerCount = 0;

      let transactionCondition: any = {};

      if (revenueStartDate && revenueEndDate) {
        transactionCondition = {
          createdAt: {
            [Op.gte]: revenueStartDate, // greater than or equal to fromDate
            [Op.lte]: revenueEndDate, // less than or equal to toDate
          },
        };
      }

      // if show records value is true then only perform the operations
      if (showRecords) {
        const dealers: any = await User.findAndCountAll({
          where: whereCondition,
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
          include: addInclude,
          limit: limit,
          offset: offset,
          order: order,
          distinct: true,
        });
        dealerRow = dealers.rows;
        dealerCount = dealers.count;
        for (let i = 0; i < dealers.rows.length; i++) {
          let totalAmount = 0;

          let blueverseCredit = 0;

          let machineIds: any = [];

          for (const outlet of dealers.rows[i].outlets) {
            for (const machine of outlet.machines) {
              totalAmount +=
                Number(machine.walletBalance) + Number(machine.topUpBalance);
              blueverseCredit += Number(machine.blueverseCredit);

              machineIds.push(machine.machineGuid);
            }
          }
          dealers.rows[i].dataValues['machinesWalletBalance'] =
            totalAmount.toFixed(2);
          dealers.rows[i].dataValues['blueverseCredit'] =
            blueverseCredit.toFixed(2);

          let totalRevenue = 0;

          // Calculating the revenue
          if (machineIds.length) {
            const machineWalletCondition: any = {
              machine_id: {
                [Op.in]: machineIds,
              },
              transactionType: 'DEBITED',
              ...transactionCondition,
              '$machine.outlet.dealer_id$': dealers.rows[i].userId,
            };

            const results: any = await MachineWallet.findAll({
              attributes: [
                'machine_id', // Must be included in GROUP BY
                [
                  db.sequelize.fn('SUM', db.sequelize.col('total_amount')),
                  'total',
                ],
                'machine.MachineGuid', // Must be included in GROUP BY
                'machine.outlet.outlet_id', // Must be included in GROUP BY
                'machine.outlet.dealer_id', // Must be included in GROUP BY
              ],
              where: machineWalletCondition,
              include: [
                {
                  model: Machine,
                  attributes: ['machineGuid'],
                  include: [
                    {
                      model: Outlet,
                      attributes: ['outletId', 'dealer_id'],
                    },
                  ],
                },
              ],
              group: [
                'machine_id',
                'machine.MachineGuid',
                'machine.outlet.outlet_id',
                'machine.outlet.dealer_id',
              ],
            });

            if (results.length) {
              totalRevenue = results.reduce((sum: number, result: any) => {
                return sum + parseFloat(result.dataValues.total || 0);
              }, 0);
            }
          }

          dealers.rows[i].dataValues['totalRevenue'] = totalRevenue;
        }
      }

      res.locals.response = {
        body: {
          data: {
            dealers: dealerRow,
            pagination: paginatorService(
              limit,
              offset / limit + 1,
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
              {
                isAssigned: true,
                status: config.machineStatusObject.ACTIVE,
                outletId: outletId,
              },
              { where: { machineGuid: machine.machineGuid } }
            );
            dataForCreation.push({
              outletId: outletId,
              machineId: machine.machineGuid,
            });
          }

          if (machine.action === config.actionType.DELETE) {
            const formId = await Machine.findOne({
              attributes: ['feedbackFormId', 'machineGuid'],
              where: {
                machineGuid: machine.machineGuid,
              },
            });
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
      const { memoRequired } = req.query;
      if (dealerDetail.parentUserId && dealerDetail.subRoleId) {
        dealerId = dealerDetail.parentUserId;
      }
      const dealer: any = await User.findOne({
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
          'profileImg',
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
              'latitude',
              'longitude',
              'isTwoWheeler',
              'isFourWheeler'
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

      // addd machine last advance memo status
      if (
        (!isNullOrUndefined(memoRequired) || memoRequired) &&
        dealer.outlets.length > 0
      ) {
        for (let i = 0; i < dealer.outlets.length; i++) {
          for (let j = 0; j < dealer.outlets[i].machines.length; j++) {
            const memo: any =
              await billingAndAccountingService.getMachineLastMemoDetail(
                dealer.outlets[i].machines[j].machineGuid,
                dealerId
              );
            dealer.outlets[i].machines[j].dataValues['memo'] = memo;
          }
        }
      }
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
      let isDeactivate = false;
      if (username) updateData['username'] = username;
      if (email) updateData['email'] = email;
      if (phone || phone == null) updateData['phone'] = phone;
      if (subRoleId) updateData['subRoleId'] = subRoleId;
      if (!isNullOrUndefined(isActive)) {
        updateData['isActive'] = isActive;
        if (isActive === false) {
          isDeactivate = true;
        }
      }
      if (Object.keys(updateData).length) {
        await User.update(updateData, { where: { userId: employeeId } });
      }
      // logout if deactivate
      if (isDeactivate) {
        await tokenService.logoutUserToken(employeeId);
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

  async getTopDealerShip(req: any, res: any, next: any) {
    try {
      const { oemIds, fromDate, toDate, dealersIds } = dataFromRequest(req);
      const user = {
        role: res.user.role,
      };
      const whereCondition: any = {
        role: config.userRolesObject.DEALER,
        deletedAt: null,
        parentUserId: null,
      };

      if (oemIds) {
        const oemIdArr = oemIds.split(',').map((oemId: string) => oemId.trim());
        if (oemIdArr.length > 0) {
          whereCondition['oemId'] = { [Op.in]: oemIdArr };
        }
      }

      if (dealersIds) {
        const dealerIdArr = dealersIds
          .split(',')
          .map((dealerId: string) => dealerId.trim());
        if (dealerIdArr.length > 0) {
          whereCondition['userId'] = { [Op.in]: dealerIdArr };
        }
      }

      const washTypes = await washService.getWashTypes(user, 'true');
      const washTypeIdArr = washTypes.map((washType) => washType.Guid);

      const dealers: any = await User.findAll({
        attributes: ['userId', 'uniqueId', 'username'],
        where: whereCondition,
        include: [
          {
            model: Outlet,
            attributes: ['outletId'],
            include: [
              {
                model: Machine,
                attributes: ['machineGuid'],
              },
            ],
          },
        ],
      });

      const dealerMachineMap: Record<string, string[]> = {};

      let transactionCondition: any = {};

      if (fromDate && toDate) {
        transactionCondition = {
          createdAt: {
            [Op.gte]: fromDate, // greater than or equal to fromDate
            [Op.lte]: toDate, // less than or equal to toDate
          },
        };
      }

      let resultsArray: any[] = [];

      for (const dealer of dealers) {
        const machineIds = dealer.outlets.flatMap((outlet: any) =>
          outlet.machines.map((machine: any) => machine.machineGuid)
        );

        dealerMachineMap[dealer.userId] = machineIds;
        let totalAmount = 0;

        if (machineIds.length) {
          const machineWalletCondition: any = {
            machine_id: {
              [Op.in]: machineIds,
            },
            transactionType: 'DEBITED',
            ...transactionCondition,
            '$machine.outlet.dealer_id$': dealer.userId,
          };

          const results: any = await MachineWallet.findAll({
            attributes: [
              'machine_id', // Must be included in GROUP BY
              [
                db.sequelize.fn('SUM', db.sequelize.col('total_amount')),
                'total',
              ],
              'machine.MachineGuid', // Must be included in GROUP BY
              'machine.outlet.outlet_id', // Must be included in GROUP BY
              'machine.outlet.dealer_id', // Must be included in GROUP BY
            ],
            where: machineWalletCondition,
            include: [
              {
                model: Machine,
                attributes: ['machineGuid'],
                include: [
                  {
                    model: Outlet,
                    attributes: ['outletId', 'dealer_id'],
                  },
                ],
              },
            ],
            group: [
              'machine_id',
              'machine.MachineGuid',
              'machine.outlet.outlet_id',
              'machine.outlet.dealer_id',
            ],
          });

          console.log('🚀 ~ DealerController ~ dealer ~ results:', results);

          if (results.length) {
            totalAmount = results.reduce((sum: number, result: any) => {
              return sum + parseFloat(result.dataValues.total || 0);
            }, 0);
          }
        }

        const obj = {
          user_id: dealer.userId,
          uniqueId: dealer.uniqueId,
          username: dealer.username,
          total: totalAmount,
        };

        resultsArray.push(obj);
      }

      resultsArray.sort((a: any, b: any) => b.total - a.total);

      const topFiveEntries = resultsArray.slice(0, 5);

      res.locals.response = {
        body: {
          data: { dealers: topFiveEntries },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }
}

export = new DealerController();
