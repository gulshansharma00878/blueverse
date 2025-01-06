import { Request, ReturnsArray } from 'ts-express-decorators';
import { WashType } from '../../../models/wash_type';
import { Machine } from '../../../models/Machine/Machine';
import { Transactions } from '../../../models/transactions';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import { ServiceRequest } from '../../../models/ServiceRequest';
import { Outlet } from '../../../models/outlet';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { User } from '../../../models/User/user';
import { OEM } from '../../../models/oem';
import { templateConstants } from '../../../common/templateConstants';
import createError from 'http-errors';
import { validate as isValidUUID } from 'uuid';
import { Op } from 'sequelize';
import { config } from '../../../config/config';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import moment from 'moment';
import { MachineHealth } from '../../../models/Machine/MachineHealth';
import { HealthMatrix } from '../../../models/HealthMatrix';
import { OutletMachine } from '../../../models/outlet_machine';
import { notifyLowMachineWalletBalance } from '../../../services/notifications/sendNotification';
import axios from 'axios';
import { Merchant } from '../../../B2C/models/merchant';

class MachineService {
  async store(data: any): Promise<any> {
    const result = await Machine.create({ ...data });
    return result;
  }

  /**
   * Get list of machine
   *
   *
   * @returns {*}
   */
  async index(filters: any) {
    try {
      return await Machine.findAll({
        where: filters,
        order: [['createdAt', 'DESC']],
        include: [
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
    } catch (e) {
      console.log(e);
    }
  }

  async getMachineWashesService(
    washType: string,
    machineId: string,
    whereCondition: any
  ) {
    try {
      const washes = await Transactions.findAll({
        where: { MachineGuid: machineId, ...whereCondition },
        attributes: ['WashTime'],
        include: [
          {
            model: WashType,
            where: { Name: washType },
            attributes: [],
          },
          {
            model: MachineWallet,
            attributes: ['cgst', 'sgst', 'baseAmount', 'totalAmount'],
          },
        ],
      });
      return washes;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  washesCount(washes: any) {
    const data = {
      count: washes.length,
      totalcgst: 0,
      totalsgst: 0,
      totalWashTime: 0,
      totalBaseAmount: 0,
      avgWashTime: 0,
    };
    const avgTime = [];
    washes.forEach((el: any) => {
      data.totalcgst += el.dataValues.machineWallet
        ? Number(el.dataValues.machineWallet.dataValues.cgst)
        : 0;
      data.totalsgst += el.dataValues.machineWallet
        ? Number(el.dataValues.machineWallet.dataValues.sgst)
        : 0;
      data.totalWashTime += Number(el.dataValues.WashTime);
      data.totalBaseAmount += el.dataValues.machineWallet
        ? Number(el.dataValues.machineWallet.dataValues.baseAmount)
        : 0;
      avgTime.push(Number(el.dataValues.WashTime));
    });
    data.avgWashTime = data.totalWashTime / avgTime.length;
    return data;
  }

  async createServiceRequestUniqueId() {
    try {
      const serviceRequest = await ServiceRequest.count();
      let returnValue = '';
      if (serviceRequest > 0) {
        returnValue = `SRV000${serviceRequest + 1}`;
      } else {
        returnValue = 'SRV0001';
      }
      return returnValue;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async checkMachineAssignment(machineId: string, dealerId: string) {
    try {
      const machine = await Machine.findOne({
        where: { machineGuid: machineId, isAssigned: true },
        attributes: [],
        include: [
          {
            model: Outlet,
            where: { dealerId: dealerId },
            attributes: ['dealerId'],
          },
        ],
      });
      if (!machine) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Machine list controller code
  async getMachineList(req: any, res: any, paginate?: any) {
    try {
      const condition: any = this.getMachineListCondition(req, res, paginate);

      const machines: any = await Machine.findAndCountAll(condition);
      for (const machine of machines.rows) {
        machine.dataValues['washesCount'] = await Transactions.count({
          where: { MachineGuid: machine.dataValues.machineGuid },
          include: [
            {
              model: WashType,
              attributes: ['Name'],
              where: { Name: { [Op.in]: config.washTypeArr } },
            },
          ],
        });
      }
      return machines;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // Machine Transaction code
  async getMachineTransactionList(req: any, res: any, paginate?: any) {
    try {
      let { fromDate, toDate, sort, washTypeIds }: any = req.query;
      const { _limit, _offset } = paginate;
      let order = 'DESC';

      const whereCondition: any = {
        MachineGuid: req.params.machineId,
      };
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['AddDate'] = {
            [Op.gte]: moment(fromDate).startOf('day').toISOString(),
            [Op.lte]: moment(toDate).endOf('day').toISOString(),
          };
        }
      }
      // Wash type where condition
      const washtTypeIdArr = [];
      if (washTypeIds) {
        for (const washTypeId of washTypeIds.split(',')) {
          if (isValidUUID(washTypeId)) {
            washtTypeIdArr.push(washTypeId);
          }
        }
        if (washtTypeIdArr.length) {
          whereCondition['WashTypeGuid'] = { [Op.in]: washtTypeIdArr };
        }
      }
      if (['DESC', 'ASC'].includes(sort)) {
        order = sort;
      }
      let condition: any = {
        where: whereCondition,
        order: [['AddDate', order]],
        include: [
          { model: WashType, attributes: ['Name'] },
          {
            model: MachineWallet,
            attributes: [
              'machineWalletId',
              'cgst',
              'sgst',
              'baseAmount',
              'totalAmount',
            ],
          },
        ],
      };
      if (!!_limit || _limit >= 0) {
        condition['limit'] = _limit;
      }
      if (!!_offset || _offset >= 0) {
        condition['offset'] = _offset;
      }
      const transactions: any = await Transactions.findAndCountAll(condition);
      return transactions;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Service request list
  async getServiceRequestList(req: any, res: any, paginate: any) {
    try {
      const { fromDate, toDate, offset, limit, sort }: any = req.query;
      const machineId = req.params.machineId;
      const whereCondition: any = { machineId: machineId };
      if (!isValidGuid(machineId)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }

      if (res.user.type === config.userRolesObject.DEALER) {
        const userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
        await machineService.checkMachineAssignment(machineId, userId);
      }

      const { _limit, _offset } = paginate;
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['createdAt'] = {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          };
        }
      }
      let order: any = 'DESC';
      if (['DESC', 'ASC'].includes(sort)) {
        order = sort;
      }
      let condition: any = {
        where: whereCondition,
        order: [['createdAt', order]],
      };
      if (!!_limit || _limit >= 0) {
        condition['limit'] = _limit;
      }
      if (!!_offset || _offset >= 0) {
        condition['offset'] = _offset;
      }
      const serviceRequests = await ServiceRequest.findAndCountAll(condition);
      return serviceRequests;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // machine health
  async getMachineHealth(machineHealthId: string) {
    try {
      return await MachineHealth.findOne({
        where: {
          Guid: machineHealthId,
        },
        include: [
          {
            model: Machine,
            attributes: ['machineGuid', 'name', 'ShortName'],
            include: [
              {
                model: Outlet,
                include: [
                  {
                    model: User,
                    attributes: ['userId', 'username'],
                  },
                ],
              },
            ],
          },
          {
            model: HealthMatrix,
            attributes: [
              'Alarm',
              'Weightage',
              'Critical',
              'Escalate',
              'IsValid',
              'isDeleted',
            ],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // machine dealer details
  async getMachineDealerDetails(machinId: string) {
    try {
      return await Machine.findOne({
        attributes: [
          'name',
          'machineGuid',
          'ShortName',
          'status',
          'walletBalance',
          'blueverseCredit',
          'topUpBalance',
        ],
        where: {
          machineGuid: machinId,
        },
        include: [
          {
            model: Outlet,
            attributes: ['name'],
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
              },
            ],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getMachineListCondition(req: any, res: any, paginate?: any) {
    const {
      outletIds,
      dealerIds,
      cityIds,
      regionIds,
      oemIds,
      stateIds,
      machineIds,
      search,
      status,
    }: any = req.query;
    const { _limit, _offset } = paginate;
    const oemIdArr = [];
    const dealerIdArr = [];
    const outletIdArr = [];
    const cityIdArr = [];
    const regionIdArr = [];
    const stateIdsArr = [];
    const machineIdsArr = [];
    const whereCondition: any = {};
    const oemIdsWhereCondition: any = {};
    const dealerIdWhereCondition: any = {};
    const outletIdWhereCOndition: any = {};
    const cityIdWhereCondition: any = {};
    const stateIdWhereCondition: any = {};
    const regionIdWhereCondition: any = {};
    if (oemIds) {
      for (const oemId of oemIds.split(',')) {
        if (isValidUUID(oemId)) {
          oemIdArr.push(oemId);
        }
      }
      if (oemIdArr.length) {
        oemIdsWhereCondition['oemId'] = { [Op.in]: oemIdArr };
      }
    }
    if (outletIds) {
      for (const outletId of outletIds.split(',')) {
        if (isValidUUID(outletId)) {
          outletIdArr.push(outletId);
        }
      }

      if (outletIdArr.length) {
        outletIdWhereCOndition['outletId'] = { [Op.in]: outletIdArr };
      }
    }
    if (stateIds) {
      for (const stateId of stateIds.split(',')) {
        if (isValidUUID(stateId)) {
          stateIdsArr.push(stateId);
        }
      }
      if (stateIdsArr.length) {
        stateIdWhereCondition['stateId'] = { [Op.in]: stateIdsArr };
      }
    }
    if (cityIds) {
      for (const cityId of cityIds.split(',')) {
        if (isValidUUID(cityId)) {
          cityIdArr.push(cityId);
        }
      }

      if (cityIdArr.length) {
        cityIdWhereCondition['cityId'] = { [Op.in]: cityIdArr };
      }
    }

    if (regionIds) {
      for (const regionId of regionIds.split(',')) {
        if (isValidUUID(regionId)) {
          regionIdArr.push(regionId);
        }
      }
      if (regionIdArr.length) {
        regionIdWhereCondition['regionId'] = { [Op.in]: regionIdArr };
      }
    }
    if (res.user.role === config.userRolesObject.DEALER) {
      const userId = res.user.parentUserId
        ? res.user.parentUserId
        : res.user.userId;
      dealerIdArr.push(userId);
      if (dealerIdArr.length) {
        dealerIdWhereCondition['userId'] = { [Op.in]: dealerIdArr };
      }
    }
    if (dealerIds) {
      for (const dealerId of dealerIds.split(',')) {
        if (isValidUUID(dealerId)) {
          dealerIdArr.push(dealerId);
        }
      }

      if (dealerIdArr.length) {
        dealerIdWhereCondition['userId'] = { [Op.in]: dealerIdArr };
      }
    }
    if (machineIds) {
      for (const machineId of machineIds.split(',')) {
        if (isValidUUID(machineId)) {
          machineIdsArr.push(machineId);
        }
      }
      if (machineIdsArr.length) {
        whereCondition['machineGuid'] = { [Op.in]: machineIdsArr };
      }
    }
    if (status) whereCondition['status'] = status;
    if (search) whereCondition['name'] = { [Op.iLike]: `%${search}%` };
    const includeCondition: any = [
      {
        model: Outlet,
        attributes: ['outletId', 'name'],
        where: outletIdWhereCOndition,
        required: false,
        include: [
          {
            model: City,
            attributes: ['cityId', 'name'],
            where: cityIdWhereCondition,
            include: [
              {
                model: State,
                attributes: ['stateId', 'name'],
                where: stateIdWhereCondition,
                include: [
                  {
                    model: Region,
                    attributes: ['name', 'regionId'],
                    where: regionIdWhereCondition,
                  },
                ],
              },
            ],
          },
          {
            model: User,
            attributes: ['username', 'userId', 'phone', 'email'],
            where: dealerIdWhereCondition,
            include: [
              {
                model: OEM,
                where: oemIdsWhereCondition,
                attributes: ['oemId', 'name'],
              },
            ],
          },
        ],
      },
      {
        model: OutletMachine,
      },
      {
        model: Merchant,
        attributes: ['merchantId', 'outletName'],
        required: false,
        include: [
          {
            model: City,
            attributes: ['cityId', 'name'],
            where: cityIdWhereCondition,
            include: [
              {
                model: State,
                attributes: ['stateId', 'name'],
                where: stateIdWhereCondition,
                include: [
                  {
                    model: Region,
                    attributes: ['name', 'regionId'],
                    where: regionIdWhereCondition,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    let condition: any = {
      where: whereCondition,
      include: includeCondition,
      attributes: [
        'machineGuid',
        'name',
        'ShortName',
        'status',
        'isAssigned',
        'status',
        'walletBalance',
        'blueverseCredit',
        'topUpBalance',
        'IsDeleted',
        'AddDate',
      ],
      order: [['createdAt', 'DESC']],
    };
    if (!!_limit || _limit >= 0) {
      condition['limit'] = _limit;
    }
    if (!!_offset || _offset >= 0) {
      condition['offset'] = _offset;
    }
    return condition;
  }
  //  to deactivate dealer all machines
  async updateDealerMachinesStatus(dealerId: string, status: string) {
    try {
      let altStatus = '';
      if (status == config.machineStatusObject.ACTIVE) {
        altStatus = config.machineStatusObject.INACTIVE;
      } else {
        altStatus = config.machineStatusObject.ACTIVE;
      }
      const machines = await Machine.findAll({
        where: {
          status: altStatus,
        },
        include: [
          {
            model: Outlet,
            required: true,
            attributes: ['name'],
            include: [
              {
                model: User,
                required: true,
                attributes: ['userId', 'username'],
                where: {
                  userId: dealerId,
                },
              },
            ],
          },
        ],
      });
      const machinIdArr: any = [];
      if (machines && machines.length > 0) {
        machines.forEach((machine: any) => {
          machinIdArr.push(machine.machineGuid);
        });
      }
      if (machinIdArr.length > 0) {
        await Machine.update(
          {
            status: status,
          },
          { where: { machineGuid: { [Op.in]: machinIdArr } } }
        );
      }

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async isMachineAssigned(machineId: string) {
    try {
      const isAssigned = await OutletMachine.findOne({
        where: {
          machineId: machineId,
          outletId: { [Op.ne]: null },
        },
      });
      if (isAssigned) {
        return true;
      }
      return false;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // machine health
  async getMachineHealthFromMachineAndAlarmId(
    machineId: string,
    alarmId: string
  ) {
    try {
      return await MachineHealth.findOne({
        where: {
          MachineGuid: machineId,
          AlarmGuid: alarmId,
        },
        include: [
          {
            model: Machine,
            attributes: ['machineGuid', 'name', 'ShortName'],
            include: [
              {
                model: Outlet,
                include: [
                  {
                    model: User,
                    attributes: ['userId', 'username'],
                  },
                ],
              },
            ],
          },
          {
            model: HealthMatrix,
            attributes: [
              'Alarm',
              'Weightage',
              'Critical',
              'Escalate',
              'IsValid',
              'isDeleted',
            ],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async generateLowBalanceMachineNotifications(machineId?: string) {
    try {
      const whereCondition: any = {
        isAssigned: true,
        walletBalance: {
          [Op.lt]: config.machineMinimumBalanceLimit,
        },
      };
      let machineIdArr = config.machinesIdArr;
      if (!isNullOrUndefined(machineId)) {
        machineIdArr = [machineId];
      }
      if (
        config.serverConfig.env == 'development' ||
        config.serverConfig.env == 'qa'
      ) {
        whereCondition['machineGuid'] = {
          [Op.in]: machineIdArr,
        };
      }
      const machines = await Machine.findAll({
        where: whereCondition,
        include: [
          {
            model: Outlet,
            attributes: ['name'],
            include: [
              {
                model: User,
                attributes: ['userId', 'username'],
              },
            ],
          },
        ],
      });
      machines.forEach((machine) => {
        // Generate notifications only for those machines that are assigned to dealers.
        if (!isNullOrUndefined(machine.dataValues?.outlet?.dealer?.userId)) {
          // Function to send notification to dealer and admin
          notifyLowMachineWalletBalance(machine);
        }
      });
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateMachinesMerchant(
    machineIds: string[],
    merchantId: string,
    transaction: any
  ) {
    try {
      return Machine.update(
        {
          merchantId: merchantId,
        },
        {
          where: {
            machineGuid: {
              [Op.in]: machineIds,
            },
          },
          transaction,
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async machineAssignedToAnotherMerchant(
    machineId: string,
    merchantId: string
  ) {
    try {
      return await Machine.findOne({
        where: {
          merchantId: {
            [Op.notIn]: [null, merchantId],
          },
          outletId: null,
          machineGuid: machineId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async validWashType(washTypeId: string) {
    try {
      return await WashType.findOne({
        attributes: ['Guid', 'Name'],
        where: {
          Guid: washTypeId,
          Name: { [Op.in]: config.washTypeArr },
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async handleMerchantMachines(machineIds: string[], merchantId: string) {
    try {
      await Machine.update(
        {
          merchantId: null,
        },
        {
          where: {
            merchantId: merchantId,
          },
        }
      );

      await Machine.update(
        {
          merchantId: merchantId,
        },
        {
          where: {
            machineGuid: {
              [Op.in]: machineIds,
            },
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async inactiveMachineOnLowBalance(machineId?: string) {
    try {
      // Fetch machine data with wallet balance for the specified machine GUID if it is assigned
      const machineData = await Machine.findOne({
        where: {
          machineGuid: machineId,
          isAssigned: true,
        },
        attributes: ['walletBalance'],
      });

      // Check if the wallet balance is below the threshold (-5000)
      if (Number(machineData?.walletBalance) < -5000) {
        // Set the machine status to 'INACTIVE' if the wallet balance is less than -5000
        await Machine.update(
          {
            status: 'INACTIVE',
          },
          {
            where: {
              machineGuid: machineId,
            },
          }
        );

        // Make a POST request to the machine status API to power off the machine
        await axios.post('https://plc.blueverse.info/api/machinestatus', {
          machine_id: machineId, // The machine GUID for the status update
          status: false, // Set to false to power off the machine
        });
      }

      return;
    } catch (err) {
      // Return a rejected promise if an error occurs
      return Promise.reject(err);
    }
  }
}

const machineService = new MachineService();
export { machineService };
