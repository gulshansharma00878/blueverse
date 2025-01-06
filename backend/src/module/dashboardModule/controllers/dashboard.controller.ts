import moment from 'moment';
import {
  dayWiseFilter,
  dealerCreationDayWise,
  dealerCreationHourly,
  getDealerAllTransactions,
  hourlyFilter,
  machineRunTimeDayWise,
  machineRunTimeHourly,
  machineWaterQualityDayWise,
  machineWaterQualityHourly,
} from '../../../services/commonService';
import { calculateAverage, isValidGuid } from '../../../common/utility';
import { config } from '../../../config/config';
import { User } from '../../../models/User/user';
import dashboardService from '../services/dashboard.service';
import createError from 'http-errors';
import { templateConstants } from '../../../common/templateConstants';
import { MachineRuntime } from '../../../models/Machine/MachineRuntime';
import { Op } from 'sequelize';
import { Machine } from '../../../models/Machine/Machine';
import { Outlet } from '../../../models/outlet';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { STATUS } from '../../../module/areaModule/constant';
import { OEM } from '../../../models/oem';
import { areaManagerService } from '../../../module/areaManagerModule/services/areaManager.service';

class DashboardController {
  //Dealer Dashboard APIS
  async getDealerWashes(req: any, res: any, next: any) {
    try {
      const dealerWashes = await dashboardService.getDashboardWashes(req, res);
      res.locals.response = {
        body: {
          data: dealerWashes,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealerTreatedWater(req: any, res: any, next: any) {
    try {
      const dealerTreatedWater =
        await dashboardService.getDashboardTreatedWater(req, res);
      res.locals.response = {
        body: {
          data: dealerTreatedWater,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealerElectricityConsumed(req: any, res: any, next: any) {
    try {
      // const userId = res.user.parentUserId
      //   ? res.user.parentUserId
      //   : res.user.userId;
      // let { fromDate, toDate, machineIds, oemIds } = req.query;
      // const oemIdArr = [];
      // if (oemIds) {
      //   for (const id of oemIds.split(',')) {
      //     if (isValidGuid(id)) {
      //       oemIdArr.push(id);
      //     }
      //   }
      // }
      // const { whereCondition, timeLimitFilter }: any =
      //   dashboardService.getDashboardFilter(req, 'AddDate');
      // const transactions = await getDealerAllTransactions(
      //   userId,
      //   whereCondition,
      //   machineIds,
      //   [],
      //   config.userRolesObject.DEALER,
      //   oemIdArr
      // );

      // res.locals.response = {
      //   body: {
      //     data: dashboardService.electricityConsumedFilter(
      //       transactions,
      //       timeLimitFilter,
      //       fromDate,
      //       toDate
      //     ),
      //   },
      // };
      const dealerElectricityGraph =
        await dashboardService.getDealerElectricityGraphData(req, res);
      res.locals.response = {
        body: {
          data: dealerElectricityGraph,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealerWaterQuality(req: any, res: any, next: any) {
    try {
      const userId = res.user.parentUserId
        ? res.user.parentUserId
        : res.user.userId;
      let filterType = 'PHValue';
      if (
        [
          'PHValue',
          'TDSValue',
          'TSSValue',
          'OilAndGreaseValue',
          'CODValue',
        ].includes(req.query.type)
      ) {
        filterType = req.query.type;
      }

      let { fromDate, toDate, machineIds, oemIds } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');
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
        [],
        config.userRolesObject.DEALER,
        oemIdArr
      );
      const lastFiveTransactionData = {
        ph: 0,
        tds: 0,
        tss: 0,
        oilAndGrease: 0,
        cod: 0,
        updatedAt: '',
      };
      if (transactions.length) {
        lastFiveTransactionData.oilAndGrease += transactions[0].dataValues
          .OilAndGreaseValue
          ? Number(transactions[0].dataValues.OilAndGreaseValue)
          : 0;
        lastFiveTransactionData.ph += transactions[0].dataValues.PHValue
          ? Number(transactions[0].dataValues.PHValue)
          : 0;
        lastFiveTransactionData.tds += transactions[0].dataValues.TDSValue
          ? Number(transactions[0].dataValues.TDSValue)
          : 0;
        lastFiveTransactionData.tss += transactions[0].dataValues.TSSValue
          ? Number(transactions[0].dataValues.TSSValue)
          : 0;
        lastFiveTransactionData.cod += transactions[0].dataValues.CODValue
          ? Number(transactions[0].dataValues.CODValue)
          : 0;
        lastFiveTransactionData.updatedAt =
          transactions[0].dataValues.updatedAt;
      }

      let transaction: any = {};
      // if (transactions.length) {
      //   if (timeLimitFilter === 'DAYS') {
      //     let filterDate = dayWiseFilter(fromDate, toDate);
      //     for (const date of Object.keys(filterDate)) {
      //       filterDate[date] = [];
      //     }
      //     transaction = machineWaterQualityDayWise(
      //       transactions,
      //       filterDate,
      //       filterType
      //     );
      //   } else {
      //     let filterDate = hourlyFilter(fromDate, toDate);
      //     for (const date of Object.keys(filterDate)) {
      //       filterDate[date] = [];
      //     }
      //     transaction = machineWaterQualityHourly(
      //       filterDate,
      //       transactions,
      //       filterType
      //     );
      //   }
      // }
      // for (const date of Object.keys(transaction)) {
      //   transaction[date] = calculateAverage(transaction[date]);
      // }
      let washes: any = await dashboardService.getTotalWaterTreated(
        fromDate,
        toDate,
        userId,
        machineIds,
        '',
        oemIds,
        config.userRolesObject.DEALER
      );

      for (let i = 0; i < washes.length; i++) {
        // Convert the wash date to ISO format with the time set to the hour (removing minutes and seconds).
        let date = washes[i].date
          .toISOString()
          .replace(
            /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
            '$1T$2:00:00.000Z'
          );

        // Assign the value of the specified filterType (like PHValue, TDSValue, etc.)
        transaction[date] = parseFloat(washes[i][filterType]);
      }

      res.locals.response = {
        body: {
          data: {
            transactions: transaction,
            lastFiveTransactionData: lastFiveTransactionData,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealerMachineRuntime(req: any, res: any, next: any) {
    try {
      const machineId = req.query.machineId;
      let { fromDate, toDate } = req.query;
      let transaction = {};
      if (machineId) {
        const machineRuntime = await MachineRuntime.findAll({
          where: {
            MachineGuid: machineId,
            RunTimeDate: {
              [Op.between]: [
                moment(fromDate).startOf('day').toISOString(),
                moment(toDate).endOf('day').toISOString(),
              ],
            },
          },
          raw: true,
          order: [['RunTimeDate', 'ASC']],
        });
        if (machineRuntime.length) {
          let filterDate = dayWiseFilter(fromDate, toDate);
          transaction = machineRunTimeDayWise(machineRuntime, filterDate);
        }
      }

      res.locals.response = {
        body: {
          data: transaction,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  //Admin Dashboard APIS
  async getAdminMachineList(req: any, res: any, next: any) {
    try {
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        null
      );
      res.locals.response = {
        body: {
          data: machines,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAdminWashes(req: any, res: any, next: any) {
    try {
      const adminWashes = await dashboardService.getAdminDashboardGraphData(
        req,
        res
      );
      res.locals.response = {
        body: {
          data: adminWashes,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAdminTreatedWater(req: any, res: any, next: any) {
    try {
      const adminTreatedWater =
        await dashboardService.getAdminDashboardTreatedWaterGraphData(req, res);
      res.locals.response = {
        body: {
          data: adminTreatedWater,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAdminDealershipCount(req: any, res: any, next: any) {
    try {
      const adminDealershipCount =
        await dashboardService.getAdminDealerGraphData(req, res);
      res.locals.response = {
        body: {
          data: adminDealershipCount,
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }
  async getAdminOEMMachines(req: any, res: any, next: any) {
    try {
      const userWhereCondition: any = {
        parentUserId: null,
        role: config.userRolesObject.DEALER,
        subRoleId: null,
        deletedAt: null,
      };
      const oemId = req.query.oemId;
      if (oemId && isValidGuid(oemId)) {
        userWhereCondition['oemId'] = oemId;
      }
      const machines = await Machine.findAll({
        attributes: ['machineGuid', 'name', 'status'],
        where: { isAssigned: true },
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'name', 'address'],
            where: { status: STATUS.ACTIVE },
            include: [
              {
                model: User,
                attributes: [
                  'username',
                  'userId',
                  'email',
                  'uniqueId',
                  'oemId',
                ],
                where: userWhereCondition,
                include: [
                  {
                    model: OEM,
                    attributes: ['oemId', 'name', 'status'],
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
        ],
      });
      res.locals.response = {
        body: {
          data: { dealers: machines },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  //OEM Manager APIS
  async getOEMManagerWashes(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');
      let { fromDate, toDate, dealerIds, machineIds, oemIds } = req.query;
      let dealers = [];
      if (dealerIds) {
        let arr = [];
        for (const id of dealerIds.split(',')) {
          if (isValidGuid(id)) {
            arr.push(id);
          }
        }
        if (arr.length) dealers = arr;
      }
      if (!dealers.length) {
        dealers = await dashboardService.getOemManagerDealership(
          res.user.userId
        );
      }
      const oemIdArr = [];
      if (oemIds) {
        for (const id of oemIds.split(',')) {
          if (isValidGuid(id)) {
            oemIdArr.push(id);
          }
        }
      }
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      //getting all machines which belongs to the area manager city
      const machineArr = [];
      if (machineIds) {
        for (const id of machineIds.split(',')) {
          if (isValidGuid(id)) {
            machineArr.push(id);
          }
        }
      }
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        dealers,
        cityIds,
        machineArr
      );
      // Initialize a variable to track the total washes for specific wash types (SILVER, GOLD, PLATINUM).
      let totalWashes = 0;

      // Initialize an empty `transactions` object to store wash counts by date for SILVER, GOLD, and PLATINUM.
      let transactions: any = {
        SILVER: {},
        GOLD: {},
        PLATINUM: {},
      };
      // Create the final output object containing the total washes and the transactions grouped by date.
      let output = {
        totalWashes: totalWashes, // Total count of all SILVER, GOLD, and PLATINUM washes
        transactions: transactions, // Transaction details grouped by wash type and date
      };
      if (machines.length) {
        let machineIds: any = [];
        machines.forEach((el) => {
          machineIds.push(el.machineGuid);
        });

        // Call the `getTransactionCount` function to retrieve wash data based on the query parameters and user role.
        let washes = await dashboardService.getTransactionCount(
          fromDate,
          toDate,
          '',
          machineIds.join(','),
          dealers.join(','),
          oemIds,
          config.userRolesObject.OEM
        );
        // transactions = await getDealerAllTransactions(
        //   '',
        //   whereCondition,
        //   machineIds.join(','),
        //   dealers,
        //   config.userRolesObject.OEM,
        //   oemIdArr
        // );

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

        output = {
          totalWashes: totalWashes, // Total count of all SILVER, GOLD, and PLATINUM washes
          transactions: transactions, // Transaction details grouped by wash type and date
        };
      }
      // const washes = dashboardService.getWashes(
      //   fromDate,
      //   toDate,
      //   transactions,
      //   timeLimitFilter
      // );
      res.locals.response = {
        body: {
          data: output,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getOEMManagerDealers(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      let { fromDate, toDate } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'createdAt');

      const oemDealer = await dashboardService.getOemManagerDealership(
        res.user.userId
      );
      const { dealers, dealerships } =
        await dashboardService.dealerCreationForOEMAndArea(
          oemDealer,
          whereCondition,
          timeLimitFilter,
          fromDate,
          toDate
        );
      res.locals.response = {
        body: {
          data: { dealers: dealerships, count: dealers.length },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getOEMManagerElectricityConsumed(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      let { fromDate, toDate, machineIds, oemIds, dealerIds } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');

      let oemDealer: any = [];
      if (dealerIds) {
        let arr = [];
        for (const id of dealerIds.split(',')) {
          if (isValidGuid(id)) {
            arr.push(id);
          }
        }
        if (arr.length) oemDealer = arr;
      }
      if (!oemDealer.length) {
        oemDealer = await dashboardService.getOemManagerDealership(
          res.user.userId
        );
      }

      // const oemDealer = await dashboardService.getOemManagerDealership(
      //   res.user.userId
      // );

      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      //getting all machines which belongs to the area manager city
      const machineArr = [];
      if (machineIds) {
        for (const id of machineIds.split(',')) {
          if (isValidGuid(id)) {
            machineArr.push(id);
          }
        }
      }
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        oemDealer,
        cityIds,
        machineArr
      );
      const oemIdArr = [];
      if (oemIds) {
        for (const id of oemIds.split(',')) {
          if (isValidGuid(id)) {
            oemIdArr.push(id);
          }
        }
      }
      let transactions: any = {};
      if (machines.length) {
        let machineIds: any = [];
        machines.forEach((el) => {
          machineIds.push(el.machineGuid);
        });
        // transactions = await getDealerAllTransactions(
        //   '',
        //   whereCondition,
        //   machineIds.join(','),
        //   oemDealer,
        //   config.userRolesObject.OEM,
        //   oemIdArr
        // );

        // Call the `getTransactionCount` function to retrieve wash data based on the query parameters and user role.
        let washes = await dashboardService.getTransactionCount(
          fromDate,
          toDate,
          '',
          machineIds.join(','),
          oemDealer.join(','),
          oemIds,
          config.userRolesObject.OEM
        );

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
      }

      res.locals.response = {
        body: {
          data: transactions,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getOEMManagerTreatedWater(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      let { machineIds, dealerIds } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');

      let oemDealer: any = [];
      if (dealerIds) {
        let arr = [];
        for (const id of dealerIds.split(',')) {
          if (isValidGuid(id)) {
            arr.push(id);
          }
        }
        if (arr.length) oemDealer = arr;
      }
      if (!oemDealer.length) {
        oemDealer = await dashboardService.getOemManagerDealership(
          res.user.userId
        );
      }

      // const oemDealer = await dashboardService.getOemManagerDealership(
      //   res.user.userId
      // );

      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      //getting all machines which belongs to the area manager city
      const machineArr = [];
      if (machineIds) {
        for (const id of machineIds.split(',')) {
          if (isValidGuid(id)) {
            machineArr.push(id);
          }
        }
      }
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        oemDealer,
        cityIds,
        machineArr
      );
      let data: any = [];
      if (machines.length) {
        let machineIds: any = [];
        machines.forEach((el) => {
          machineIds.push(el.machineGuid);
        });
        data = await dashboardService.getTreatedWaterAreaAndOEMManager(
          oemDealer,
          whereCondition,
          machineIds.join(','),
          res.user.role
        );
      }
      res.locals.response = {
        body: {
          data: data,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getOEMManagerMachines(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      const oemDealer = await dashboardService.getOemManagerDealership(
        res.user.userId
      );
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      //getting all machines which belongs to the area manager city
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        oemDealer,
        cityIds
      );
      res.locals.response = {
        body: {
          data: machines,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getOEMManagerTopDealership(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      let { fromDate, toDate } = req.query;

      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          fromDate = moment(fromDate).startOf('day').toISOString();
          toDate = moment(toDate).endOf('day').toISOString();
        }
      }
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      let oemDealer = await dashboardService.getOemManagerDealership(
        res.user.userId
      );
      let _oemDealer: any = [];
      oemDealer.forEach((el) => {
        _oemDealer.push("'" + el + "'");
      });
      //getting all machines which belongs to the area manager city
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        oemDealer,
        cityIds
      );
      let transaction: any = [[]];
      if (machines.length) {
        let machineIds: any = [];
        machines.forEach((el) => {
          machineIds.push("'" + el.machineGuid + "'");
        });

        if (_oemDealer.length) {
          transaction = await dashboardService.topDealershipTransactionsQuery(
            _oemDealer,
            fromDate,
            toDate,
            machineIds.join(',')
          );
        }
      }
      res.locals.response = {
        body: {
          data: transaction[0],
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  async getOEMWaterQuality(req: any, res: any, next: any) {
    try {
      // Check if the user role is OEM, otherwise throw an error
      if (res.user.role !== config.userRolesObject.OEM) {
        throw createError(400, templateConstants.INVALID('user'));
      }

      // Extract query parameters
      let { fromDate, toDate, machineIds, oemIds, dealerIds } = req.query;

      // Get filter conditions based on the request
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');

      let oemDealer: any = [];
      if (dealerIds) {
        let arr = [];
        for (const id of dealerIds.split(',')) {
          if (isValidGuid(id)) {
            arr.push(id);
          }
        }
        if (arr.length) oemDealer = arr;
      }
      if (!oemDealer.length) {
        oemDealer = await dashboardService.getOemManagerDealership(
          res.user.userId
        );
      }

      // Get the OEM manager's dealership information
      // const oemDealer = await dashboardService.getOemManagerDealership(
      //   res.user.userId
      // );

      // Get the cities managed by the OEM manager
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);

      // Initialize an array to hold valid machine IDs
      const machineArr = [];
      if (machineIds) {
        for (const id of machineIds.split(',')) {
          if (isValidGuid(id)) {
            machineArr.push(id);
          }
        }
      }

      // Retrieve machines based on area and OEM manager
      const machines = await dashboardService.getMachinesForAreaAndOEMManager(
        oemDealer,
        cityIds,
        machineArr
      );

      // Collect machine GUIDs
      let assigneMachineIds: any = [];
      if (machines.length) {
        machines.forEach((el) => {
          assigneMachineIds.push(el.machineGuid);
        });
      }
      const oemIdArr = [];
      if (oemIds) {
        for (const id of oemIds.split(',')) {
          if (isValidGuid(id)) {
            oemIdArr.push(id);
          }
        }
      }
      // Set the default filter type to 'PHValue' and check for other valid types
      let filterType = 'PHValue';
      if (
        [
          'PHValue',
          'TDSValue',
          'TSSValue',
          'OilAndGreaseValue',
          'CODValue',
        ].includes(req.query.type)
      ) {
        filterType = req.query.type;
      }

      // Fetch transactions based on the provided filters
      const transactions = await getDealerAllTransactions(
        '',
        whereCondition,
        assigneMachineIds.join(','),
        oemDealer,
        config.userRolesObject.OEM,
        oemIdArr
      );

      // Initialize an object to store the last five transaction data
      const lastFiveTransactionData = {
        ph: 0,
        tds: 0,
        tss: 0,
        oilAndGrease: 0,
        cod: 0,
        updatedAt: '',
      };

      // If transactions exist, update the last five transaction data
      if (transactions.length) {
        lastFiveTransactionData.oilAndGrease += transactions[0].dataValues
          .OilAndGreaseValue
          ? Number(transactions[0].dataValues.OilAndGreaseValue)
          : 0;
        lastFiveTransactionData.ph += transactions[0].dataValues.PHValue
          ? Number(transactions[0].dataValues.PHValue)
          : 0;
        lastFiveTransactionData.tds += transactions[0].dataValues.TDSValue
          ? Number(transactions[0].dataValues.TDSValue)
          : 0;
        lastFiveTransactionData.tss += transactions[0].dataValues.TSSValue
          ? Number(transactions[0].dataValues.TSSValue)
          : 0;
        lastFiveTransactionData.cod += transactions[0].dataValues.CODValue
          ? Number(transactions[0].dataValues.CODValue)
          : 0;
        lastFiveTransactionData.updatedAt =
          transactions[0].dataValues.updatedAt;
      }

      // Initialize an object to store the transaction data
      let transaction: any = {};
      // if (transactions.length) {
      //   // Filter the transaction data based on the time limit filter (DAYS or HOURLY)
      //   if (timeLimitFilter === 'DAYS') {
      //     let filterDate = dayWiseFilter(fromDate, toDate);
      //     for (const date of Object.keys(filterDate)) {
      //       filterDate[date] = [];
      //     }
      //     transaction = machineWaterQualityDayWise(
      //       transactions,
      //       filterDate,
      //       filterType
      //     );
      //   } else {
      //     let filterDate = hourlyFilter(fromDate, toDate);
      //     for (const date of Object.keys(filterDate)) {
      //       filterDate[date] = [];
      //     }
      //     transaction = machineWaterQualityHourly(
      //       filterDate,
      //       transactions,
      //       filterType
      //     );
      //   }
      // }

      // // Calculate the average values for each date in the transaction data
      // for (const date of Object.keys(transaction)) {
      //   transaction[date] = calculateAverage(transaction[date]);
      // }

      let washes: any = await dashboardService.getTotalWaterTreated(
        fromDate,
        toDate,
        '',
        assigneMachineIds.join(','),
        oemDealer.join(','),
        oemIds,
        config.userRolesObject.OEM
      );

      for (let i = 0; i < washes.length; i++) {
        // Convert the wash date to ISO format with the time set to the hour (removing minutes and seconds).
        let date = washes[i].date
          .toISOString()
          .replace(
            /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
            '$1T$2:00:00.000Z'
          );

        // Assign the value of the specified filterType (like PHValue, TDSValue, etc.)
        transaction[date] = parseFloat(washes[i][filterType]);
      }

      // Set the response data
      res.locals.response = {
        body: {
          data: {
            transactions: transaction,
            lastFiveTransactionData: lastFiveTransactionData,
          },
        },
      };

      // Call the next middleware
      next();
    } catch (err) {
      // Handle any errors
      next(err);
    }
  }

  //Area Manager APIS
  async getAreaManagerDealerships(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      const dealers = await dashboardService.dealersOfAreaManager(
        res.user.userId,
        cityIds
      );
      res.locals.response = {
        body: {
          data: dealers,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAreaManagerMachines(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      let whereCondition = {};
      if (cityIds) {
        whereCondition = {
          cityId: { [Op.in]: cityIds },
        };
      }
      const dealers: any = await areaManagerService.getAreaManagerDealerDetails(
        res.user.userId,
        whereCondition
      );

      // const dealers = await dashboardService.dealersOfAreaManager(
      //   res.user.userId,
      //   cityIds
      // );
      let machines: any = [];
      if (dealers) {
        const dealerIds = dealers.areaManagerDealers.map(
          (el: any) => el.dealer.userId
        );
        machines = await dashboardService.getMachinesForAreaAndOEMManager(
          dealerIds,
          cityIds
        );
      }
      // let whereCondition = {};
      // if (cityIds) {
      //   whereCondition = {
      //     cityId: { [Op.in]: cityIds },
      //   };
      // }
      // const dealers2 = await areaManagerService.getAreaManagerDealerDetails(
      //   res.user.userId,
      //   whereCondition
      // );
      res.locals.response = {
        body: {
          data: {
            dealers,
            machines,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAreaManagerTreatedWater(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      let { machineIds } = req.query;
      const { whereCondition }: any = dashboardService.getDashboardFilter(
        req,
        'AddDate'
      );
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      const dealers = await dashboardService.dealersOfAreaManager(
        res.user.userId,
        cityIds
      );
      let data: any = [];
      if (dealers) {
        const dealerIds = dealers.map((el) => el.userId);

        const machineArr = [];
        if (machineIds) {
          for (const id of machineIds.split(',')) {
            if (isValidGuid(id)) {
              machineArr.push(id);
            }
          }
        }

        //getting all machines which belongs to the area manager city
        const machines = await dashboardService.getMachinesForAreaAndOEMManager(
          dealerIds,
          cityIds,
          machineArr
        );
        if (machines.length) {
          let dbMachineIds: any = [];
          machines.forEach((el) => {
            dbMachineIds.push(el.machineGuid);
          });

          data = await dashboardService.getTreatedWaterAreaAndOEMManager(
            dealerIds,
            whereCondition,
            dbMachineIds.join(','),
            res.user.role
          );
        }
      }
      res.locals.response = {
        body: {
          data: data,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAreaManagerElectricityConsumed(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }

      let { fromDate, toDate, machineIds, oemIds } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');

      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      const dealers = await dashboardService.dealersOfAreaManager(
        res.user.userId,
        cityIds
      );
      let transactions: any = [];
      if (dealers) {
        const machineArr = [];
        if (machineIds) {
          for (const id of machineIds.split(',')) {
            if (isValidGuid(id)) {
              machineArr.push(id);
            }
          }
        }
        const dealerIds = dealers.map((el) => el.userId);
        //getting all machines which belongs to the area manager city
        const machines = await dashboardService.getMachinesForAreaAndOEMManager(
          dealerIds,
          cityIds,
          machineArr
        );
        const oemIdArr = [];
        if (oemIds) {
          for (const id of oemIds.split(',')) {
            if (isValidGuid(id)) {
              oemIdArr.push(id);
            }
          }
        }
        if (machines.length) {
          const dbMachineIds = machines.map((el) => el.machineGuid);
          transactions = await getDealerAllTransactions(
            '',
            whereCondition,
            dbMachineIds.join(','),
            dealerIds,
            config.userRolesObject.AREA_MANAGER,
            oemIdArr
          );
        }
      }

      res.locals.response = {
        body: {
          data: dashboardService.electricityConsumedFilter(
            transactions,
            timeLimitFilter,
            fromDate,
            toDate
          ),
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAreaManagerDealerCount(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }

      let { fromDate, toDate } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'createdAt');

      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      const _dealers = await dashboardService.dealersOfAreaManager(
        res.user.userId,
        cityIds
      );
      const dealerIds = _dealers.map((el) => el.userId);
      const { dealerships, dealers }: any =
        await dashboardService.dealerCreationForOEMAndArea(
          dealerIds,
          whereCondition,
          timeLimitFilter,
          fromDate,
          toDate
        );

      res.locals.response = {
        body: {
          data: { dealers: dealerships, count: dealers.length },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAreaManagerWashes(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }

      let { fromDate, toDate, dealerIds, machineIds, oemIds } = req.query;
      const { whereCondition, timeLimitFilter }: any =
        dashboardService.getDashboardFilter(req, 'AddDate');
      let dealers = [];
      if (dealerIds) {
        let arr = [];
        for (const id of dealerIds.split(',')) {
          if (isValidGuid(id)) {
            arr.push(id);
          }
        }
        if (arr.length) dealers = arr;
      }
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      if (!dealers.length) {
        const _dealers = await dashboardService.dealersOfAreaManager(
          res.user.userId,
          cityIds
        );
        dealers = _dealers.map((el) => el.userId);
      }
      const oemIdArr = [];
      if (oemIds) {
        for (const id of oemIds.split(',')) {
          if (isValidGuid(id)) {
            oemIdArr.push(id);
          }
        }
      }
      let washes: any = [];
      if (dealers) {
        let machineIdsStr: string = '';
        if (machineIds) {
          machineIdsStr = machineIds;
        } else {
          //getting all machines which belongs to the area manager city
          const machines =
            await dashboardService.getMachinesForAreaAndOEMManager(
              dealerIds,
              cityIds
            );
          machineIdsStr = machines.map((el) => el.machineGuid).join(',');
        }
        if (machineIdsStr != '') {
          const transactions = await getDealerAllTransactions(
            '',
            whereCondition,
            machineIdsStr,
            dealers,
            config.userRolesObject.AREA_MANAGER,
            oemIdArr
          );
          washes = dashboardService.getWashes(
            fromDate,
            toDate,
            transactions,
            timeLimitFilter
          );
        }
      }
      res.locals.response = {
        body: {
          data: washes,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getAreaManagerTopDealerships(req: any, res: any, next: any) {
    try {
      if (res.user.role !== config.userRolesObject.AREA_MANAGER) {
        throw createError(400, templateConstants.INVALID('user'));
      }
      let { fromDate, toDate } = req.query;

      if (fromDate && toDate) {
        if (moment(fromDate).isValid() && moment(toDate).isValid()) {
          fromDate = moment(fromDate).startOf('day').toISOString();
          toDate = moment(toDate).endOf('day').toISOString();
        }
      }
      const cityIds = await dashboardService.areaManagerCities(res.user.userId);
      const _dealers = await dashboardService.dealersOfAreaManager(
        res.user.userId,
        cityIds
      );
      let areaDealer: any = [];
      let dealerIds: any = [];
      _dealers.forEach((el) => {
        dealerIds.push(el.userId);
        areaDealer.push("'" + el.userId + "'");
      });
      let transaction: any = [[]];
      if (areaDealer.length) {
        //getting all machines which belongs to the area manager city
        const machines = await dashboardService.getMachinesForAreaAndOEMManager(
          dealerIds,
          cityIds
        );
        if (machines.length) {
          let machineIds: any = [];
          machines.forEach((el) => {
            machineIds.push("'" + el.machineGuid + "'");
          });

          transaction = await dashboardService.topDealershipTransactionsQuery(
            areaDealer,
            fromDate,
            toDate,
            machineIds
          );
        }
      }
      res.locals.response = {
        body: {
          data: transaction[0],
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  async getDealersMachines(req: any, res: any, next: any) {
    try {
      const dealersArr: any = [];
      const dealersObj = {
        dealerId: '',
        dealerName: '',
        dealerCreatedAt: '',
        machineCount: 0,
      };
      const dealers = await dashboardService.getDealersList(req);

      for (const dealer of dealers) {
        const machineCount: any = await dashboardService.getDealerMachineCount(
          dealer.outlets
        );
        if (machineCount > 0) {
          const tempObj = {
            ...dealersObj,
            dealerId: dealer.userId,
            dealerName: dealer.username,
            dealerCreatedAt: dealer.createdAt,
            machineCount: machineCount,
          };
          dealersArr.push(tempObj);
        }
      }

      res.locals.response = {
        body: {
          data: dealersArr,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getAdminAllGraphData(req: any, res: any, next: any) {
    try {
      const adminGraphData =
        await dashboardService.getAdminDashboardTreatedWaterGraphData(req, res);
      res.locals.response = {
        body: {
          data: adminGraphData,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const dashboardController = new DashboardController();
export { dashboardController };
