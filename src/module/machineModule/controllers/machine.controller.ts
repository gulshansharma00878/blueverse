import { machineService } from '../services/machine.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { NextFunction, Request } from 'express';
import { isAdmin, paginatorService } from '../../../services/commonService';
import { Machine } from '../../../models/Machine/Machine';
import { templateConstants } from '../../../common/templateConstants';
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
      let results;
      const { role } = res.user;
      const outletIds = req.query.outletIds;
      const userId = res.user.parentUserId
        ? res.user.parentUserId
        : res.user.userId;
      if (role === config.userRolesObject.DEALER) {
        const filters = dataFromRequest(req, 'filters');
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
          ],
        });
      } else {
        results = await machineService.index(dataFromRequest(req, 'filters'));
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
      const {
        outletIds,
        dealerIds,
        cityIds,
        regionIds,
        oemIds,
        stateIds,
        search,
        status,
        offset,
        limit,
      }: any = req.query;

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
      const oemIdArr = [];
      const dealerIdArr = [];
      const outletIdArr = [];
      const cityIdArr = [];
      const regionIdArr = [];
      const stateIdsArr = [];
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
      if (status) whereCondition['status'] = status;
      if (search) whereCondition['name'] = { [Op.iLike]: `%${search}%` };
      const machines = await Machine.findAndCountAll({
        attributes: [
          'machineGuid',
          'name',
          'ShortName',
          'status',
          'isAssigned',
        ],
        where: whereCondition,
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'name'],
            where: outletIdWhereCOndition,
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
        ],
        order: [['createdAt', 'DESC']],
        limit: _limit,
        offset: _offset,
      });

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
}

const machineController = new MachineController();
export { machineController };
