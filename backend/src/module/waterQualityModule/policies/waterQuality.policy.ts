import createError from 'http-errors';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { templateConstants } from '../../../common/templateConstants';
import { paginatorParamFormat } from '../../../services/commonService';
import { Machine } from '../../../models/Machine/Machine';
import { WasteType } from '../../../models/waterQualityReport';
import { Op } from 'sequelize';
import moment from 'moment';
import { config } from '../../../config/config';
import { washService } from '../../washModule/services/wash.service';
import { dataFromRequest } from '../../../helpers/basic_helper';

class WaterQualityPolicy {
  async validateNewWaterQuality(req: any, res: any, next: any) {
    try {
      const {
        machineId,
        wasteType,
        samplingDate,
        reportDate,
        tdsValue,
        tssValue,
        codValue,
        bodValue,
        phValue,
        oilGreaseValue,
        labReportUrl,
        washCountBetweenReports,
        cummulativeWashCount,
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
      if (
        wasteType != WasteType.SLUDGE &&
        wasteType != WasteType.TREATED_TANK &&
        wasteType != WasteType.COLLECTED_TANK
      ) {
        throw createError(400, templateConstants.INVALID('wasteType'));
      }

      // Format both reportDate and samplingDate to 'YYYY-MM-DD' to compare only the date part, ignoring the time
      if (
        moment(reportDate).format('YYYY-MM-DD') <
        moment(samplingDate).format('YYYY-MM-DD')
      ) {
        // If the formatted reportDate is less than the formatted samplingDate, throw a 400 error
        throw createError(
          400,
          'Report date should be greater than or equal to the sampling date'
        );
      }
      const newWaterQualityData = {
        machineId,
        wasteType,
        samplingDate,
        reportDate,
        tdsValue,
        tssValue,
        codValue,
        bodValue,
        phValue,
        oilGreaseValue,
        labReportUrl,
        washCountBetweenReports,
        cummulativeWashCount,
      };
      res.locals.request = {
        newWaterQualityData: newWaterQualityData,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdateWaterQuality(req: any, res: any, next: any) {
    try {
      const {
        wasteType,
        waterQualityId,
        tdsValue,
        tssValue,
        codValue,
        bodValue,
        phValue,
        oilGreaseValue,
        labReportUrl,
      } = dataFromRequest(req);

      if (
        wasteType != WasteType.SLUDGE &&
        wasteType != WasteType.TREATED_TANK &&
        wasteType != WasteType.COLLECTED_TANK
      ) {
        throw createError(400, templateConstants.INVALID('wasteType'));
      }

      const newWaterQualityData = {
        wasteType,
        waterQualityId,
        tdsValue,
        tssValue,
        codValue,
        bodValue,
        phValue,
        oilGreaseValue,
        labReportUrl,
      };
      res.locals.request = {
        newWaterQualityData: newWaterQualityData,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // async validateWaterQualityId(req: any, res: any, next: any) {
  //   try {
  //     const { waterQualityId } = dataFromRequest(req);
  //     const machine = await Machine.findOne({
  //       where: {
  //         machineGuid: machineId,
  //         IsDeleted: {
  //           [Op.or]: [false, null],
  //         },
  //       },
  //     });
  //     if (isNullOrUndefined(machine)) {
  //       throw createError(400, templateConstants.INVALID('machineId'));
  //     }
  //     if (
  //       wasteType != WasteType.SLUDGE &&
  //       wasteType != WasteType.TREATED_TANK &&
  //       wasteType != WasteType.COLLECTED_TANK
  //     ) {
  //       throw createError(400, templateConstants.INVALID('wasteType'));
  //     }

  //     // Format both reportDate and samplingDate to 'YYYY-MM-DD' to compare only the date part, ignoring the time
  //     if (
  //       moment(reportDate).format('YYYY-MM-DD') <
  //       moment(samplingDate).format('YYYY-MM-DD')
  //     ) {
  //       // If the formatted reportDate is less than the formatted samplingDate, throw a 400 error
  //       throw createError(
  //         400,
  //         'Report date should be greater than or equal to the sampling date'
  //       );
  //     }
  //     const newWaterQualityData = {
  //       machineId,
  //       wasteType,
  //       samplingDate,
  //       reportDate,
  //       tdsValue,
  //       tssValue,
  //       codValue,
  //       bodValue,
  //       phValue,
  //       oilGreaseValue,
  //       labReportUrl,
  //       washCountBetweenReports,
  //       cummulativeWashCount,
  //     };
  //     res.locals.request = {
  //       newWaterQualityData: newWaterQualityData,
  //     };
  //     next();
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  async validateWaterQualityParams(req: any, res: any, next: any) {
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
        startDate,
        endDate,
        limit,
        offset,
        search,
        sortBy,
        orderBy,
        wasteType,
      } = req.query;
      const oemIdArr: string[] = [];
      const regionIdArr: string[] = [];
      const stateIdArr: string[] = [];
      const cityIdArr: string[] = [];
      const dealerIdArr: string[] = [];
      const outletIdArr: string[] = [];
      const machineIdArr: string[] = [];
      let wasteTypeArr: string[] = [];
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

      if (wasteType) {
        wasteTypeArr = wasteType.split(',');
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
        wasteTypeArr,
        startDate,
        endDate,
        limit: _limit,
        offset: _offset,
        search: search ? search.trim() : null,
        showRecords,
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
}
const waterQualityPolicy = new WaterQualityPolicy();
export { waterQualityPolicy };
