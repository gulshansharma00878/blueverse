import { Op } from 'sequelize';
import moment from 'moment';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { Machine } from '../../../models/Machine/Machine';
import { Outlet } from '../../../models/outlet';
import { OEM } from '../../../models/oem';
import { User } from '../../../models/User/user';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { WaterQualityReport } from '../../../models/waterQualityReport';
import { Transactions } from '../../../models/transactions';
import db from '../../../models';
class WaterQualityService {
  async addWaterQuality(waterQualityData: any) {
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
      } = waterQualityData;
      return await WaterQualityReport.create({
        machine_id: machineId,
        waste_type: wasteType,
        sampling_date: samplingDate,
        report_date: reportDate,
        tds_value: tdsValue,
        tss_value: tssValue,
        cod_value: codValue,
        bod_value: bodValue,
        ph_value: phValue,
        oil_grease_value: oilGreaseValue,
        lab_report_url: labReportUrl,
        wash_count_between_reports: washCountBetweenReports,
        cummulative_wash_count: cummulativeWashCount,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async updateWaterQuality(waterQualityData: any, waterQualityId: string) {
    try {
      const {
        wasteType,
        tdsValue,
        tssValue,
        codValue,
        bodValue,
        phValue,
        oilGreaseValue,
        labReportUrl,
      } = waterQualityData;
      return await WaterQualityReport.update(
        {
          waste_type: wasteType,

          tds_value: tdsValue,
          tss_value: tssValue,
          cod_value: codValue,
          bod_value: bodValue,
          ph_value: phValue,
          oil_grease_value: oilGreaseValue,
          lab_report_url: labReportUrl,
        },
        {
          where: {
            water_quality_report_id: waterQualityId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getWaterQuality(waterQualityId: string) {
    try {
      return await WaterQualityReport.findOne({
        where: {
          water_quality_report_id: waterQualityId,
        },
        include: [
          {
            model: Machine,
            attributes: ['machineGuid', 'name'],
            include: [
              {
                model: Outlet,
                attributes: ['outletId', 'name'],
                include: [
                  {
                    model: User,
                    attributes: [
                      'userId',
                      'email',
                      'username',
                      'firstName',
                      'lastName',
                    ],
                    include: [
                      {
                        model: OEM,
                        attributes: ['oemId', 'name'],
                      },
                    ],
                  },
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
                            attributes: ['regionId', 'name'],
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
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getWaterQualityList(querBody: any) {
    try {
      const {
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
        limit,
        offset,
        search,
        sortBy,
        orderBy,
      } = querBody;
        
      const whereCondition: any = {};
      let sortOrder: any = [['report_date', 'desc']];
      if (!isNullOrUndefined(sortBy) && !isNullOrUndefined(orderBy)) {
        sortOrder = [[sortBy, orderBy]];
      }
      if (oemIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.oem.oem_id$'] = {
          [Op.in]: oemIdArr,
        };
      }
      if (regionIdArr.length > 0) {
        whereCondition['$machine.outlet.city.state.region.region_id$'] = {
          [Op.in]: regionIdArr,
        };
      }
      if (stateIdArr.length > 0) {
        whereCondition['$machine.outlet.city.state.state_id$'] = {
          [Op.in]: stateIdArr,
        };
      }
      if (cityIdArr.length > 0) {
        whereCondition['$machine.outlet.city.city_id$'] = {
          [Op.in]: cityIdArr,
        };
      }
      if (dealerIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.user_id$'] = {
          [Op.in]: dealerIdArr,
        };
      }
      if (outletIdArr.length > 0) {
        whereCondition['$machine.outlet.outlet_id$'] = {
          [Op.in]: outletIdArr,
        };
      }
      if (machineIdArr.length > 0) {
        whereCondition['$machine.MachineGuid$'] = {
          [Op.in]: machineIdArr,
        };
      }
      if (wasteTypeArr.length > 0) {
        whereCondition['waste_type'] = {
          [Op.in]: wasteTypeArr,
        };
      }
      // if (!isNullOrUndefined(startDate)) {
      //   whereCondition['sampling_date'] = {
      //     [Op.between]: [
      //       moment(samplingDate).startOf('day').toISOString(),
      //       moment(samplingDate).endOf('day').toISOString(),
      //     ],
      //   };
      // }
      if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
        whereCondition['report_date'] = {
          [Op.between]: [
            moment(startDate).startOf('day').toISOString(),
            moment(endDate).endOf('day').toISOString(),
          ],
        };
      }
      if (!isNullOrUndefined(search)) {
        whereCondition[Op.or] = [
          {
            '$machine.name$': {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            '$machine.outlet.name$': {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            '$machine.outlet.dealer.username$': {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      return WaterQualityReport.findAndCountAll({
        include: [
          {
            model: Machine,
            attributes: ['machineGuid', 'name'],
            include: [
              {
                model: Outlet,
                attributes: ['outletId', 'name'],
                include: [
                  {
                    model: User,
                    attributes: [
                      'userId',
                      'email',
                      'username',
                      'firstName',
                      'lastName',
                    ],
                    include: [
                      {
                        model: OEM,
                        attributes: ['oemId', 'name'],
                      },
                    ],
                  },
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
                            attributes: ['regionId', 'name'],
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
        where: whereCondition,
        limit: limit,
        offset: offset,
        order: sortOrder,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getWaterQualityListWithLastWash(queryBody: any) {
    try {
      const {
        oemIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        dealerIdArr,
        outletIdArr,
        machineIdArr,
        samplingDate,
        reportDate,
        limit,
        offset,
        search,
      } = queryBody;

      const whereCondition: any = {
        IsDeleted: false,
        outletId: {
          [Op.ne]: null,
        },
        merchantId: null,
      };

      if (oemIdArr.length > 0) {
        whereCondition['$outlet.dealer.oem.oem_id$'] = {
          [Op.in]: oemIdArr,
        };
      }
      if (regionIdArr.length > 0) {
        whereCondition['$outlet.city.state.region.region_id$'] = {
          [Op.in]: regionIdArr,
        };
      }
      if (stateIdArr.length > 0) {
        whereCondition['$outlet.city.state.state_id$'] = {
          [Op.in]: stateIdArr,
        };
      }
      if (cityIdArr.length > 0) {
        whereCondition['$outlet.city.city_id$'] = {
          [Op.in]: cityIdArr,
        };
      }
      if (dealerIdArr.length > 0) {
        whereCondition['$outlet.dealer.user_id$'] = {
          [Op.in]: dealerIdArr,
        };
      }
      if (outletIdArr.length > 0) {
        whereCondition['$outlet.outlet_id$'] = {
          [Op.in]: outletIdArr,
        };
      }
      if (machineIdArr.length > 0) {
        whereCondition['machineGuid'] = {
          [Op.in]: machineIdArr,
        };
      }
      if (!isNullOrUndefined(search)) {
        whereCondition[Op.or] = [
          {
            name: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      return Machine.findAndCountAll({
        attributes: ['machineGuid', 'name'],
        where: whereCondition,
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'name'],
            include: [
              {
                model: User,
                attributes: [
                  'userId',
                  'email',
                  'username',
                  'firstName',
                  'lastName',
                ],
                include: [
                  {
                    model: OEM,
                    attributes: ['oemId', 'name'],
                  },
                ],
              },
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
                        attributes: ['regionId', 'name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: Transactions,
            attributes: [
              'PHValue',
              'TDSValue',
              'TSSValue',
              'CODValue',
              'OilAndGreaseValue',
            ],
            limit: 1,
            order: [['AddDate', 'DESC']],
          },
        ],
        limit,
        offset,
        order: [
          [
            db.sequelize.literal(`(
              SELECT CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM "transactions" AS "Transaction"
                  WHERE "Transaction"."MachineGuid" = "Machine"."MachineGuid"
                ) THEN 0
                ELSE 1
              END
            )`),
            'ASC',
          ], // Machines with transactions come first
          ['createdAt', 'desc'], // Order by creation date if needed
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getMachineLastWaterQuality(machinId: string) {
    try {
      return WaterQualityReport.findOne({
        where: {
          machine_id: machinId,
        },
        order: [['sampling_date', 'desc']],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
const waterQualityService = new WaterQualityService();
export { waterQualityService };
