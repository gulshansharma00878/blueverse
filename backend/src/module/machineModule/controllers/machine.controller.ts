import { machineService } from '../services/machine.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { NextFunction, Request } from 'express';
import { parse, Parser } from 'json2csv';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { Machine } from '../../../models/Machine/Machine';
import { templateConstants } from '../../../common/templateConstants';
import { notificationConstant } from '../../../common/notificationConstants';
import createError from 'http-errors';
import { validate as isValidUUID } from 'uuid';
import { Outlet } from '../../../models/outlet';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { User } from '../../../models/User/user';
import { OEM } from '../../../models/oem';
import { Op } from 'sequelize';
import { config } from '../../../config/config';
import { Transactions } from '../../../models/transactions';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import db from '../../../models';
import { WashType } from '../../../models/wash_type';
import { OutletMachine } from '../../../models/outlet_machine';
import moment from 'moment';
import { MachineHealth } from '../../../models/Machine/MachineHealth';
import { HealthMatrix } from '../../../models/HealthMatrix';
import { ServiceRequest } from '../../../models/ServiceRequest';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import upload from '../../../services/common/awsService/uploadService';
import { notificationService } from '../../../services/notifications/notification';
import { billingAndAccountingService } from '../../billingAndAccounting/services/billingAndAccounting.service';

