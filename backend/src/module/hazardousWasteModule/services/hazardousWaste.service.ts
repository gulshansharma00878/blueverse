import { Op, Sequelize } from 'sequelize';
import moment from 'moment';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { Machine } from '../../../models/Machine/Machine';
import { Outlet } from '../../../models/outlet';
import { OEM } from '../../../models/oem';
import { User } from '../../../models/User/user';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { HazardousWasteCollection } from '../../../models/HazardousWaste/hazardousWasteCollection';
import { HazardousWasteDisposal } from '../../../models/HazardousWaste/hazardousWasteDisposal';
import db from '../../../models/index';

class HazardousWasteService {
  async addWasteCollection(wasteCollectionBody: any) {
    try {
      const {
        machineId,
        wasteType,
        cleaningDate,
        wasteBagDetail,
        totalWasteBagWeight,
        washCount,
      } = wasteCollectionBody;
      return await HazardousWasteCollection.create({
        machine_id: machineId,
        waste_type: wasteType,
        cleaning_date: cleaningDate,
        wastage_bag_detail: wasteBagDetail,
        total_waste_bag_weight: totalWasteBagWeight,
        wash_count: washCount,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateWasteCollection(
    wasteCollectionBody: any,
    wasteCollectionId: string
  ) {
    try {
      const { wasteBagDetail, totalWasteBagWeight } = wasteCollectionBody;

      // Updating the hazard data
      const data = await HazardousWasteCollection.update(
        {
          wastage_bag_detail: wasteBagDetail,
          total_waste_bag_weight: totalWasteBagWeight,
        },
        {
          where: {
            hazardous_waste_collection_id: wasteCollectionId,
          },
        }
      );

      // finding te hazard data
      let hazardCollectionData: any = await HazardousWasteCollection.findOne({
        where: {
          hazardous_waste_collection_id: wasteCollectionId,
        },
      });

      // Query to find all hazardous waste disposal records associated with a machine and created on or after a given date
      let hazardDisposalData: any = await HazardousWasteDisposal.findAll({
        // Filter by machine ID and creation date
        where: {
          // Filter by machine ID
          machine_id: hazardCollectionData.machine_id,
          // Filter by creation date, greater than or equal to the given date
          createdAt: {
            // Using the Op.gte operator to specify the condition
            [Op.gte]: hazardCollectionData.createdAt,
          },
        },
        // Sort the results in descending order by createdAt
        order: [['createdAt', 'DESC']],
      });

      if (hazardDisposalData.length) {
        let remaining_weight =
          parseInt(totalWasteBagWeight) -
          parseInt(hazardDisposalData[0].dataValues.total_waste_bag_weight);

        // Update the hazardous waste disposal record
        await HazardousWasteDisposal.update(
          {
            // Update the collected waste weight
            collected_waste_weight: totalWasteBagWeight,
            // Calculate and update the remaining collected waste weight
            remaining_collected_waste_weight: remaining_weight,
          },

          {
            // Filter by hazardous waste collection ID
            where: {
              hazardous_waste_disposal_id:
                hazardDisposalData[0].dataValues.hazardous_waste_disposal_id,
            },
          }
        );
      }

      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getWasteCollectionList(querBody: any) {
    try {
      const {
        oemIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        dealerIdArr,
        outletIdArr,
        machineIdArr,
        cleaningDate,
        limit,
        offset,
        search,
        startDate,
        endDate,
        sortBy,
        orderBy,
      } = querBody;
      const whereCondition: any = {};
      let sortOrder: any = [['cleaning_date', 'desc']];
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
      if (!isNullOrUndefined(cleaningDate)) {
        whereCondition['cleaning_date'] = {
          [Op.between]: [
            moment(cleaningDate).startOf('day').toISOString(),
            moment(cleaningDate).endOf('day').toISOString(),
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

      if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
        whereCondition['cleaning_date'] = {
          [Op.between]: [
            moment(startDate).startOf('day').toISOString(),
            moment(endDate).endOf('day').toISOString(),
          ],
        };
      }
      return HazardousWasteCollection.findAndCountAll({
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
                    attributes: ['userId', 'email', 'username'],
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

  async getLastWasteCollection(machineId: string) {
    try {
      const whereCondition: any = {};
      if (!isNullOrUndefined(machineId) && isValidGuid(machineId)) {
        whereCondition['machine_id'] = machineId;
      }
      return await HazardousWasteCollection.findOne({
        where: whereCondition,
        order: [['cleaning_date', 'desc']],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getWasteCollectionDetail(wastecollectionId: string) {
    try {
      const whereCondition: any = {};

      whereCondition['hazardous_waste_collection_id'] = wastecollectionId;

      return await HazardousWasteCollection.findOne({
        where: whereCondition,
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
                    attributes: ['userId', 'email', 'username'],
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
  //
  async getMonthlyWasteCollectionDetails(body: any) {
    try {
      const {
        cleaningStartDate,
        cleaningEndDate,
        machineIdArr,
        dealerIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        oemIdArr,
      } = body;
      const whereCondition: any = {};
      if (machineIdArr.length > 0) {
        whereCondition['machine_id'] = {
          [Op.in]: machineIdArr,
        };
      }
      if (cleaningStartDate && cleaningEndDate) {
        whereCondition['cleaning_date'] = {
          [Op.between]: [cleaningStartDate, cleaningEndDate],
        };
      }
      if (dealerIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.user_id$'] = {
          [Op.in]: dealerIdArr,
        };
      }
      if (oemIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.oem_id$'] = {
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

      const wasteCollectionRecords = await HazardousWasteCollection.findAll({
        where: whereCondition,
        attributes: [
          [db.sequelize.literal('EXTRACT(YEAR FROM "cleaning_date")'), 'year'],
          [
            db.sequelize.literal('to_char("cleaning_date", \'YYYY-MM\')'),
            'year_month',
          ],
          [
            db.sequelize.literal('EXTRACT(MONTH FROM "cleaning_date")'),
            'month',
          ],
          [
            db.sequelize.fn(
              'ROUND',
              db.sequelize.cast(
                db.sequelize.fn(
                  'SUM',
                  db.sequelize.col('total_waste_bag_weight')
                ),
                'numeric'
              ),
              2
            ),
            'total_collection_weight',
          ],
        ],
        include: [
          {
            model: Machine,
            attributes: [],
            include: [
              {
                model: Outlet,
                attributes: [],
                include: [
                  {
                    model: User,
                    attributes: [],
                  },
                  {
                    model: City,
                    attributes: [],
                    include: [
                      {
                        model: State,
                        attributes: [],
                        include: [
                          {
                            model: Region,
                            attributes: [],
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
        group: [
          db.sequelize.literal('EXTRACT(YEAR FROM "cleaning_date")'),
          db.sequelize.literal('EXTRACT(MONTH FROM "cleaning_date")'),
          Sequelize.fn('to_char', Sequelize.col('cleaning_date'), 'YYYY-MM'),
        ],
      });
      return {
        wasteCollectionRecords,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getMonthlyRemainingWaste(
    wasteDisposal: any,
    wasteCollections: any,
    lastRemainingWaste: number
  ) {
    let wasteDisposalRecords = wasteDisposal.wasteDisposalRecords;
    let wasteCollectionRecords = wasteCollections.wasteCollectionRecords;
    let remainingWaste: any = [];
    let tempLastRemainingWaste = lastRemainingWaste || 0;

    for (let collectionRecord of wasteCollectionRecords) {
      collectionRecord = collectionRecord.dataValues;
      let yearMonth = collectionRecord.year_month;

      // Find matching disposal record
      let disposalRecord = wasteDisposalRecords.find(
        (record: any) => record.dataValues.year_month === yearMonth
      );

      // Start with the collection weight for the month
      let remainingWasteWeight =
        Number(collectionRecord.total_collection_weight) || 0;

      // Subtract the disposal weight if available
      if (disposalRecord && disposalRecord.dataValues.total_disposal_weight) {
        remainingWasteWeight -= Number(
          disposalRecord.dataValues.total_disposal_weight
        );
      }

      // Add the cumulative waste from previous iterations
      remainingWasteWeight += tempLastRemainingWaste;

      // Update the cumulative remaining waste for the next iteration
      tempLastRemainingWaste = remainingWasteWeight;

      // Ensure `remainingWasteWeight` is a number before applying .toFixed()
      const record = {
        year: collectionRecord.year,
        month: collectionRecord.month,
        year_month: collectionRecord.year_month,
        remaining_waste_weight: isNaN(remainingWasteWeight)
          ? 0
          : parseFloat(remainingWasteWeight.toFixed(2)),
      };

      // Add the record to the array
      remainingWaste.push(record);
    }

    return remainingWaste;
  }

  async addWasteDisposal(wasteDisposalBody: any) {
    try {
      const {
        machineId,
        wasteType,
        desposingDate,
        totalWasteBagWeight,
        collected_waste_weight,
        remaining_collected_waste_weight,
        formUrl,
      } = wasteDisposalBody;
      return await HazardousWasteDisposal.create({
        machine_id: machineId,
        waste_type: wasteType,
        desposing_date: desposingDate,
        total_waste_bag_weight: totalWasteBagWeight,
        collected_waste_weight: collected_waste_weight,
        remaining_collected_waste_weight: remaining_collected_waste_weight,
        form_url: formUrl,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateWasteDisposal(wasteDisposalBody: any, wasteDisposalId: string) {
    try {
      const {
        totalWasteBagWeight,

        formUrl,
        remaining_collected_waste_weight,
      } = wasteDisposalBody;
      return await HazardousWasteDisposal.update(
        {
          total_waste_bag_weight: totalWasteBagWeight,
          remaining_collected_waste_weight: remaining_collected_waste_weight,
          form_url: formUrl,
        },
        {
          where: {
            hazardous_waste_disposal_id: wasteDisposalId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getWasteDisposalList(querBody: any) {
    try {
      const {
        oemIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        dealerIdArr,
        outletIdArr,
        machineIdArr,
        disposalDate,
        limit,
        offset,
        search,
        startDate,
        endDate,
        sortBy,
        orderBy,
      } = querBody;
      const whereCondition: any = {};
      let sortOrder: any = [['desposing_date', 'desc']];
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
      if (!isNullOrUndefined(disposalDate)) {
        whereCondition['desposing_date'] = {
          [Op.between]: [
            moment(disposalDate).startOf('day').toISOString(),
            moment(disposalDate).endOf('day').toISOString(),
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
      if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
        whereCondition['desposing_date'] = {
          [Op.between]: [
            moment(startDate).startOf('day').toISOString(),
            moment(endDate).endOf('day').toISOString(),
          ],
        };
      }
      return HazardousWasteDisposal.findAndCountAll({
        attributes: {
          exclude: ['wastage_bag_detail', 'updatedAt'],
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
                    attributes: ['userId', 'email', 'username'],
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

  async getWasteDisposalDetails(wasteDisposalId: string) {
    try {
      const whereCondition: any = {};
      if (!isNullOrUndefined(wasteDisposalId) && isValidGuid(wasteDisposalId)) {
        whereCondition['hazardous_waste_disposal_id'] = wasteDisposalId;
      }
      return await HazardousWasteDisposal.findOne({
        where: whereCondition,
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
                    attributes: ['userId', 'email', 'username'],
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

  async getMonthlyWasteDisposalDetails(body: any) {
    try {
      const {
        disposingStartDate,
        disposingEndDate,
        machineIdArr,
        dealerIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        oemIdArr,
      } = body;
      const whereCondition: any = {};
      if (machineIdArr.length > 0) {
        whereCondition['machine_id'] = {
          [Op.in]: machineIdArr,
        };
      }
      if (disposingStartDate && disposingEndDate) {
        whereCondition['desposing_date'] = {
          [Op.between]: [disposingStartDate, disposingEndDate],
        };
      }

      if (dealerIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.user_id$'] = {
          [Op.in]: dealerIdArr,
        };
      }
      if (oemIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.oem_id$'] = {
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
      const wasteDisposalRecords = await HazardousWasteDisposal.findAll({
        attributes: [
          [db.sequelize.literal('EXTRACT(YEAR FROM "desposing_date")'), 'year'],
          [
            db.sequelize.literal('EXTRACT(MONTH FROM "desposing_date")'),
            'month',
          ],
          [
            db.sequelize.literal('to_char("desposing_date", \'YYYY-MM\')'),
            'year_month',
          ],
          [
            db.sequelize.fn('sum', db.sequelize.col('total_waste_bag_weight')),
            'total_disposal_weight',
          ],
          [
            db.sequelize.fn('sum', db.sequelize.col('collected_waste_weight')),
            'total_collected_weight',
          ],
          [
            db.sequelize.fn(
              'sum',
              db.sequelize.col('remaining_collected_waste_weight')
            ),
            'remaining_collected_weight',
          ],
        ],
        include: [
          {
            model: Machine,
            attributes: [],
            include: [
              {
                model: Outlet,
                attributes: [],
                include: [
                  {
                    model: User,
                    attributes: [],
                  },
                  {
                    model: City,
                    attributes: [],
                    include: [
                      {
                        model: State,
                        attributes: [],
                        include: [
                          {
                            model: Region,
                            attributes: [],
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
        group: [
          db.sequelize.literal('EXTRACT(YEAR FROM "desposing_date")'),
          db.sequelize.literal('EXTRACT(MONTH FROM "desposing_date")'),
          Sequelize.fn('to_char', Sequelize.col('desposing_date'), 'YYYY-MM'),
        ],
      });
      return {
        wasteDisposalRecords,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }
  //  function to get machine all collected waste
  async getMachineAllCollectedWaste(machineId: string) {
    try {
      return await HazardousWasteCollection.sum('total_waste_bag_weight', {
        where: {
          total_waste_bag_weight: {
            [Op.ne]: null,
          },
          machine_id: machineId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  //  function to get machine all disposal waste
  async getMachineAllDisposedWaste(machineId: string) {
    try {
      return await HazardousWasteDisposal.sum('total_waste_bag_weight', {
        where: {
          total_waste_bag_weight: {
            [Op.ne]: null,
          },
          machine_id: machineId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getTotlalSludgeWasteDispose() {
    try {
      return await HazardousWasteDisposal.sum('total_waste_bag_weight');
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getRemainingWasteCount(body: any) {
    try {
      const {
        cleaningStartDate,
        machineIdArr,
        dealerIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        oemIdArr,
      } = body;
      const lastDate = cleaningStartDate;
      const whereCondition: any = {};

      if (machineIdArr.length > 0) {
        whereCondition['machine_id'] = {
          [Op.in]: machineIdArr,
        };
      }

      if (dealerIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.user_id$'] = {
          [Op.in]: dealerIdArr,
        };
      }
      if (oemIdArr.length > 0) {
        whereCondition['$machine.outlet.dealer.oem_id$'] = {
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
      whereCondition['cleaning_date'] = {
        [Op.lt]: lastDate,
      };

      const collectedWeightPromise = HazardousWasteCollection.findAll({
        where: whereCondition,
        attributes: [
          [
            db.sequelize.fn('sum', db.sequelize.col('total_waste_bag_weight')),
            'total_collection_weight',
          ],
        ],
        include: [
          {
            model: Machine,
            attributes: [],
            include: [
              {
                model: Outlet,
                attributes: [],
                include: [
                  {
                    model: User,
                    attributes: [],
                  },
                  {
                    model: City,
                    attributes: [],
                    include: [
                      {
                        model: State,
                        attributes: [],
                        include: [
                          {
                            model: Region,
                            attributes: [],
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
        group: [],
      });

      delete whereCondition['cleaning_date'];
      whereCondition['desposing_date'] = {
        [Op.lt]: lastDate,
      };

      const disposalWeightPromise = HazardousWasteDisposal.findAll({
        attributes: [
          [
            db.sequelize.fn('sum', db.sequelize.col('total_waste_bag_weight')),
            'total_disposal_weight',
          ],
        ],
        include: [
          {
            model: Machine,
            attributes: [],
            include: [
              {
                model: Outlet,
                attributes: [],
                include: [
                  {
                    model: User,
                    attributes: [],
                  },
                  {
                    model: City,
                    attributes: [],
                    include: [
                      {
                        model: State,
                        attributes: [],
                        include: [
                          {
                            model: Region,
                            attributes: [],
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
        group: [],
      });

      const [totalCollectedWeightResult, totalDisposalWeightResult] =
        await Promise.all([collectedWeightPromise, disposalWeightPromise]);

      const totalCollectedWeight =
        totalCollectedWeightResult[0]?.get('total_collection_weight') || 0;
      const totalDisposalWeight =
        totalDisposalWeightResult[0]?.get('total_disposal_weight') || 0;

      return Number(totalCollectedWeight) - Number(totalDisposalWeight);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getLastWasteDisposalDetail(machineId: string) {
    try {
      const whereCondition: any = {};
      if (!isNullOrUndefined(machineId) && isValidGuid(machineId)) {
        whereCondition['machine_id'] = machineId;
      }
      return await HazardousWasteDisposal.findOne({
        where: whereCondition,
        order: [['desposing_date', 'desc']],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
const hazardousWasteService = new HazardousWasteService();
export { hazardousWasteService };
