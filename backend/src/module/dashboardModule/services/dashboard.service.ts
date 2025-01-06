import moment from 'moment';
import { Op, fn, col, literal, QueryTypes } from 'sequelize';
import {
  dayWiseFilter,
  dealerCreationDayWise,
  dealerCreationHourly,
  electricityDayConsumedFilter,
  electricityHourConsumedFilter,
  filterTransactionsDayWise,
  filterTransactionsHourly,
  filterTransactionsOnWashType,
  getDealerAllTransactions,
  hourlyFilter,
} from '../../../services/commonService';
import { config } from '../../../config/config';
import { OEMManagerDealers } from '../../../models/User/OEMManagerDealers';
import { User } from '../../../models/User/user';
import { UserArea } from '../../../models/User/UserArea';
import { Outlet } from '../../../models/outlet';
import { error } from 'console';
import { Machine } from '../../../models/Machine/Machine';
import { STATUS } from '../../../module/areaModule/constant';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { OEM } from '../../../models/oem';
import { OutletMachine } from '../../../models/outlet_machine';
import db from '../../../models';
import { Transactions } from '../../../models/transactions';
import {
  calculateAverage,
  calculateSum,
  isNullOrUndefined,
  isValidGuid,
} from '../../../common/utility';
import { validate as isValidUUID } from 'uuid';
import sequelize from 'sequelize/types/sequelize';
import { AnyFalsy } from 'underscore';
class DashboardService {
  async getDashboardWashes(req: any, res: any) {
    try {
      let userId;
      if (res.user.role === config.userRolesObject.DEALER) {
        userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }
      let { fromDate, toDate, machineIds, dealersIds, oemIds } = req.query;
      let whereCondition: any = {};
      let timeLimitFilter = 'DAYS';
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['AddDate'] = {
            [Op.between]: [
              moment(fromDate).startOf('day').toISOString(),
              moment(toDate).endOf('day').toISOString(),
            ],
          };
          var date1 = moment(fromDate);
          var date2 = moment(toDate);
          if (date2.diff(date1, 'days') === 0) {
            timeLimitFilter = 'HOURLY';
          }
        }
      }
      const dealerIdArr = [];
      if (dealersIds) {
        for (const id of dealersIds.split(',')) {
          if (isValidGuid(id)) {
            dealerIdArr.push(id);
          }
        }
      }
      const oemIdArr = [];
      if (oemIds) {
        for (const id of oemIds.split(',')) {
          if (isValidGuid(id)) {
            oemIdArr.push(id);
          }
        }
      }
      const transactions = await getDealerAllTransactions(
        userId,
        whereCondition,
        machineIds,
        dealerIdArr,
        res.user.role,
        oemIdArr
      );

