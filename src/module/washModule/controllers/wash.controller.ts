import { Op } from 'sequelize';
import { isArray } from 'ts-express-decorators';
import { randomUUID } from 'crypto';
import createError from 'http-errors';
import { parse, Parser } from 'json2csv';
import moment from 'moment';
import { isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
import { paginatorService } from '../../../services/commonService';
import { WashType } from '../../../models/wash_type';
import { MachineAgent } from '../../../models/Machine/MachineAgent';
import { Outlet } from '../../../models/outlet';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { Transactions } from '../../../models/transactions';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { Machine } from '../../../models/Machine/Machine';

import stringConstants from '../../../common/stringConstants';
import { templateConstants } from '../../../common/templateConstants';
import { washService } from '../services/wash.service';
import { CONSTANT } from '../constant';
import { USERROLE } from '../constant';
import upload from '../../../services/common/awsService/uploadService';

class WashController {
  async generateFeedbackURL(req: any, res: any, next: any) {
    try {
      const {
        email_id,
        phone,
        name,
        manufacturer,
        transaction_guid,
        hsrp_number,
        bike_model,
      } = req.body;
      const { SkuNumber, washType, AddDate, MachineGuid } =
        res.locals.request.transactions;
      let isProfileCompleted = false;
      if (
        email_id &&
        phone &&
        name &&
        manufacturer &&
        hsrp_number &&
        bike_model
      ) {
        isProfileCompleted = true;
      }

      const machineObj = await Machine.findOne({
        where: { machineGuid: MachineGuid },
      });

      await TransactionsFeedback.create({
        transactionGuid: transaction_guid,
        name: name,
        phone: phone ? phone : null,
        emailId: email_id ? email_id : null,
        hsrpNumber: hsrp_number,
        manufacturer: manufacturer ? manufacturer : null,
        bikeModel: bike_model ? bike_model : null,
        skuNumber: SkuNumber,
        transactionType: washType.dataValues.Name,
        isProfileCompleted: isProfileCompleted,
        washTime: AddDate,
        formId: machineObj.feedbackFormId,
        createdBy: res.user.userId,
      });
      await Transactions.update(
        { QRGenerated: true },
        { where: { Guid: transaction_guid } }
      );
      res.locals.response = {
        body: {
          data: {
            url: config.feedbackBaseUrl + '/' + transaction_guid,
          },
        },
        message:
          stringConstants.washCOntrollerMessage
            .FEEDBACK_URL_GENERATED_SUCCESSFULLY,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async createTransactions(req: any, res: any, next: any) {
    try {
      const { sku_number, wash_type } = req.body;
      if (isNullOrUndefined(sku_number) || isNullOrUndefined(wash_type)) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING('Field required')
        );
      }
      const data: any = stringConstants.dummyTransactionsData;
      data.SkuNumber = sku_number;
      data.Guid = randomUUID();
      let isExistWashTypeId = await WashType.findOne({
        where: { Name: wash_type },
      });
      if (!isExistWashTypeId) {
        throw createError(400, templateConstants.INVALID('washType'));
      }
      data.WashTypeGuid = String(isExistWashTypeId.Guid);
      await Transactions.create({ ...data });
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Transaction'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getWashList(req: any, res: any, next: any) {
    try {
      let {
        sort_by,
        status,
        filters,
        search,
        offset,
        limit,
        is_profile_completed,
      } = req.body;
      const dateRange = filters ? filters.date_range : null;
      let wash_type = filters ? filters.wash_type : null;
      let from_date = dateRange?.from_date;
      let to_date = dateRange?.to_date;
      limit = Number(req.body.limit);
      offset = Number(req.body.offset);
      let totalCount = 0;
      if (!limit) {
        limit = 10;
      }
      if (!offset) {
        offset = 0;
      } else {
        offset = (offset - 1) * limit;
      }
      if (!status || !config.washListProgressType.includes(status)) {
        throw createError(400, templateConstants.INVALID('status'));
      }
      const agentAssignMachines = await MachineAgent.findAll({
        where: { agentId: res.user.userId },
        attributes: ['machineId', 'createdAt'],
      });
      let whereCondition: any = {};
      let washes: any = [];
      let order: any = [];
      if (
        agentAssignMachines.length ||
        res.user.role === config.userRolesObject.ADMIN
      ) {
        if (wash_type && isArray(wash_type) && wash_type.length) {
          const washTypes = await WashType.findAll({
            where: { Guid: { [Op.in]: wash_type } },
            attributes: ['Guid', 'Name'],
            raw: true,
          });
          if (!washTypes.length) {
            throw createError(401, templateConstants.INVALID('wash_type'));
          }
          whereCondition['WashTypeGuid'] = {
            [Op.in]: washTypes.map((el) => el.Guid),
          };
        }
        if (status === config.washListProgressTypeObject.FEEDBACK_NOT_STARTED) {
          whereCondition['QRGenerated'] = false;
          if (sort_by) {
            if (sort_by === 'NEWEST') {
              order = [['AddDate', 'DESC']];
            }
            if (sort_by === 'OLDEST') {
              order = [['AddDate', 'ASC']];
            }
          }
          if (search) {
            whereCondition['SkuNumber'] = {
              [Op.iLike]: `%${search}%`,
            };
          }
          if (agentAssignMachines.length) {
            const machineIds = agentAssignMachines.map((el) => el.machineId);
            whereCondition['MachineGuid'] = { [Op.in]: machineIds };
          }
          if (
            res.user.role === config.userRolesObject.ADMIN ||
            agentAssignMachines.length
          ) {
            if (from_date && to_date) {
              whereCondition['AddDate'] = {
                [Op.gte]: moment(from_date).startOf('day').toISOString(),
                [Op.lte]: moment(to_date).endOf('day').toISOString(),
              };
            }
            const washesWithCount = await Transactions.findAndCountAll({
              offset,
              limit,
              where: whereCondition,
              attributes: [
                'SkuNumber',
                'WashTypeGuid',
                ['Guid', 'transactionGuid'],
                ['AddDate', 'WashTime'],
                'WaterWastage',
                'WaterPrice',
                'WaterUsed',
              ],
              order: order,
              include: [
                {
                  model: WashType,
                  attributes: ['Name'],
                  where: { Name: { [Op.in]: config.washTypeArr } },
                },
              ],
              raw: true,
            });

            totalCount = washesWithCount.count;
            washes = washesWithCount.rows;
            for (const wash of washes) {
              wash['transactionType'] = wash['washType.Name'];
              delete wash['washType.Name'];
            }
          }
        }
        whereCondition = {};
        if (search) {
          whereCondition = {
            [Op.or]: [
              {
                skuNumber: {
                  [Op.iLike]: `%${search}%`,
                },
              },
              {
                hsrpNumber: {
                  [Op.iLike]: `%${search}%`,
                },
              },
              {
                name: {
                  [Op.iLike]: `%${search}%`,
                },
              },
            ],
          };
        }
        if (wash_type && isArray(wash_type) && wash_type.length) {
          whereCondition['transactionType'] = { [Op.in]: wash_type };
        }

        if (
          res.user.role === config.userRolesObject.ADMIN ||
          res.user.role === config.userRolesObject.FEEDBACK_AGENT
        ) {
          if (
            status === config.washListProgressTypeObject.FEEDBACK_IN_PROGRESS
          ) {
            let conditions = [];
            let whereFeedbackCompleted: any = {
              QRGenerated: true,
            };
            if (agentAssignMachines.length) {
              for (const machine of agentAssignMachines) {
                conditions.push({
                  MachineGuid: machine.machineId,
                });
              }
              whereFeedbackCompleted = {
                [Op.or]: conditions,
                QRGenerated: true,
              };
            }
            whereCondition['isCompleted'] = false;
            if (!isNullOrUndefined(is_profile_completed)) {
              whereCondition['isProfileCompleted'] = is_profile_completed;
            }

            if (sort_by) {
              if (sort_by === 'NEWEST') {
                order = [['createdAt', 'DESC']];
              }
              if (sort_by === 'OLDEST') {
                order = [['createdAt', 'ASC']];
              }
            }

            if (from_date && to_date) {
              whereCondition['createdAt'] = {
                [Op.gte]: moment(from_date).startOf('day').toISOString(),
                [Op.lte]: moment(to_date).endOf('day').toISOString(),
              };
            }
            washes = await TransactionsFeedback.findAll({
              // raw: true,
              offset,
              limit,
              where: whereCondition,
              order: order,
              include: [
                {
                  model: Transactions,
                  where: whereFeedbackCompleted,
                  attributes: ['WaterWastage', 'WaterPrice', 'WaterUsed'],
                  include: [
                    {
                      model: WashType,
                      attributes: ['Name'],
                      where: { Name: { [Op.in]: config.washTypeArr } },
                    },
                  ],
                },
              ],
            });
            totalCount = await TransactionsFeedback.count({
              where: whereCondition,
              include: [
                {
                  model: Transactions,
                  where: whereFeedbackCompleted,
                  include: [
                    {
                      model: WashType,
                      where: { Name: { [Op.in]: config.washTypeArr } },
                    },
                  ],
                },
              ],
            });
          }
          if (status === config.washListProgressTypeObject.FEEDBACK_COMPLETED) {
            const conditions = [];

            let whereFeedbackCompleted: any = {
              QRGenerated: true,
            };
            if (agentAssignMachines.length) {
              for (const machine of agentAssignMachines) {
                conditions.push({
                  MachineGuid: machine.machineId,
                });
              }
              whereFeedbackCompleted = {
                [Op.or]: conditions,
                QRGenerated: true,
              };
            }
            whereCondition['isCompleted'] = true;
            if (!isNullOrUndefined(is_profile_completed)) {
              whereCondition['isProfileCompleted'] = is_profile_completed;
            }
            if (sort_by) {
              if (sort_by === 'NEWEST') {
                order = [['completedAt', 'DESC']];
              }
              if (sort_by === 'OLDEST') {
                order = [['completedAt', 'ASC']];
              }
            }
            if (from_date && to_date) {
              whereCondition['completedAt'] = {
                [Op.gte]: moment(from_date).startOf('day').toISOString(),
                [Op.lte]: moment(to_date).endOf('day').toISOString(),
              };
            }
            washes = await TransactionsFeedback.findAll({
              offset,
              limit,
              where: whereCondition,
              order: order,
              include: [
                {
                  model: Transactions,
                  where: whereFeedbackCompleted,
                  attributes: ['WaterWastage', 'WaterPrice', 'WaterUsed'],
                  include: [
                    {
                      model: WashType,
                      attributes: ['Name'],
                      where: { Name: { [Op.in]: config.washTypeArr } },
                    },
                  ],
                },
              ],
            });
            totalCount = await TransactionsFeedback.count({
              where: whereCondition,
              include: [
                {
                  model: Transactions,
                  where: whereFeedbackCompleted,
                  include: [
                    {
                      model: WashType,
                      where: { Name: { [Op.in]: config.washTypeArr } },
                    },
                  ],
                },
              ],
            });
          }
        }
      }

      res.locals.response = {
        body: {
          data: {
            status: status,
            records: washes,
            pagination: paginatorService(limit, offset / limit + 1, totalCount),
          },
        },
        message: templateConstants.LIST_OF('Wash'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateFeedback(req: any, res: any, next: any) {
    try {
      const { email_id, phone, name, manufacturer, hsrp_number, bike_model } =
        req.body;
      const { id } = req.params;
      const updateData: any = {};
      if (email_id) {
        updateData['emailId'] = email_id;
      }
      if (phone) {
        updateData['phone'] = phone;
      }
      if (name) {
        updateData['name'] = name;
      }
      if (manufacturer) {
        updateData['manufacturer'] = manufacturer;
      }
      if (hsrp_number) {
        updateData['hsrpNumber'] = hsrp_number;
      }
      if (bike_model) {
        updateData['bikeModel'] = bike_model;
      }
      if (email_id && phone && manufacturer && bike_model) {
        updateData['isProfileCompleted'] = true;
      }
      if (Object.keys(updateData).length)
        await TransactionsFeedback.update(updateData, {
          where: { transactionFeedbackId: id },
        });
      res.locals.response = {
        message:
          stringConstants.washCOntrollerMessage.FEEDBACK_UPDATED_SUCCESSFULLY,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWashDetailBySKU(req: any, res: any, next: any) {
    try {
      const { skuNumber } = req.params;
      const transaction = await Transactions.findOne({
        where: { SkuNumber: skuNumber },
        include: [
          {
            model: Machine,
            attributes: ['name'],
            include: [
              {
                model: Outlet,
                attributes: ['outletId', 'name', 'address'],
                include: [
                  {
                    model: City,
                    attributes: ['cityId', 'name'],
                    include: [
                      {
                        model: State,
                        attributes: ['stateId', 'name'],
                        include: [
                          {
                            model: Region,
                            attributes: ['name', 'regionId'],
                          },
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
        message: templateConstants.DETAIL('Wash'),
        body: { data: transaction },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getwashDetail(req: any, res: any, next: any) {
    try {
      const { washId } = req.params;
      const washDetail = await washService.getWashCompleteDetail(washId);
      res.locals.response = {
        body: {
          data: {
            records: washDetail,
          },
        },
        message: CONSTANT.INDEX.replace('ENTITY', 'Wash detail'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getCustomerFeedback(req: any, res: any, next: any) {
    try {
      const { transactionFeedbackId } = req.params;
      const feedback = await washService.getCompleteWashFeedbackDetail(
        transactionFeedbackId
      );
      res.locals.response = {
        body: {
          data: {
            records: feedback,
          },
        },
        message: CONSTANT.INDEX.replace('ENTITY', 'Wash feedback'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getWashTypeList(req: any, res: any, next: any) {
    try {
      const { isAbandoned } = req.query;
      const user = {
        role: res.user.role,
      };
      const washTypes = await washService.getWashTypes(user, isAbandoned);
      res.locals.response = {
        body: {
          data: {
            records: washTypes,
          },
        },
        message: templateConstants.LIST_OF('Wash Type'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // NEW Manage wash
  async getAdminDealerWashList(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      let { sort_by, status, filters, search, offset, limit } = req.body;
      limit = Number(req.body.limit);
      offset = Number(req.body.offset);
      let totalCount = 0;
      if (!limit) {
        limit = 10;
      }
      if (!offset) {
        offset = 0;
      } else {
        offset = (offset - 1) * limit;
      }
      let filterKey: any = {};
      if (filters) {
        filterKey = {
          outletIds: filters.outletIds ? filters.outletIds : [],
          machineIds: filters.machineIds ? filters.machineIds : [],
          washTypeIds: filters.washTypeIds ? filters.washTypeIds : [],
          cityIds: filters.cityIds ? filters.cityIds : [],
          stateIds: filters.stateIds ? filters.stateIds : [],
          regionIds: filters.regionIds ? filters.regionIds : [],
          oemIds: filters.oemIds ? filters.oemIds : [],
          dealerIds: filters.dealerIds ? filters.dealerIds : [],
          startDate: filters.startDate
            ? new Date(filters.startDate).setDate(
                new Date(filters.startDate).getDate()
              )
            : '',
          endDate: filters.endDate
            ? new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            : '',
        };
      }
      const body = {
        sort_by,
        filters,
        filterKey,
        search,
        offset,
        limit,
      };
      const washes = await washService.getWashesList(body, user);
      res.locals.response = {
        body: {
          data: {
            records: washes.rows,
            pagination: paginatorService(
              limit,
              offset / limit + 1,
              washes.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Washes'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportWashDetails(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user?.role,
      };
      let { sort_by, filters, search } = req.body;
      let totalCount = 0;
      let filterKey: any = {};
      if (filters) {
        filterKey = {
          outletIds: filters.outletIds ? filters.outletIds : [],
          machineIds: filters.machineIds ? filters.machineIds : [],
          washTypeIds: filters.washTypeIds ? filters.washTypeIds : [],
          cityIds: filters.cityIds ? filters.cityIds : [],
          stateIds: filters.stateIds ? filters.stateIds : [],
          regionIds: filters.regionIds ? filters.regionIds : [],
          oemIds: filters.oemIds ? filters.oemIds : [],
          dealerIds: filters.dealerIds ? filters.dealerIds : [],
          startDate: filters.startDate
            ? new Date(filters.startDate).setDate(
                new Date(filters.startDate).getDate()
              )
            : '',
          endDate: filters.endDate
            ? new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            : '',
        };
      }
      const body = {
        sort_by,
        filters,
        filterKey,
        search,
      };
      const washes: any = await washService.getWashesList(body, user);
      const { count, rows } = washes;
      let result: any = [];
      let csvFields = [];
      if (user.role == USERROLE.DEALER) {
        for (let i = 0; i < rows.length; i++) {
          result.push({
            'Sr.No': i + 1,
            SKU: rows[i].SkuNumber,
            Outlet: rows[i].machine?.outlet?.name,
            Machine: rows[i].machine?.name,
            'Wash type': rows[i].washType?.Name,
            'Price(Rs) Incl.GST': rows[i].machineWallet?.totalAmount || 0,
            Shampoo: rows[i].ShampooUsed,
            Foam: rows[i].FoamUsed,
            Wax: rows[i].WaxUsed,
            Electricity: rows[i].ElectricityUsed,
            WashTime: moment(rows[i].AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
        }
        csvFields = [
          'Sr.No',
          'SKU',
          'Outlet',
          'Machine',
          'Wash type',
          'Price(Rs) Incl.GST',
          'Shampoo',
          'Foam',
          'Wax',
          'Electricity',
          'WashTime',
        ];
      } else {
        for (let i = 0; i < rows.length; i++) {
          result.push({
            'Sr.No': i + 1,
            SKU: rows[i].SkuNumber,
            Dealership: rows[i].machine?.outlet?.dealer?.username,
            OEM: rows[i].machine?.outlet?.dealer?.oem?.name,
            Outlet: rows[i].machine?.outlet?.name,
            Machine: rows[i].machine?.name,
            Region: rows[i].machine?.outlet?.city?.state?.region?.name,
            State: rows[i].machine?.outlet?.city?.state?.name,
            City: rows[i].machine?.outlet?.city?.name,
            'Wash type': rows[i].washType?.Name,
            'Price(Rs) Incl.GST': rows[i].machineWallet?.totalAmount || 0,
            Shampoo: rows[i].ShampooUsed,
            Foam: rows[i].FoamUsed,
            Wax: rows[i].WaxUsed,
            Electricity: rows[i].ElectricityUsed,
            WashTime: moment(rows[i].AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
        }
        csvFields = [
          'Sr.No',
          'SKU',
          'Dealership',
          'OEM',
          'Outlet',
          'Machine',
          'Region',
          'State',
          'City',
          'Wash type',
          'Price(Rs) Incl.GST',
          'Shampoo',
          'Foam',
          'Wax',
          'Electricity',
          'WashTime',
        ];
      }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const fileName = 'Washes.csv';
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: 'Export complete! You can now view your Manage Washes data',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWashTypeCount(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      let { filters, search } = req.body;
      let filterKey: any = {};
      if (filters) {
        filterKey = {
          outletIds: filters.outletIds ? filters.outletIds : [],
          machineIds: filters.machineIds ? filters.machineIds : [],
          washTypeIds: filters.washTypeIds ? filters.washTypeIds : [],
          cityIds: filters.cityIds ? filters.cityIds : [],
          stateIds: filters.stateIds ? filters.stateIds : [],
          regionIds: filters.regionIds ? filters.regionIds : [],
          oemIds: filters.oemIds ? filters.oemIds : [],
          dealerIds: filters.dealerIds ? filters.dealerIds : [],
          startDate: filters.startDate
            ? new Date(filters.startDate).setDate(
                new Date(filters.startDate).getDate()
              )
            : '',
          endDate: filters.endDate
            ? new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            : '',
        };
      }
      const body = {
        filters,
        filterKey,
        search,
      };
      let allWashTypesResult: any = [];
      if (filterKey.washTypeIds.length == 0) {
        const washTypes = await washService.getWashTypes(user, 'false');
        for (const data of washTypes) {
          const washTypeCount: any = {};
          filterKey.washTypeIds = [`${data.Guid}`];
          washTypeCount['Guid'] = data.Guid;
          washTypeCount['Name'] = data.Name;
          const washesCount = await washService.getWashTypesCount(body, user);
          washTypeCount['count'] = washesCount;
          allWashTypesResult.push(washTypeCount);
        }
      } else if (filterKey.washTypeIds.length > 0) {
        const filterWashtypeId = filterKey.washTypeIds;
        for (const washId of filterWashtypeId) {
          const washType = await washService.getWashTypeDetails(washId);
          if (washType) {
            const washTypeCount: any = {};
            washTypeCount['Guid'] = washType.Guid;
            washTypeCount['Name'] = washType.Name;
            filterKey.washTypeIds = [`${washType.Guid}`];
            const washesCount = await washService.getWashTypesCount(body, user);
            washTypeCount['count'] = washesCount;
            allWashTypesResult.push(washTypeCount);
          }
        }
      }
      res.locals.response = {
        body: {
          data: {
            records: allWashTypesResult,
          },
        },
        message: templateConstants.LIST_OF('Washe types count'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const washController = new WashController();
export { washController };
