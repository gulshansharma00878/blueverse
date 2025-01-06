import { config } from '../../../config/config';
import { Request } from 'ts-express-decorators';

import { Op } from 'sequelize';
import moment from 'moment';
import { validate as isValidUUID } from 'uuid';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { User } from '../../../models/User/user';
import { OEM } from '../../../models/oem';
class BillingAndAccountingService {
  async getBillingAccountListQueryFormatter(req: Request, res: any) {
    try {
      const {
        fromDate,
        toDate,
        machineIds,
        search,
        statuses,
        type,
        dealerIds,
        month,
        sort,
        cityIds,
        stateIds,
        regionIds,
        oemIds,
        outletIds,
      }: any = req.query;
      const whereCondition: any = {};
      const outletWhereCondition: any = {};
      let _type = type;
      let _dealerIds = dealerIds;
      if (res.user.role === config.userRolesObject.DEALER) {
        if (res.user.parentUserId && res.user.subRoleId) {
          _dealerIds = res.user.parentUserId;
        } else {
          _dealerIds = res.user.userId;
        }
      }
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['createdAt'] = {
            [Op.between]: [
              moment(fromDate).startOf('day').toISOString(),
              moment(toDate).endOf('day').toISOString(),
            ],
          };
        }
      }
      if (month) {
        whereCondition['month'] = month;
      }
      if (machineIds) {
        let arr = [];
        for (const id of machineIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }
        if (arr.length) whereCondition['machineId'] = { [Op.in]: arr };
      }
      if (search) {
        outletWhereCondition['name'] = { [Op.iLike]: `%${search}%` };
      }
      if (statuses) {
        let arr = [];
        for (const status of statuses.split(',')) {
          if (config.machineMemoStatusArr.includes(status)) {
            arr.push(status);
          }
        }
        if (arr.length) whereCondition['status'] = { [Op.in]: arr };
      }
      if (_type) {
        if (config.machineMemoTypeArr.includes(_type)) {
          _type = _type;
        } else {
          _type = config.machineMemoTypeObject.ADVANCE_MEMO;
        }
      } else {
        _type = config.machineMemoTypeObject.ADVANCE_MEMO;
      }
      whereCondition['type'] = _type;

      if (_dealerIds) {
        let arr = [];
        for (const id of _dealerIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }

        if (arr.length) whereCondition['dealerId'] = { [Op.in]: arr };
      }
      let _order: any = [['createdAt', 'DESC']];
      if (sort) {
        _order = [['createdAt', sort]];
      }

      let adminIncludeTables: any = [];
      if (res.user.role === config.userRolesObject.ADMIN) {
        const oemIdArr = [];
        const cityIdArr = [];
        const regionIdArr = [];
        const stateIdsArr = [];
        const oemIdsWhereCondition: any = {};
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

        adminIncludeTables = [
          {
            model: City,
            attributes: ['name'],
            where: cityIdWhereCondition,
            include: [
              {
                model: State,
                attributes: ['name'],
                where: stateIdWhereCondition,
                include: [
                  {
                    model: Region,
                    attributes: ['name'],
                    where: regionIdWhereCondition,
                  },
                ],
              },
            ],
          },
          {
            model: User,
            attributes: ['username'],
            include: [
              {
                model: OEM,
                attributes: ['name'],
                where: oemIdsWhereCondition,
              },
            ],
          },
        ];
      }
      if (outletIds) {
        let arr = [];
        for (const id of outletIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }

        if (arr.length) whereCondition['outletId'] = { [Op.in]: arr };
      }
      return {
        whereCondition,
        _order,
        outletWhereCondition,
        adminIncludeTables,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
const billingAndAccountingService = new BillingAndAccountingService();
export { billingAndAccountingService };