      return this.getWashes(fromDate, toDate, transactions, timeLimitFilter);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getDashboardTreatedWater(req: any, res: any) {
    try {
      let userId;
      if (res.user.role === config.userRolesObject.DEALER) {
        userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }
      let { fromDate, toDate, machineIds, dealersIds, oemIds } = req.query;
      let whereCondition: any = {};
      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          whereCondition['AddDate'] = {
            [Op.between]: [
              moment(fromDate).startOf('day').toISOString(),
              moment(toDate).endOf('day').toISOString(),
            ],
          };
        }
      }
      const dealerIdArr = [];
      if (dealersIds) {
        for (const id of dealersIds.split(',')) {
          if (isValidGuid(id)) {
            dealerIdArr.push(id);
          }
        }
      }
      const oemIdArr = [];
      if (oemIds) {
        for (const id of oemIds.split(',')) {
          if (isValidGuid(id)) {
            oemIdArr.push(id);
          }
        }
      }
      const transactions = await getDealerAllTransactions(
        userId,
        whereCondition,
        machineIds,
        dealerIdArr,
        res.user.role,
        oemIdArr
      );
      const data: any = {
        WaterUsed: 0,
        WaterWastage: 0,
        WaterPrice: 0,
      };
      for (const transaction of transactions) {
        data.WaterUsed += Number(transaction.WaterUsed);
        data.WaterWastage += Number(transaction.WaterWastage);
        data.WaterPrice += Number(transaction.WaterPrice);
      }
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getOemManagerDealership(oemManagerId: string) {
    try {
      const dealer = await OEMManagerDealers.findAll({
        where: { oemManagerId: oemManagerId },
        attributes: ['dealerId'],
        raw: true,
      });
      return dealer.map((el) => String(el.dealerId));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getWashes(
    fromDate: any,
    toDate: any,
    transactions: any,
    timeLimitFilter: any
  ) {
    const washTypeTransactions: any =
      filterTransactionsOnWashType(transactions);

    let transactionsTimeBased = {};
    if (timeLimitFilter === 'DAYS') {
      transactionsTimeBased = {
        SILVER: filterTransactionsDayWise(
          fromDate,
          toDate,
          washTypeTransactions.SILVER
        ),
        GOLD: filterTransactionsDayWise(
          fromDate,
          toDate,
          washTypeTransactions.GOLD
        ),
        PLATINUM: filterTransactionsDayWise(
          fromDate,
          toDate,
          washTypeTransactions.PLATINUM
        ),
      };
    } else {
      transactionsTimeBased = {
        SILVER: filterTransactionsHourly(
          fromDate,
          toDate,
          washTypeTransactions.SILVER
        ),
        GOLD: filterTransactionsHourly(
          fromDate,
          toDate,
          washTypeTransactions.GOLD
        ),
        PLATINUM: filterTransactionsHourly(
          fromDate,
          toDate,
          washTypeTransactions.PLATINUM
        ),
      };
    }

    return {
      totalWashes: transactions.length,
      transactions: transactionsTimeBased,
    };
  }

  async getMachinesForAreaAndOEMManager(
    dealerIds: any,
    cityIds: any = [],
    machineArr?: any
  ) {
    try {
      let userWhereCondition = {};
      if (dealerIds) {
        userWhereCondition = { userId: { [Op.in]: dealerIds } };
      }
      const outletCondition: any = { status: STATUS.ACTIVE };
      if (cityIds.length > 0) {
        outletCondition.cityId = { [Op.in]: cityIds };
      }
      let machineCondition = {};
      if (!isNullOrUndefined(machineArr) && machineArr.length > 0) {
        machineCondition = {
          machineGuid: { [Op.in]: machineArr },
        };
      }
      return await Machine.findAll({
        where: machineCondition,
        attributes: ['machineGuid', 'name', 'Latitude', 'Longitude', 'PlcTag'],
        include: [
          {
            model: Outlet,
            attributes: [
              'outletId',
              'address',
              'gstNo',
              'latitude',
              'longitude',
            ],
            where: outletCondition,
            include: [
              {
                model: User,
                attributes: ['username', 'userId'],
                where: userWhereCondition,
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
        ],
      });
    } catch (err) {
      return Promise.reject(error);
    }
  }

  async getTreatedWaterAreaAndOEMManager(
    dealerIds: any,
    whereCondition: any,
    machineIds: any,
    role: any
  ) {
    try {
      const transactions = await getDealerAllTransactions(
        '',
        whereCondition,
        machineIds,
        dealerIds,
        role,
        []
      );

      const data: any = {
        WaterUsed: 0,
        WaterWastage: 0,
        WaterPrice: 0,
      };
      for (const transaction of transactions) {
        data.WaterUsed += Number(transaction.WaterUsed);
        data.WaterWastage += Number(transaction.WaterWastage);
        data.WaterPrice += Number(transaction.WaterPrice);
      }
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  getDashboardFilter(req: any, columnName: any) {
    let { fromDate, toDate } = req.query;
    let whereCondition: any = {};
    let timeLimitFilter = 'DAYS';
    if (fromDate && toDate) {
      if (moment(fromDate).isValid() && moment(toDate).isValid()) {
        whereCondition[columnName] = {
          [Op.between]: [
            moment(fromDate).startOf('day').toISOString(),
            moment(toDate).endOf('day').toISOString(),
          ],
        };
        const date1 = moment(fromDate);
        const date2 = moment(toDate);
        if (date2.diff(date1, 'days') === 0) {
          timeLimitFilter = 'HOURLY';
        }
      }
    }

    return { timeLimitFilter: timeLimitFilter, whereCondition: whereCondition };
  }

  electricityConsumedFilter(
    transactions: any,
    timeLimitFilter: any,
    fromDate: any,
    toDate: any
  ) {
    let transaction: any = {};
    if (transactions.length) {
      if (timeLimitFilter === 'DAYS') {
        let filterDate = dayWiseFilter(fromDate, toDate);
        for (const date of Object.keys(filterDate)) {
          filterDate[date] = [];
        }
        transaction = electricityDayConsumedFilter(transactions, filterDate);
      } else {
        let filterDate = hourlyFilter(fromDate, toDate);
        for (const date of Object.keys(filterDate)) {
          filterDate[date] = [];
        }
        transaction = electricityHourConsumedFilter(transactions, filterDate);
      }
    }
    for (const date of Object.keys(transaction)) {
      transaction[date] = calculateSum(transaction[date]); //insted of average calculate sum of electricity
    }
    return transaction;
  }

  async topDealershipTransactionsQuery(
    dealerIds: any,
    fromDate: any,
    toDate: any,
    machineId: any
  ) {
    try {
      return await db.sequelize.query(`SELECT OUTLET.DEALER_ID,
      COUNT('transactions.Guid'),
      PUBLIC.USER.USERNAME,
      PUBLIC.USER.UNIQUE_ID,
      PUBLIC.OUTLET.DEALER_ID
    FROM OUTLET
    JOIN MACHINE ON OUTLET.OUTLET_ID = MACHINE.OUTLET_ID
    JOIN TRANSACTIONS ON MACHINE."MachineGuid" = TRANSACTIONS."MachineGuid"
    JOIN wash_types ON TRANSACTIONS."WashTypeGuid"=wash_types."Guid"
    JOIN PUBLIC.USER ON OUTLET.DEALER_ID = PUBLIC.USER.USER_ID
    WHERE OUTLET.DEALER_ID IN (${dealerIds})
      AND MACHINE."MachineGuid" IN (${machineId})
      AND PUBLIC.USER.DELETED_AT IS NULL
      AND PUBLIC.USER.IS_ACTIVE = TRUE
      AND PUBLIC.USER.PARENT_USER_ID IS NULL
      AND PUBLIC.USER.SUB_ROLE_ID IS NULL
      AND TRANSACTIONS."AddDate" >= '${fromDate}'
      AND TRANSACTIONS."AddDate" <= '${toDate}'
      AND wash_types."Name" IN ('${config.washType.GOLD}','${config.washType.PLATINUM}','${config.washType.SILVER}')
    GROUP BY OUTLET.DEALER_ID,
      PUBLIC.USER.USERNAME,
      PUBLIC.USER.UNIQUE_ID
    ORDER BY COUNT('transactions.Guid') DESC
    LIMIT 5;
    `);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealerCreationForOEMAndArea(
    dealerIds: any,
    whereCondition: any,
    timeLimitFilter: any,
    fromDate: any,
    toDate: any
  ) {
    try {
      let dealers: any = [];
      if (dealerIds.length) {
        dealers = await User.findAll({
          where: {
            userId: { [Op.in]: dealerIds },
            ...whereCondition,
            deletedAt: null,
            parentUserId: null,
            isActive: true,
          },
          attributes: ['userId', 'createdAt'],
          order: [['createdAt', 'DESC']],
          raw: true,
        });
      }
      let dealerships = {};
      if (timeLimitFilter === 'DAYS') {
        let filterDate = dayWiseFilter(fromDate, toDate);
        dealerships = dealerCreationDayWise(filterDate, dealers);
      } else {
        let filterDate = hourlyFilter(fromDate, toDate);
        dealerships = dealerCreationHourly(filterDate, dealers);
      }

      return { dealerships, dealers };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async dealersOfAreaManager(areaManagerId: string, cityIds: any) {
    try {
      const areaManager: any = await User.findOne({
        where: { userId: areaManagerId },
        attributes: ['oemId'],
      });
      return await User.findAll({
        where: {
          deletedAt: null,
          role: config.userRolesObject.DEALER,
          parentUserId: null,
          subRoleId: null,
          isActive: true,
          oemId: areaManager.oemId,
        },
        attributes: ['userId', 'username', 'email', 'userId'],
        include: [
          {
            model: Outlet,
            attributes: ['outletId'],
            where: { cityId: { [Op.in]: cityIds } },
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async areaManagerCities(areaManagerId: string) {
    try {
      const cities = await UserArea.findAll({
        where: { userId: areaManagerId },
        attributes: ['cityId'],
        raw: true,
      });
      return cities.map((el) => el.cityId);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getDealersList(req: any) {
    try {
      let {
        startDate,
        endDate,
        oemIds,
        cityIds,
        stateIds,
        regionIds,
        machineIds,
        dealersIds,
      } = req.query;

      const whereCondition: any = {
        role: config.userRolesObject.DEALER,
        deletedAt: null,
        parentUserId: null,
        subRoleId: null,
        isActive: true,
      };
      let oemIdsWhereCondition: any = {};
      const cityIdWhereCondition: any = {};
      const stateIdWhereCondition: any = {};
      const regionIdWhereCondition: any = {};
      const machineIdWhereCondition: any = {};
      const dealerIdArr: any = [];
      const machineIdArr: any = [];
      if (oemIds) {
        const oemIdArr = [];
        for (const oemId of oemIds.split(',')) {
          if (isValidUUID(oemId)) {
            oemIdArr.push(oemId);
          }
        }
        if (oemIdArr.length) {
          oemIdsWhereCondition['oemId'] = { [Op.in]: oemIdArr };
        }
      }
      if (cityIds) {
        const cityIdArr = [];
        for (const cityId of cityIds.split(',')) {
          if (isValidUUID(cityId)) {
            cityIdArr.push(cityId);
          }
        }

        if (cityIdArr.length) {
          cityIdWhereCondition['cityId'] = { [Op.in]: cityIdArr };
        }
      }
      if (stateIds) {
        const stateIdsArr = [];
        for (const stateId of stateIds.split(',')) {
          if (isValidUUID(stateId)) {
            stateIdsArr.push(stateId);
          }
        }
        if (stateIdsArr.length) {
          stateIdWhereCondition['stateId'] = { [Op.in]: stateIdsArr };
        }
      }
      if (regionIds) {
        const regionIdArr = [];
        for (const regionId of regionIds.split(',')) {
          if (isValidUUID(regionId)) {
            regionIdArr.push(regionId);
          }
        }
        if (regionIdArr.length) {
          regionIdWhereCondition['regionId'] = { [Op.in]: regionIdArr };
        }
      }
      if (machineIds) {
        for (const machineId of machineIds.split(',')) {
          if (isValidUUID(machineId)) {
            machineIdArr.push(machineId);
          }
        }
        if (machineIdArr.length) {
          machineIdWhereCondition['machineGuid'] = { [Op.in]: machineIdArr };
        }
      }
      if (dealersIds) {
        for (const dealerId of dealersIds.split(',')) {
          if (isValidUUID(dealerId)) {
            dealerIdArr.push(dealerId);
          }
        }
        if (dealerIdArr.length) {
          whereCondition['userId'] = { [Op.in]: dealerIdArr };
        }
      }

      // if (startDate && endDate) {
      //   if (moment(startDate).isValid() && moment(endDate).isValid()) {
      //     whereCondition['createdAt'] = {
      //       [Op.between]: [
      //         moment(startDate).startOf('day').toISOString(),
      //         moment(endDate).endOf('day').toISOString(),
      //       ],
      //     };
      //   }
      // }
      //if machine ids are null or undefined
      if (isNullOrUndefined(machineIds)) {
        const machineDealersIdArr: any = [];
        const outletMachines = await OutletMachine.findAll({
          where: {
            createdAt: {
              [Op.between]: [
                moment(startDate).startOf('day').toISOString(),
                moment(endDate).endOf('day').toISOString(),
              ],
            },
          },
          include: [
            {
              model: Outlet,
            },
          ],
        });

        outletMachines.forEach((outletMachine: any) => {
          machineIdArr.push(outletMachine.dataValues.machineId);
          machineDealersIdArr.push(outletMachine.outlet.dataValues.dealerId);
        });

        if (dealerIdArr.length < 1 && machineDealersIdArr.length) {
          whereCondition['userId'] = { [Op.in]: machineDealersIdArr };
        }
        if (machineIdArr.length) {
          machineIdWhereCondition['machineGuid'] = { [Op.in]: machineIdArr };
        }
      }
      if (machineIdArr.length < 1) {
        return [];
      }
      const dealers = await User.findAll({
        attributes: ['userId', 'username', 'createdAt'],
        where: whereCondition,
        include: [
          {
            model: OEM,
            where: oemIdsWhereCondition,
            attributes: ['oemId', 'name', 'status'],
          },
          {
            model: Outlet,
            attributes: ['outletId', 'name'],
            include: [
              {
                model: Machine,
                where: machineIdWhereCondition,
                attributes: ['machineGuid', 'name', 'machineGuid'],
              },
              {
                model: City,
                where: cityIdWhereCondition,
                attributes: ['cityId'],
                include: [
                  {
                    model: State,
                    where: stateIdWhereCondition,
                    attributes: ['stateId'],
                    include: [
                      {
                        model: Region,
                        attributes: ['regionId'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
      });
      return dealers;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getDealerMachineCount(outlets: any) {
    try {
      let machineCount = 0;
      for (const outlet of outlets) {
        const machines = outlet.machines;
        machineCount += machines.length;
      }
      return machineCount;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAdminDashboardGraphData(req: any, res: any) {
    try {
      let userId;
      // If the user's role is 'DEALER', set the userId to either the parentUserId (if it exists) or the userId of the current user.
      if (res.user.role === config.userRolesObject.DEALER) {
        userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }

      // Destructure query parameters from the request object.
      let { fromDate, toDate, machineIds, dealersIds, oemIds } = req.query;

      // Call the `getTransactionCount` function to retrieve wash data based on the query parameters and user role.
      let washes = await this.getTransactionCount(
        fromDate,
        toDate,
        userId,
        machineIds,
        dealersIds,
        oemIds,
        res.user.role
      );
      console.log(
        '🚀 ~ DashboardService ~ getAdminDashboardGraphData ~ res.user.role:',
        washes
      );
      // Initialize a variable to track the total washes for specific wash types (SILVER, GOLD, PLATINUM).
      let totalWashes = 0;

      // Initialize an empty `transactions` object to store wash counts by date for SILVER, GOLD, and PLATINUM.
      let transactions: any = {
        SILVER: {},
        GOLD: {},
        PLATINUM: {},
      };

      // Iterate over the `washes` array to populate the `transactions` object.
      for (let i = 0; i < washes.length; i++) {
        // Convert the wash date to ISO format with the time set to the hour (removing minutes and seconds).
        let date = washes[i]?.date
          .toISOString()
          .replace(
            /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
            '$1T$2:$3:$4.000Z'
          );

        // Parse wash counts for each type.
        let silverValue = parseInt(washes[i].SILVER);
        let goldValue = parseInt(washes[i].GOLD);
        let platinumValue = parseInt(washes[i].PLATINUM);

        // Only add the wash counts to the `transactions` object if the value is greater than 0.
        if (silverValue > 0) {
          transactions.SILVER[date] = silverValue;
        }
        if (goldValue > 0) {
          transactions.GOLD[date] = goldValue;
        }
        if (platinumValue > 0) {
          transactions.PLATINUM[date] = platinumValue;
        }
        totalWashes += parseInt(washes[i].SILVER);
        totalWashes += parseInt(washes[i].GOLD);
        totalWashes += parseInt(washes[i].PLATINUM);
      }

      // Create the final output object containing the total washes and the transactions grouped by date.
      let output = {
        totalWashes: totalWashes, // Total count of all SILVER, GOLD, and PLATINUM washes
        transactions: transactions, // Transaction details grouped by wash type and date
      };

      // Return the output object.
      return output;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // wash Transaction count API for admin
  async getTransactionCount(
    inputStartDate: Date,
    inputEndDate: Date,
    userId?: string,
    machineIds?: string,
    dealersIds?: string,
    oemIds?: string,
    role?: string
  ) {
    // const startDate = moment(inputStartDate).startOf('day').toISOString();
    const startDate = moment(inputStartDate)
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(inputEndDate).endOf('day').toISOString();

    // Validate date objects
    if (
      isNaN(new Date(startDate).getTime()) ||
      isNaN(new Date(endDate).getTime())
    ) {
      throw new Error('Invalid startDate or endDate');
    }

    const dateDiff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 3600 * 24)
    );

    const replacements: any = { startDate, endDate };

    let whereClauses: string[] = [];
    if (userId && isValidGuid(userId)) {
      whereClauses.push('"User"."user_id" = :userId');
      replacements.userId = userId;
    }

    if (dealersIds && dealersIds.length) {
      const dealerIdArray = dealersIds
        .split(',')
        .map((id: any) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id: any) => isValidGuid(id));
      if (dealerIdArray.length > 0) {
        replacements.dealerIds = dealerIdArray;
        whereClauses.push('"User"."user_id" = ANY(ARRAY[:dealerIds]::uuid[])');
      }
    }

    if (oemIds && oemIds.length) {
      const oemIdArray = oemIds
        .split(',')
        .map((id: any) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id: any) => isValidGuid(id));
      if (oemIdArray.length) {
        replacements.oemIds = oemIdArray;
        whereClauses.push('"User"."oem_id" = ANY(ARRAY[:oemIds]::uuid[])');
      }
    }

    if (machineIds) {
      const machineIdArray = machineIds
        .split(',')
        .map((id) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id) => isValidGuid(id));
      if (machineIdArray.length) {
        replacements.machineIds = machineIdArray;
        whereClauses.push(
          '"Machine"."MachineGuid" = ANY(ARRAY[:machineIds]::uuid[])'
        );
      }
    }

    if (role && role !== config.userRolesObject.ADMIN) {
      whereClauses.push('"transactions"."IsAssigned" = true');
    }

    const whereClause =
      whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

    let query = '';

    if (dateDiff > 140) {
      // Monthly intervals
      query = await this.transactionQuery('month', whereClause);
    } else if (dateDiff > 31) {
      // Weekly intervals
      query = await this.transactionQuery('week', whereClause);
    } else if (dateDiff > 1) {
      // Daily intervals
      query = await this.transactionQuery('day', whereClause);
    } else {
      // Hourly intervals
      query = await this.transactionQuery('hour', whereClause);
    }

    try {
      const transactionCounts = await db.sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });
      return transactionCounts;
    } catch (err) {
      console.error('Error in getTransactionCount:', err);
      throw err;
    }
  }

  async transactionQuery(dateCondition: any, whereClause: any) {
    try {
      let handleDate = dateCondition === 'hour' ? 'timestamp' : 'date'
      let query = `
      SELECT
          series.${dateCondition}  AT TIME ZONE 'UTC' AS date,
         
          COALESCE(t."SILVERCount", 0) AS "SILVER",
          COALESCE(t."GOLDCount", 0) AS "GOLD",
          COALESCE(t."PLATINUMCount", 0) AS "PLATINUM",
          COALESCE(t."TotalElectricityUsed", 0) AS "TotalElectricityUsed"
      FROM 
          generate_series(
              date_trunc('${dateCondition}', :startDate::${handleDate}),  
              date_trunc('${dateCondition}', :endDate::${handleDate}),   
              '1 ${dateCondition}'                               
          ) AS series(${dateCondition})
      LEFT JOIN (
          SELECT
              date_trunc('${dateCondition}', "transactions"."AddDate") AS ${dateCondition},  
              
              COUNT(CASE WHEN "washType"."Name" = 'SILVER' THEN 1 END) AS "SILVERCount",
              COUNT(CASE WHEN "washType"."Name" = 'GOLD' THEN 1 END) AS "GOLDCount",
              COUNT(CASE WHEN "washType"."Name" = 'PLATINUM' THEN 1 END) AS "PLATINUMCount",
              SUM("transactions"."ElectricityUsed") AS "TotalElectricityUsed"  
          FROM 
              "transactions"
          JOIN 
              "machine" AS "Machine" ON "Machine"."MachineGuid" = "transactions"."MachineGuid"
          JOIN 
              "outlet" AS "Outlet" ON "Outlet"."outlet_id" = "Machine"."outlet_id"
          JOIN 
              "user" AS "User" ON "User"."user_id" = "Outlet"."dealer_id"
          JOIN 
              "wash_types" AS "washType" ON "washType"."Guid" = "transactions"."WashTypeGuid"
          WHERE 
              "transactions"."AddDate" BETWEEN :startDate AND :endDate
              ${whereClause}  -- Apply any additional filters here
          GROUP BY ${dateCondition}
      ) t ON series.${dateCondition} = t.${dateCondition}
      ORDER BY series.${dateCondition};

    `;
      return query;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAdminDashboardTreatedWaterGraphData(req: any, res: any) {
    try {
      let userId;
      // If the user's role is 'DEALER', set the userId to either the parentUserId (if it exists) or the userId of the current user.
      if (res.user.role === config.userRolesObject.DEALER) {
        userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }

      // Destructure query parameters from the request object.
      let { fromDate, toDate, machineIds, dealersIds, oemIds } = req.query;

      // Call the `getTotalWaterTreated` function to retrieve wash data based on the query parameters and user role.
      let washes = await this.getTotalWaterTreated(
        fromDate,
        toDate,
        userId,
        machineIds,
        dealersIds,
        oemIds,
        res.user.role
      );
      console.log(
        '🚀 ~ DashboardService ~ getAdminDashboardTreatedWaterGraphData ~ washes:',
        washes
      );
      // Calculate total values
      const result = washes.reduce(
        (acc: any, current: any) => {
          acc.WaterUsed += current.WaterUsed
            ? parseFloat(current.WaterUsed)
            : 0;
          acc.WaterWastage += current.WaterWastage
            ? parseFloat(current.WaterWastage)
            : 0;
          acc.WaterPrice += current.WaterPrice
            ? parseFloat(current.WaterPrice)
            : 0;

          return acc;
        },
        { WaterUsed: 0, WaterWastage: 0, WaterPrice: 0 }
      );

      // Format the result with two decimals
      const formattedResult = {
        WaterUsed: parseFloat(result.WaterUsed.toFixed(2)),
        WaterWastage: parseFloat(result.WaterWastage.toFixed(2)),
        WaterPrice: parseFloat(result.WaterPrice.toFixed(2)),
      };
      return formattedResult;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // wash Transaction count API for admin
  async getTotalWaterTreated(
    inputStartDate: Date,
    inputEndDate: Date,
    userId?: string,
    machineIds?: string,
    dealersIds?: string,
    oemIds?: string,
    role?: string
  ) {
    // const startDate = moment(inputStartDate).startOf('day').toISOString();
    const startDate = moment(inputStartDate)
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(inputEndDate).endOf('day').toISOString();

    // Validate date objects
    if (
      isNaN(new Date(startDate).getTime()) ||
      isNaN(new Date(endDate).getTime())
    ) {
      throw new Error('Invalid startDate or endDate');
    }

    const dateDiff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 3600 * 24)
    );

    const replacements: any = { startDate, endDate };

    let whereClauses: string[] = [];
    if (userId && isValidGuid(userId)) {
      whereClauses.push('"User"."user_id" = :userId');
      replacements.userId = userId;
    }

    if (dealersIds && dealersIds.length) {
      const dealerIdArray = dealersIds
        .split(',')
        .map((id: any) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id: any) => isValidGuid(id));
      if (dealerIdArray.length > 0) {
        replacements.dealerIds = dealerIdArray;
        whereClauses.push('"User"."user_id" = ANY(ARRAY[:dealerIds]::uuid[])');
      }
    }

    if (oemIds && oemIds.length) {
      const oemIdArray = oemIds
        .split(',')
        .map((id: any) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id: any) => isValidGuid(id));
      if (oemIdArray.length) {
        replacements.oemIds = oemIdArray;
        whereClauses.push('"User"."oem_id" = ANY(ARRAY[:oemIds]::uuid[])');
      }
    }

    if (machineIds) {
      const machineIdArray = machineIds
        .split(',')
        .map((id) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id) => isValidGuid(id));
      if (machineIdArray.length) {
        replacements.machineIds = machineIdArray;
        whereClauses.push(
          '"Machine"."MachineGuid" = ANY(ARRAY[:machineIds]::uuid[])'
        );
      }
    }

    if (role && role !== config.userRolesObject.ADMIN) {
      whereClauses.push('"transactions"."IsAssigned" = true');
    }

    const whereClause =
      whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

    let query = '';

    if (dateDiff > 140) {
      // Monthly intervals
      query = await this.treatedWaterQuery('month', whereClause);
    } else if (dateDiff > 31) {
      // Weekly intervals
      query = await this.treatedWaterQuery('week', whereClause);
    } else if (dateDiff > 1) {
      // Daily intervals
      query = await this.treatedWaterQuery('day', whereClause);
    } else {
      // Hourly intervals
      query = await this.treatedWaterQuery('hour', whereClause);
    }

    try {
      const transactionCounts = await db.sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });
      return transactionCounts;
    } catch (err) {
      console.error('Error in getTransactionCount:', err);
      throw err;
    }
  }

  async treatedWaterQuery(dateCondition: any, whereClause: any) {
    try {
      let handleDate = dateCondition === 'hour' ? 'timestamp' : 'date'
      let query = `
                   SELECT
                      series.${dateCondition} AT TIME ZONE 'UTC' AS date,
                      ROUND(COALESCE(AVG(t."WaterUsed"), 0), 2) AS "WaterUsed",
                      ROUND(COALESCE(AVG(t."WaterWastage"), 0), 2) AS "WaterWastage",
                      ROUND(COALESCE(AVG(t."WaterPrice"), 0), 2) AS "WaterPrice",
                      ROUND(COALESCE(AVG(t."PHValue"), 0), 2) AS "PHValue",
                      ROUND(COALESCE(AVG(t."TDSValue"), 0), 2) AS "TDSValue",
                      ROUND(COALESCE(AVG(t."TSSValue"), 0), 2) AS "TSSValue",
                      ROUND(COALESCE(AVG(t."OilAndGreaseValue"), 0), 2) AS "OilAndGreaseValue",
                      ROUND(COALESCE(AVG(t."CODValue"), 0), 2) AS "CODValue"
                  FROM generate_series(
                      date_trunc('${dateCondition}', :startDate::${handleDate}),
                      date_trunc('${dateCondition}', :endDate::${handleDate}),
                      '1 ${dateCondition}'
                  ) AS series(${dateCondition})
                  LEFT JOIN (
                      SELECT
                          date_trunc('${dateCondition}', "transactions"."AddDate") AS ${dateCondition},
                          "transactions"."WaterUsed",
                          "transactions"."WaterWastage",
                          "transactions"."WaterPrice",
                          "transactions"."PHValue",
                          "transactions"."TDSValue",
                          "transactions"."TSSValue",
                          "transactions"."OilAndGreaseValue",
                          "transactions"."CODValue"
                      FROM "transactions"
                      JOIN "machine" AS "Machine" ON "Machine"."MachineGuid" = "transactions"."MachineGuid"
                      JOIN "outlet" AS "Outlet" ON "Outlet"."outlet_id" = "Machine"."outlet_id"
                      JOIN "user" AS "User" ON "User"."user_id" = "Outlet"."dealer_id"
                      WHERE "transactions"."AddDate" BETWEEN :startDate AND :endDate
                      ${whereClause} 
                      GROUP BY ${dateCondition}, "transactions"."WaterUsed", "transactions"."WaterWastage", "transactions"."WaterPrice", "transactions"."PHValue", "transactions"."TDSValue", "transactions"."TSSValue", "transactions"."OilAndGreaseValue", "transactions"."CODValue"
                  ) t ON series.${dateCondition} = t.${dateCondition}
                  GROUP BY series.${dateCondition}
                  ORDER BY series.${dateCondition};

    `;
      return query;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAdminDealerGraphData(req: any, res: any) {
    try {
      let { fromDate, toDate, oemIds } = req.query;

      // Call the `getTotalDealer` function to retrieve wash data based on the query parameters and user role.
      let userData = await this.dealerShipCount(fromDate, toDate, oemIds);

      let result: any = {
        dealers: {},
        count: 0,
      };
      //sorting the in ascending order on date wise
      userData.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Transform the data
      userData.forEach((item: any) => {
        const userCount = parseInt(item?.user_count);
        // Convert the wash date to ISO format with the time set to the hour (removing minutes and seconds).
        let date = item?.date
          .toISOString()
          .replace(
            /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
            '$1T$2:$3:$4.000Z'
          ); // Extract date and time
        result.dealers[date] = userCount;
        result.count += userCount;
      });

      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  //get dealer ship count for graph data
  async dealerShipCount(
    inputStartDate: Date,
    inputEndDate: Date,
    oemIds?: string
  ) {
    // const startDate = moment(inputStartDate).startOf('day').toISOString();
    const startDate = moment(inputStartDate)
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss');

    const endDate = moment(inputEndDate).endOf('day').toISOString();

    // Validate date objects
    if (
      isNaN(new Date(startDate).getTime()) ||
      isNaN(new Date(endDate).getTime())
    ) {
      throw new Error('Invalid startDate or endDate');
    }

    const dateDiff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 3600 * 24)
    );

    const replacements: any = {
      startDate,
      endDate,
      role: config.userRolesObject.DEALER,
    }; // Added role here

    let whereClauses: string[] = [];

    if (oemIds && oemIds.length) {
      const oemIdArray = oemIds
        .split(',')
        .map((id: any) => id.trim()) // Ensure there are no leading/trailing spaces
        .filter((id: any) => isValidGuid(id));
      if (oemIdArray.length) {
        replacements.oemIds = oemIdArray;
        whereClauses.push('"user"."oem_id" = ANY(ARRAY[:oemIds]::uuid[])');
      }
    }

    const whereClause =
      whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

    let query = '';

    if (dateDiff > 140) {
      // Monthly intervals
      query = await this.dealerCountQuery('month', whereClause);
    } else if (dateDiff > 31) {
      // Weekly intervals
      query = await this.dealerCountQuery('week', whereClause);
    } else if (dateDiff > 1) {
      // Daily intervals
      query = await this.dealerCountQuery('day', whereClause);
    } else {
      // Hourly intervals
      query = await this.dealerCountQuery('hour', whereClause);
    }

    try {
      const transactionCounts = await db.sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });
      return transactionCounts;
    } catch (err) {
      console.error('Error in getTransactionCount:', err);
      throw err;
    }
  }

  async dealerCountQuery(dateCondition: any, whereClause: any) {
    try {
      let handleDate = dateCondition === 'hour' ? 'timestamp' : 'date'
      let query = `
                SELECT 
                  series.${dateCondition} AT TIME ZONE 'UTC' AS date,
                  COALESCE(COUNT(t."user_id"), 0) AS "user_count"
              FROM generate_series(
                  date_trunc('${dateCondition}', :startDate::${handleDate}),
                  date_trunc('${dateCondition}', :endDate::${handleDate}),
                  '1 ${dateCondition}'
              ) AS series(${dateCondition})
              LEFT JOIN (
                  SELECT 
                      date_trunc('${dateCondition}', "user"."createdAt") AS ${dateCondition},
                      "user"."createdAt",
                      "user"."user_id"
                  FROM "user"  -- Table name must be lowercase
                  WHERE "user"."createdAt" BETWEEN :startDate AND :endDate
                  AND "user"."parent_user_id" IS NULL
                  AND "user"."role" = :role
                  AND "user"."sub_role_id" IS NULL
                  AND "user"."deleted_at" IS NULL
                  ${whereClause}
                  GROUP BY ${dateCondition}, "user"."createdAt", "user"."user_id"
              ) t ON series.${dateCondition} = t.${dateCondition}
              GROUP BY series.${dateCondition}
              ORDER BY series.${dateCondition} DESC;
  `;
      return query;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getDealerElectricityGraphData(req: any, res: any) {
    try {
      let userId;
      // If the user's role is 'DEALER', set the userId to either the parentUserId (if it exists) or the userId of the current user.
      if (res.user.role === config.userRolesObject.DEALER) {
        userId = res.user.parentUserId
          ? res.user.parentUserId
          : res.user.userId;
      }

      // Destructure query parameters from the request object.
      let { fromDate, toDate, machineIds, dealersIds, oemIds } = req.query;

      // Call the `getTransactionCount` function to retrieve wash data based on the query parameters and user role.
      let washes = await this.getTransactionCount(
        fromDate,
        toDate,
        userId,
        machineIds,
        dealersIds,
        oemIds,
        res.user.role
      );
      

      // Initialize an empty `transactions` object to store wash counts by date for SILVER, GOLD, and PLATINUM.
      let transactions: any = {};

      // Iterate over the `washes` array to populate the `transactions` object.
      for (let i = 0; i < washes.length; i++) {
        // Convert the wash date to ISO format with the time set to the hour (removing minutes and seconds).
        let date = washes[i]?.date
          .toISOString()
          .replace(
            /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
            '$1T$2:$3:$4.000Z'
          );
        transactions[date] = parseInt(washes[i].TotalElectricityUsed);
      }

      // Return the output object.
      return transactions;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
export = new DashboardService();
