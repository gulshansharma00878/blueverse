import createError from 'http-errors';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { templateConstants } from '../../../common/templateConstants';
import { paginatorParamFormat } from '../../../services/commonService';
import { Machine } from '../../../models/Machine/Machine';
import { WasteType } from '../../../models/HazardousWaste/hazardousWasteCollection';
import { Op } from 'sequelize';
import { config } from './../../../config/config';
import { washService } from '../../washModule/services/wash.service';
import moment from 'moment';
import { dataFromRequest } from '../../../helpers/basic_helper';

class HazardousWastePolicy {
  // function to validate filter values for cleaning and disposal
  async validateCollictionAndDisposalListParams(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      const {
        oemIds,
        regionIds,
        stateIds,
        cityIds,
        dealerIds,
        outletIds,
        machineIds,
        cleaningDate,
        disposalDate,
        limit,
        offset,
        search,
        startDate,
        endDate,
        sortBy,
        orderBy,
      } = req.query;
      const oemIdArr: string[] = [];
      const regionIdArr: string[] = [];
      const stateIdArr: string[] = [];
      const cityIdArr: string[] = [];
      const dealerIdArr: string[] = [];
      const outletIdArr: string[] = [];
      const machineIdArr: string[] = [];
      let showRecords: boolean = true; //key to tell controller to show records or not
      if (!isNullOrUndefined(oemIds)) {
        const _oemIds = oemIds.split(',');
        for (const oemId of _oemIds) {
          if (isValidGuid(oemId)) {
            oemIdArr.push(oemId);
          }
        }
      }
      if (!isNullOrUndefined(regionIds)) {
        const _regionIds = regionIds.split(',');
        for (const regionId of _regionIds) {
          if (isValidGuid(regionId)) {
            regionIdArr.push(regionId);
          }
        }
      }
      if (!isNullOrUndefined(stateIds)) {
        const _stateIds = stateIds.split(',');
        for (const stateId of _stateIds) {
          if (isValidGuid(stateId)) {
            stateIdArr.push(stateId);
          }
        }
      }
      if (!isNullOrUndefined(cityIds)) {
        const _cityIds = cityIds.split(',');
        for (const cityId of _cityIds) {
          if (isValidGuid(cityId)) {
            cityIdArr.push(cityId);
          }
        }
      }
      if (!isNullOrUndefined(dealerIds)) {
        const _dealerIds = dealerIds.split(',');
        for (const dealerId of _dealerIds) {
          if (isValidGuid(dealerId)) {
            dealerIdArr.push(dealerId);
          }
        }
      }

      if (!isNullOrUndefined(outletIds)) {
        const _outletIds = outletIds.split(',');
        for (const outletId of _outletIds) {
          if (isValidGuid(outletId)) {
            outletIdArr.push(outletId);
          }
        }
      }
      if (!isNullOrUndefined(machineIds)) {
        const _machineIds = machineIds.split(',');
        for (const machineId of _machineIds) {
          if (isValidGuid(machineId)) {
            machineIdArr.push(machineId);
          }
        }
      }
      // upddate dealerId for dealer
      if (user.role == config.userRolesObject.DEALER) {
        dealerIdArr.push(user.userId);
      } else if (
        user.role == config.userRolesObject.AREA_MANAGER ||
        user.role == config.userRolesObject.OEM
      ) {
        const managerFilters = await washService.getFiltersForManager(
          user.userId
        );
        if (regionIdArr.length == 0) {
          regionIdArr.push(...managerFilters['regionIds']);
        }
        if (stateIdArr.length == 0) {
          stateIdArr.push(...managerFilters['stateIds']);
        }
        if (cityIdArr.length == 0) {
          cityIdArr.push(...managerFilters['cityIds']);
        }
        if (user.role == config.userRolesObject.OEM) {
          // if oem has no dealer then don't show data
          if (managerFilters['oemDealerIds'].length == 0) {
            showRecords = false;
          } else {
            dealerIdArr.push(...managerFilters['oemDealerIds']);
          }
        } else if (user.role == config.userRolesObject.AREA_MANAGER) {
          // if area manager has no dealer then don't show data
          if (managerFilters['areaManagerDealerIds'].length == 0) {
            showRecords = false;
          } else {
            dealerIdArr.push(...managerFilters['areaManagerDealerIds']);
          }
        }
      }

      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const queryBody = {
        oemIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        dealerIdArr,
        outletIdArr,
        machineIdArr,
        cleaningDate,
        disposalDate,
        limit: _limit,
        offset: _offset,
        search: search ? search.trim() : null,
        showRecords,
        startDate,
        endDate,
        sortBy,
        orderBy:
          orderBy &&
          (orderBy.toLowerCase() === 'asc' || orderBy.toLowerCase() === 'desc')
            ? orderBy.toLowerCase()
            : 'desc',
      };
      res.locals.request = {
        queryBody: queryBody,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  // Function to validate input request body for waste collection input
  async validateNewWasteCollection(req: any, res: any, next: any) {
    try {
      const {
        machineId,
        wasteType,
        cleaningDate,
        wasteBagDetail,
        washCount,
        wasteCollectionId,
      } = dataFromRequest(req);
      const machine = await Machine.findOne({
        where: {
          machineGuid: machineId,
          IsDeleted: {
            [Op.or]: [false, null],
          },
        },
      });
      if (isNullOrUndefined(machine)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (wasteType != WasteType.SLUDGE) {
        throw createError(400, templateConstants.INVALID('wasteType'));
      }
      let totalWasteBagWeight = 0;
      wasteBagDetail.forEach((wasteBag: any) => {
        totalWasteBagWeight += Number(wasteBag.weight || 0);
      });
      const newWasteCollection: any = {
        machineId,
        wasteType,
        cleaningDate,
        wasteBagDetail,
        totalWasteBagWeight: totalWasteBagWeight,
        washCount,
      };
      if (!isNullOrUndefined(wasteCollectionId)) {
        newWasteCollection['wasteCollectionId'] = wasteCollectionId;
      }
      res.locals.request = {
        newWasteCollection: newWasteCollection,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdateWasteCollection(req: any, res: any, next: any) {
    try {
      const {
        wasteBagDetail,

        wasteCollectionId,
      } = dataFromRequest(req);

      let totalWasteBagWeight = 0;
      wasteBagDetail.forEach((wasteBag: any) => {
        totalWasteBagWeight += Number(wasteBag.weight || 0);
      });
      const newWasteCollection: any = {
        wasteBagDetail,
        totalWasteBagWeight: totalWasteBagWeight,
        wasteCollectionId,
      };

      res.locals.request = {
        newWasteCollection: newWasteCollection,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  // FUnction to validate input request body for waste disposal
  async validateNewWasteDisposal(req: any, res: any, next: any) {
    try {
      const {
        machineId,
        wasteType,
        desposingDate,
        totalWasteBagWeight,
        formUrl,
        collected_waste_weight, //net collected waste weight before disposed
        remaining_collected_waste_weight, //collected waste weight after disposed
      } = req.body;
      const machine = await Machine.findOne({
        where: {
          machineGuid: machineId,
          IsDeleted: {
            [Op.or]: [false, null],
          },
        },
      });
      if (isNullOrUndefined(machine)) {
        throw createError(400, templateConstants.INVALID('machineId'));
      }
      if (wasteType != WasteType.SLUDGE) {
        throw createError(400, templateConstants.INVALID('wasteType'));
      }
      if (totalWasteBagWeight > collected_waste_weight) {
        throw createError(
          400,
          'Disposal waste bage weight should be less than collected waste'
        );
      }
      const newWasteDisposal = {
        machineId,
        wasteType,
        desposingDate,
        totalWasteBagWeight: totalWasteBagWeight,
        formUrl,
        collected_waste_weight,
        remaining_collected_waste_weight,
      };
      res.locals.request = {
        newWasteDisposal: newWasteDisposal,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // FUnction to validate input request body for waste disposal
  async validateUpdateWasteDisposal(req: any, res: any, next: any) {
    try {
      const { totalWasteBagWeight, formUrl, wasteDisposalId,remaining_collected_waste_weight } =
        dataFromRequest(req);
      const newWasteDisposal = {
        totalWasteBagWeight: totalWasteBagWeight,
        formUrl,
        wasteDisposalId,
        remaining_collected_waste_weight:remaining_collected_waste_weight
      };
      res.locals.request = {
        newWasteDisposal: newWasteDisposal,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // FUnction to validate input request body for waste graph
  async validateWasteCollectionDisposalGraphInput(
    req: any,
    res: any,
    next: any
  ) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };

      const { dealerIds, machineIds, startDate, endDate, oemIds } = req.query;
      const regionIdArr: string[] = [];
      const stateIdArr: string[] = [];
      const cityIdArr: string[] = [];
      const oemIdArr: string[] = [];
      let dealerIdArr: string[] = [];
      const machineIdArr: string[] = [];
      let showRecords: boolean = true; //key to tell controller to show records or not
      if (!isNullOrUndefined(dealerIds)) {
        const _dealersIds = dealerIds.split(',');
        for (const dealerId of _dealersIds) {
          if (isValidGuid(dealerId)) {
            dealerIdArr.push(dealerId);
          }
        }
      }
      if (!isNullOrUndefined(machineIds)) {
        const _machineIds = machineIds.split(',');
        for (const machineId of _machineIds) {
          if (isValidGuid(machineId)) {
            machineIdArr.push(machineId);
          }
        }
      }
      if (!isNullOrUndefined(oemIds)) {
        const _oemIds = oemIds.split(',');
        for (const oemId of _oemIds) {
          if (isValidGuid(oemId)) {
            oemIdArr.push(oemId);
          }
        }
      }
      // upddate dealerId for dealer
      if (user.role == config.userRolesObject.DEALER) {
        dealerIdArr = [];
        dealerIdArr.push(user.userId);
      } else if (
        user.role == config.userRolesObject.AREA_MANAGER ||
        user.role == config.userRolesObject.OEM
      ) {
        const managerFilters = await washService.getFiltersForManager(
          user.userId
        );
        if (regionIdArr.length == 0) {
          regionIdArr.push(...managerFilters['regionIds']);
        }
        if (stateIdArr.length == 0) {
          stateIdArr.push(...managerFilters['stateIds']);
        }
        if (cityIdArr.length == 0) {
          cityIdArr.push(...managerFilters['cityIds']);
        }
        if (user.role == config.userRolesObject.OEM) {
          // if oem has no dealer then don't show data
          if (managerFilters['oemDealerIds'].length == 0) {
            showRecords = false;
          } else {
            dealerIdArr.push(...managerFilters['oemDealerIds']);
          }
        } else if (user.role == config.userRolesObject.AREA_MANAGER) {
          // if area manager has no dealer then don't show data
          if (managerFilters['areaManagerDealerIds'].length == 0) {
            showRecords = false;
          } else {
            dealerIdArr.push(...managerFilters['areaManagerDealerIds']);
          }
        }
      }
      const currentYear = moment().year();
      // if start date is not given then take current year start date
      const newStartDate = !isNullOrUndefined(startDate)
        ? moment(startDate).startOf('day').toISOString()
        : moment(`${currentYear}-01-01`).startOf('year').toISOString();
      // if end date is not given then take current year end date
      const newEndDate = !isNullOrUndefined(endDate)
        ? moment(endDate).endOf('day').toISOString()
        : moment(`${currentYear}-12-31`).endOf('year').toISOString();
      const queryBody = {
        cleaningStartDate: newStartDate,
        cleaningEndDate: newEndDate,
        disposingStartDate: newStartDate,
        disposingEndDate: newEndDate,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        dealerIdArr,
        machineIdArr,
        showRecords,
        oemIdArr,
      };
      res.locals.request = {
        queryBody: queryBody,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const hazardousWastePolicy = new HazardousWastePolicy();
export { hazardousWastePolicy };