class MachineController {
  /**
   * Create Machine
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await machineService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', 'Machine'),
      results,
      200
    );
  };

  /**
   * Get paginated list of machines
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: any, res: any, next: any) => {
    try {
      let results: any;
      const { role } = res.user;
      const { outletIds, dealerId, memoRequired, status } = req.query;

      let userId = res.user.parentUserId
        ? res.user.parentUserId
        : res.user.userId;
      let filters: any = {};
      filters = dataFromRequest(req, 'filters');

      filters = {
        ...filters,
        status: config.machineStatusObject.ACTIVE,
      };

      if (status == 'true') {
        delete filters.status;
      }

      if (role === config.userRolesObject.DEALER || !!dealerId) {
        if (!!dealerId) {
          userId = dealerId;
        }
        let outletIdArr = [];
        if (outletIds) {
          for (const id of outletIds.split(',')) {
            if (isValidUUID(id)) {
              outletIdArr.push(id);
            }
          }
        }
        results = await Machine.findAll({
          where: filters,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Outlet,
              attributes: ['outletId'],
              where: {
                dealerId: userId,
                outletId: { [Op.or]: outletIdArr },
              },
            },
            {
              model: OutletMachine,
              attributes: [
                'taxableAmount',
                'total',
                'outletMachineId',
                'minimumWashCommitment',
                'cgst',
                'sgst',
                'pricingTerms',
                'securityDeposited',
                'invoiceDate',
                'billingCycle',
              ],
            },
          ],
        });

        if (!isNullOrUndefined(memoRequired) || memoRequired) {
          for (let i = 0; i < results.length; i++) {
            const memo: any =
              await billingAndAccountingService.getMachineLastMemoDetail(
                results[i].machineGuid,
                userId
              );
            results[i].dataValues['memo'] = memo;
          }
        }
      } else {
        results = await machineService.index(filters);
      }
      return createResponseObject(
        res,
        CONSTANT.INDEX.replace('ENTITY', 'Machine'),
        results,
        200
      );
    } catch (err) {
      next(err);
    }
  };
  async getMachineList(req: Request, res: any, next: NextFunction) {
    try {
      const { offset, limit }: any = req.query;

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
      const paginate = {
        _limit,
        _offset,
      };
      // Service function
      const machines = await machineService.getMachineList(req, res, paginate);
      res.locals.response = {
        body: {
          data: {
            machines: machines.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              machines.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Machine'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateMachineStatus(req: Request, res: any, next: NextFunction) {
    try {
      const { status } = req.body;
      const { machineId } = req.params;
      const isMachineExist = await Machine.findOne({
        where: { machineGuid: machineId },
        attributes: ['machineGuid'],
      });
      if (!isMachineExist) {
        throw createError(401, templateConstants.DOES_NOT_EXIST('machineId'));
      }
      await Machine.update(
        { status: status },
        { where: { machineGuid: machineId } }
      );
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Machine status'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineListCountStatusWise(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      req.query['status'] = config.machineStatusObject.SUSPENDED;
      let suspendCond = machineService.getMachineListCondition(req, res, {});
      req.query['status'] = config.machineStatusObject.ACTIVE;
      let activeCond = machineService.getMachineListCondition(req, res, {});
      req.query['status'] = config.machineStatusObject.INACTIVE;
      let inActiveCond = machineService.getMachineListCondition(req, res, {});

      const count = await Promise.all([
        Machine.count({
          where: suspendCond.where,
          include: suspendCond.include,
        }),
        Machine.count({
          where: activeCond.where,
          include: activeCond.include,
        }),
        Machine.count({
          where: inActiveCond.where,
          include: inActiveCond.include,
        }),
      ]);
      res.locals.response = {
        message: 'Machine count status wise',
        body: {
          data: {
            suspendedMachine: count[0],
            activeMachine: count[1],
            inactiveMachine: count[2],
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineWaterMetrics(req: Request, res: any, next: NextFunction) {
    try {
      const { fromDate, toDate }: any = req.query;
      const machineId = req.params.machineId;
      const whereCondition: any = { MachineGuid: machineId };
      if (!isValidGuid(machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(
          req.params.machineId,
          userId
        );
      }
      if (res.user.role) {
        const washType = await WashType.findAll({
          attributes: ['Name', 'Guid'],
          where: {
            Name: { [Op.in]: config.washTypeArr },
          },
        });
        const washTypeIds = washType.map((type) => type.Guid);
        whereCondition['WashTypeGuid'] = {
          [Op.in]: washTypeIds,
        };
      }
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['AddDate'] = {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          };
        }
      }
      const usedData: any = await Transactions.findAll({
        raw: true,
        where: whereCondition,
        attributes: [
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('AVG', db.sequelize.col('PHValue')),
              2
            ),
            'totalPHValue',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('AVG', db.sequelize.col('TDSValue')),
              2
            ),
            'totalTDSValue',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('AVG', db.sequelize.col('TSSValue')),
              2
            ),
            'totalTSSValue',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('AVG', db.sequelize.col('CODValue')),
              2
            ),
            'totalCODValue',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('AVG', db.sequelize.col('OilAndGreaseValue')),
              2
            ),
            'totalOilAndGreaseValue',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('SUM', db.sequelize.col('WaterUsed')),
              2
            ),
            'totalWaterUsed',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('SUM', db.sequelize.col('WaterWastage')),
              2
            ),
            'totalWaterWastage',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.fn('SUM', db.sequelize.col('WaterPrice')),
              2
            ),
            'totalWaterPrice',
          ],
        ],
      });
      res.locals.response = {
        body: {
          data: usedData,
        },
        message: templateConstants.DETAIL('Machine water metrics'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineDetailById(req: Request, res: any, next: NextFunction) {
    try {
      if (!isValidGuid(req.params.machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      const { memoRequired } = req.query; //if memo Required is true then add the current dealer last advance memo detail
      let dealerId = '';
      // if the role is dealer update dealerId
      if (res.user.role === config.userRolesObject.DEALER) {
        // if the loggedIn user is employee then take his dealer Id(parentUserId)
        dealerId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(
          req.params.machineId,
          userId
        );
        dealerId = userId;
      }
      const machine: any = await Machine.findOne({
        where: { machineGuid: req.params.machineId },
        attributes: [
          'name',
          'machineGuid',
          'ShortName',
          'status',
          'walletBalance',
          'blueverseCredit',
          'topUpBalance',
          'isAssigned',
          'feedbackFormId',
        ],
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'name', 'address', 'gstNo'],
            include: [
              {
                model: User,
                attributes: ['username', 'email', 'phone', 'userId'],
              },
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
          {
            model: OutletMachine,
            attributes: [
              'taxableAmount',
              'total',
              'outletMachineId',
              'minimumWashCommitment',
              'cgst',
              'sgst',
              'pricingTerms',
              'securityDeposited',
              'invoiceDate',
              'billingCycle',
            ],
          },
        ],
      });
      const washType = await WashType.findAll({
        where: { Name: { [Op.in]: config.washTypeArr } },
        raw: true,
        attributes: ['Guid'],
      });
      const washTypeIds: any = [];
      washType.forEach((el) => {
        washTypeIds.push(el.Guid);
      });
      let condition = {
        MachineGuid: req.params.machineId,
        AddDate: {
          [Op.gte]: moment().startOf('month').toISOString(),
          [Op.lte]: moment().toISOString(),
        },
        WashTypeGuid: { [Op.in]: washTypeIds },
      };
      let { fromDate, toDate }: any = req.query;
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          condition['AddDate'] = {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          };
        }
      }

      const [transactions, responseReceived, machineHealth] = await Promise.all(
        [
          Transactions.count({
            where: condition,
          }),
          Transactions.findAll({
            where: { MachineGuid: req.params.machineId, QRGenerated: true },
            attributes: ['SkuNumber'],
          }),
          MachineHealth.findAll({
            where: { MachineGuid: req.params.machineId },
            attributes: ['Status', 'Guid'],
            include: [
              {
                model: HealthMatrix,
                where: { isDeleted: { [Op.eq]: null } },
                attributes: [
                  'Guid',
                  'Alarm',
                  'Weightage',
                  'Critical',
                  'PlcTag',
                ],
              },
            ],
          }),
        ]
      );
      const skuNumbers = responseReceived.map((el) => el.SkuNumber);
      const responseReceivedCount = await TransactionsFeedback.count({
        where: { skuNumber: { [Op.in]: skuNumbers }, isCompleted: true },
      });
      machine.dataValues['responseReceivedCount'] = responseReceivedCount;
      machine.dataValues['washesDone'] = transactions;
      const activeAlarms = machineHealth.filter((el) => el.Status === false);
      machine.dataValues['machineHealth'] =
        (100 * activeAlarms.length) / machineHealth.length;

      // if memoRequired is true and dealerId is present then add  current dealer  last machine advance memo detail
      if ((!isNullOrUndefined(memoRequired) || memoRequired) && dealerId) {
        const memo: any =
          await billingAndAccountingService.getMachineLastMemoDetail(
            req.params.machineId,
            dealerId
          );
        machine.dataValues['memo'] = memo;
      }

      res.locals.response = {
        body: {
          data: machine,
        },
        message: templateConstants.DETAIL('Machine'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineTransactionList(req: Request, res: any, next: NextFunction) {
    try {
      if (!isValidGuid(req.params.machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(
          req.params.machineId,
          userId
        );
      }

      let { offset, limit }: any = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const paginate = {
        _limit,
        _offset,
      };
      const transactions = await machineService.getMachineTransactionList(
        req,
        res,
        paginate
      );
      const machine = await Machine.findOne({
        where: { machineGuid: req.params.machineId },
        attributes: ['name', 'machineGuid'],
      });
      res.locals.response = {
        body: {
          data: {
            transactions: transactions.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              transactions.count
            ),
            machine: machine,
          },
        },
        message: templateConstants.LIST_OF('machine transactions'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineConsumptionMetrics(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      if (!isValidGuid(req.params.machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(
          req.params.machineId,
          userId
        );
      }

      const { fromDate, toDate }: any = req.query;
      const whereCondition: any = {
        MachineGuid: req.params.machineId,
      };
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['AddDate'] = {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          };
        }
      }
      const washTypes = await WashType.findAll({
        where: { Name: { [Op.in]: config.washTypeArr } },
        raw: true,
      });
      let silverId = '';
      let goldId = '';
      let platinumId = '';
      washTypes.forEach((el) => {
        if (el.Name === 'SILVER') {
          silverId = el.Guid;
        }
        if (el.Name === 'GOLD') {
          goldId = el.Guid;
        }
        if (el.Name === 'PLATINUM') {
          platinumId = el.Guid;
        }
      });
      const _attributes: any = [
        [db.sequelize.fn('SUM', db.sequelize.col('FoamUsed')), 'totalFoamUsed'],

        [
          db.sequelize.fn('SUM', db.sequelize.col('ShampooUsed')),
          'totalShampooUsed',
        ],

        [db.sequelize.fn('SUM', db.sequelize.col('WaxUsed')), 'totalWaxUsed'],

        [
          db.sequelize.fn('SUM', db.sequelize.col('ElectricityUsed')),
          'totalElectricityUsed',
        ],

        [
          db.sequelize.fn('SUM', db.sequelize.col('WaterUsed')),
          'totalWaterUsed',
        ],
        [db.sequelize.fn('COUNT', db.sequelize.col('Guid')), 'washCount'],
      ];
      const consumptionMetricsSilver = await Transactions.findAll({
        where: { ...whereCondition, WashTypeGuid: silverId },
        attributes: _attributes,
        raw: true,
      });
      const consumptionMetricsGold = await Transactions.findAll({
        where: { ...whereCondition, WashTypeGuid: goldId },
        attributes: _attributes,
        raw: true,
      });
      const consumptionMetricsPlatinum = await Transactions.findAll({
        where: { ...whereCondition, WashTypeGuid: platinumId },
        attributes: _attributes,
        raw: true,
      });

      res.locals.response = {
        body: {
          data: {
            SILVER: { ...consumptionMetricsSilver[0] },
            GOLD: { ...consumptionMetricsGold[0] },
            PLATINUM: { ...consumptionMetricsPlatinum[0] },
          },
        },
        message: templateConstants.LIST_OF('machine transactions'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineHealth(req: Request, res: any, next: NextFunction) {
    try {
      const { machineId } = req.params;
      const { fromDate, toDate }: any = req.query;
      if (!isValidGuid(machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(machineId, userId);
      }
      let whereCondition: any = {
        MachineGuid: req.params.machineId,
      };
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['createdAt'] = {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          };
        }
      }
      const machineHealth = await MachineHealth.findAll({
        where: whereCondition,
        attributes: ['Status', 'Guid'],
        include: [
          {
            model: HealthMatrix,
            where: { isDeleted: false },
            attributes: ['Guid', 'Alarm', 'Weightage', 'Critical', 'PlcTag'],
          },
        ],
      });

      res.locals.response = {
        body: {
          data: machineHealth,
        },
        message: templateConstants.LIST_OF('machine health alarms'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineWashes(req: Request, res: any, next: NextFunction) {
    try {
      const { machineId } = req.params;
      if (!isValidGuid(machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(machineId, userId);
      }
      const { fromDate, toDate }: any = req.query;
      let whereCondition: any = {};
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['AddDate'] = {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          };
        }
      }

      const [silver, gold, platinum] = await Promise.all([
        machineService.getMachineWashesService(
          config.washType.SILVER,
          machineId,
          whereCondition
        ),
        machineService.getMachineWashesService(
          config.washType.GOLD,
          machineId,
          whereCondition
        ),
        machineService.getMachineWashesService(
          config.washType.PLATINUM,
          machineId,
          whereCondition
        ),
      ]);
      const silverData = machineService.washesCount(silver);
      const goldData = machineService.washesCount(gold);
      const platinumData = machineService.washesCount(platinum);
      res.locals.response = {
        body: {
          data: [
            { ...silverData, type: config.washType.SILVER },
            { ...platinumData, type: config.washType.PLATINUM },
            { ...goldData, type: config.washType.GOLD },
          ],
        },
        message: templateConstants.DETAIL('Machine washes'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMachineServiceRequestList(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      const { offset, limit }: any = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const paginate = {
        _limit,
        _offset,
      };
      const serviceRequests = await machineService.getServiceRequestList(
        req,
        res,
        paginate
      );
      res.locals.response = {
        body: {
          data: {
            records: serviceRequests.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              serviceRequests.count
            ),
          },
        },
        message: templateConstants.LIST_OF('machine service request'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportMachineServiceRequestList(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      let result: any = [];
      let csvFields: any = [];
      let i = 1;
      let fileName = 'MachineServiceRequest';
      const paginate = {};
      const services = await machineService.getServiceRequestList(
        req,
        res,
        paginate
      );
      services.rows.map((service) => {
        result.push({
          'Sr.No': i,
          'Service ID': service.serviceId,
          'Request Date': moment(service.createdAt)
            .utcOffset('+05:30')
            .format('MM/DD/YYYY hh:mm A'),
        });
        i += 1;
      });
      csvFields = ['Sr.No', 'Service ID', 'Request Date'];

      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE(
          'machine service request'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async createMachineServiceRequest(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      const machineId = req.params.machineId;

      if (!isValidGuid(machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }

      if (res.user.role !== config.userRolesObject.DEALER) {
        throw createError(400, templateConstants.INVALID('user'));
      }

      const userId = res.user.parentUserId
        ? res.user.parentUserId
        : res.user.userId;
      await machineService.checkMachineAssignment(machineId, userId);

      const serviceId = await machineService.createServiceRequestUniqueId();
      const serviceRequest = await ServiceRequest.create({
        machineId: machineId,
        serviceId: serviceId,
      });
      // notification for admin
      if (serviceRequest) {
        const { type, url } =
          notificationConstant.adminNotificationObject.SERVICE_REQUEST_RECEIVED;
        const notificationBody: any = {
          modelDetail: {
            name: 'ServiceRequest',
            uuid: serviceRequest?.serviceRequestId,
          },
          type: type,
          link: `${url}`,
        };
        await notificationService.generateNotification(
          config.userRolesObject.ADMIN,
          notificationBody
        );
      }

      // notification complete
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY(
          'Machine service request'
        ),
        body: { data: serviceRequest },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // export get machine list
  async exportGetMachineList(req: Request, res: any, next: NextFunction) {
    try {
      const paginate = {};
      const machines = await machineService.getMachineList(req, res, paginate);
      let result: any = [];
      let csvFields: any = [];
      let fileName = 'MachineList';
      let i = 1;
      if (res.user.role === config.userRolesObject.ADMIN) {
        machines.rows.forEach((machine: any) => {
          result.push({
            'Sr.No': i,
            Machines: machine.ShortName,
            Dealership: machine.outlet?.dealer?.username,
            OEM: machine.outlet?.dealer?.oem?.name,
            'Service Centre': machine.outlet?.name,
            Region: machine.outlet?.city?.state?.region?.name,
            State: machine.outlet?.city?.state?.name,
            City: machine.outlet?.city?.name,
            Status: machine.status,
            Washes: machine.dataValues['washesCount'],
            'Machine Wallet (INR)': (
              Number(machine.walletBalance) + Number(machine.topUpBalance)
            ).toFixed(2),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Machines',
          'Dealership',
          'OEM',
          'Service Centre',
          'Region',
          'State',
          'City',
          'Status',
          'Washes',
          'Machine Wallet (INR)',
        ];
      }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('machines'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // export transaction consumption
  async exportMachineTransactionList(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      if (!isValidGuid(req.params.machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(
          req.params.machineId,
          userId
        );
      }

      let { type }: any = req.query;
      const paginate = {};
      const transactions = await machineService.getMachineTransactionList(
        req,
        res,
        paginate
      );
      let i = 1;
      let result: any = [];
      let csvFields: any = [];
      let fileName = 'Consumption';
      // if (res.user.role === config.userRolesObject.ADMIN) {
      if (type == config.machineConsumptionObject.ELECTRICITY_CONSUMPTION) {
        transactions.rows.forEach((transaction: any) => {
          result.push({
            'Sr.No': i,
            SKU: transaction.SkuNumber,
            'Wash type': transaction.washType?.Name,
            'ELectricity used': transaction.ElectricityUsed,
            'Volt R': transaction.Volt_R_N_IOT,
            'Volt Y': transaction.Volt_Y_N_IOT,
            'Volt B': transaction.Volt_B_N_IOT,
            'Rate Per Unit': transaction.ElectricityPrice,
            Cost: (
              Number(transaction.ElectricityPrice) *
              Number(transaction.ElectricityUsed)
            ).toFixed(2),
            'Date & Time': moment(transaction.AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'SKU',
          'Wash type',
          'ELectricity used',
          'Volt R',
          'Volt Y',
          'Volt B',
          'Rate Per Unit',
          'Cost',
          'Date & Time',
        ];
        fileName = config.machineConsumptionObject.ELECTRICITY_CONSUMPTION;
      } else if (type == config.machineConsumptionObject.WATER_CONSUMPTION) {
        transactions.rows.forEach((transaction: any) => {
          result.push({
            'Sr.No': i,
            SKU: transaction.SkuNumber,
            'Wash type': transaction.washType?.Name,
            'Treated Water (L)': transaction.WaterUsed,
            'Fresh Water (L)': transaction.WaterWastage,
            'Recycled Water (L)':
              Number(transaction.WaterUsed) - Number(transaction.WaterWastage),
            'Recycled Percentage': (
              ((Number(transaction.WaterUsed) -
                Number(transaction.WaterWastage)) /
                Number(transaction.WaterUsed)) *
              100
            ).toFixed(2),
            'Date & Time': moment(transaction.AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'SKU',
          'Wash type',
          'Treated Water (L)',
          'Fresh Water (L)',
          'Recycled Water (L)',
          'Recycled Percentage',
          'Date & Time',
        ];
        fileName = config.machineConsumptionObject.WATER_CONSUMPTION;
      } else if (type == config.machineConsumptionObject.CHEMICAL_PERFORMANCE) {
        transactions.rows.forEach((transaction: any) => {
          result.push({
            'Sr.No': i,
            SKU: transaction.SkuNumber,
            'Wash type': transaction.washType?.Name,
            'Shampoo Used (ml)': transaction.ShampooUsed,
            'Shampoo Price INR (per L)': transaction.ShampooPrice,
            'Foam Used (ml)': transaction.FoamUsed,
            'Foam Price INR (per L)': transaction.FoamPrice,
            'Wax Used (ml)': transaction.WaxUsed,
            'Wax Price INR (per L)': transaction.WaxPrice,
            'Date & Time': moment(transaction.AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'SKU',
          'Wash type',
          'Shampoo Used (ml)',
          'Shampoo Price INR (per L)',
          'Foam Used (ml)',
          'Foam Price INR (per L)',
          'Wax Used (ml)',
          'Wax Price INR (per L)',
          'Date & Time',
        ];
        fileName = config.machineConsumptionObject.CHEMICAL_PERFORMANCE;
      } else if (type == config.machineConsumptionObject.WATER_QUALITY) {
        transactions.rows.forEach((transaction: any) => {
          result.push({
            'Sr.No': i,
            SKU: transaction.SkuNumber,
            'Wash type': transaction.washType?.Name,
            Ph: transaction.PHValue,
            Tds: transaction.TDSValue,
            Tss: transaction.TSSValue,
            Cod: transaction.CODValue,
            'Oil & Gress': transaction.OilAndGreaseValue,
            'Date & Time': moment(transaction.AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'SKU',
          'Wash type',
          'Ph',
          'Tds',
          'Tss',
          'Cod',
          'Oil & Gress',
          'Date & Time',
        ];
        fileName = config.machineConsumptionObject.WATER_QUALITY;
      } else if (type == config.machineConsumptionObject.WASHES) {
        transactions.rows.forEach((transaction: any) => {
          result.push({
            'Sr.No': i,
            SKU: transaction.SkuNumber,
            'Base Amount (INR)': transaction.machineWallet?.baseAmount,
            'Cgst (INR) 9%': transaction.machineWallet?.cgst,
            'Sgst (INR) 9%': transaction.machineWallet?.sgst,
            'Price (INR) Incl. GST': transaction.machineWallet?.totalAmount,
            'Date & Time': moment(transaction.AddDate)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'SKU',
          'Base Amount (INR)',
          'Cgst (INR) 9%',
          'Sgst (INR) 9%',
          'Price (INR) Incl. GST',
          'Date & Time',
        ];
        fileName = config.machineConsumptionObject.WASHES;
      }
      // }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('machines'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const machineController = new MachineController();
export { machineController };
