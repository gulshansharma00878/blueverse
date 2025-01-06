import { Op } from 'sequelize';
import { ServiceRequest } from '../../../models/ServiceRequest';
import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { OEM } from '../../../models/oem';
import { config } from '../../../config/config';
import { AreaManagerOEM } from '../../../models/User/AreaManagerOEM';
import { UserArea } from '../../../models/User/UserArea';
import { User } from '../../../models/User/user';
import { OEMManagerDealers } from '../../../models/User/OEMManagerDealers';
import { Machine } from '../../../models/Machine/Machine';
import { Outlet } from '../../../models/outlet';
import { include } from 'underscore';
import { validate as isValidUUID } from 'uuid';
import { isValidGuid } from '../../../common/utility';
import { Merchant } from '../../../B2C/models/merchant';
class ServiceRequestService {
  async getServiceRequestList(req: any, res: any, user: any, paginate: any) {
    try {
      const { _limit, _offset } = paginate;
      const { userId, role } = user;
      const { outletIds, machineIds, sort } = req.query;
      const machineIdsArr = [];
      const outletIdArr = [];

      let whereCondition: any = {};
      if (role === config.userRolesObject.DEALER) {
        whereCondition['$machine.outlet.dealer.user_id$'] = userId;
      }
      if (machineIds) {
        for (const machineId of machineIds.split(',')) {
          if (isValidUUID(machineId)) {
            machineIdsArr.push(machineId);
          }
        }
        if (machineIdsArr.length) {
          whereCondition['$machine.MachineGuid$'] = { [Op.in]: machineIdsArr };
        }
      }
      if (outletIds) {
        for (const outletId of outletIds.split(',')) {
          if (isValidUUID(outletId)) {
            outletIdArr.push(outletId);
          }
        }
        if (outletIdArr.length) {
          whereCondition['$machine.outlet.outlet_id$'] = {
            [Op.in]: outletIdArr,
          };
        }
      }
      let order: any = 'DESC';
      if (['DESC', 'ASC'].includes(sort)) {
        order = sort;
      }
      const includeCondition = [
        {
          model: Machine,
          attributes: ['name', 'ShortName'],
          include: [
            {
              model: Outlet,
              attributes: ['outletId', 'name', 'address'],
              required: false,
              include: [
                {
                  model: User,
                  attributes: ['uniqueId', 'username'],
                  include: [
                    {
                      model: OEM,
                      attributes: ['name'],
                    },
                  ],
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
              model: Merchant,
              attributes: ['merchantId', 'outletName'],
              required: false,
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
      ];
      let orderCondition = [['createdAt', order]];
      let condition: any = {
        where: whereCondition,
        include: includeCondition,
        order: orderCondition,
      };
      if (!!_limit || _limit >= 0) {
        condition['limit'] = _limit;
      }
      if (!!_offset || _offset >= 0) {
        condition['offset'] = _offset;
      }
      const result = await ServiceRequest.findAndCountAll(condition);
      return result;
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getServiceRequestDetails(serviceId: string) {
    try {
      return await ServiceRequest.findOne({
        attributes: ['serviceId', 'serviceRequestId'],
        where: { serviceRequestId: serviceId },
        include: [
          {
            model: Machine,
            attributes: ['name', 'ShortName'],
            include: [
              {
                model: Outlet,
                attributes: ['name', 'address'],
              },
            ],
          },
        ],
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
}

const serviceRequestService = new ServiceRequestService();
export { serviceRequestService };
