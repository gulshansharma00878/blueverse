import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined } from '../../../common/utility';
import { ReferAndEarnService } from '../services/referAndEarn.service';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';

import { config } from '../../../config/config';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
import moment from 'moment';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import db from '../../../models';
import { Op } from 'sequelize';

class ReferAndEarnController {
  private referAndEarnService: typeof ReferAndEarnService;

  constructor() {
    this.referAndEarnService = ReferAndEarnService;
  }

  async createReferAndEarn(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        referAndEarnName,
        referAndEarnDescription,
        startDate,
        endDate,
        rewardForReferee,
        rewardForNewUser,
        rewardTypeForNewUser,
        rewardTypeForReferee,
      } = dataFromRequest(req); // Extract data from request
      const body = {
        referAndEarnName: referAndEarnName,
        referAndEarnDescription: referAndEarnDescription,
        startDate: startDate,
        endDate: endDate,
        rewardForReferee: rewardForReferee,
        rewardForNewUser: rewardForNewUser,
        rewardTypeForReferee: rewardTypeForReferee,
        rewardTypeForNewUser: rewardTypeForNewUser,
      };

      // Calling the service
      const brandData = await this.referAndEarnService.createReferAndEarn(body);

      // Prepare response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Refer And Earn'),
        body: {
          data: {
            brandData: brandData,
          },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  async getReferAndEarnById(req: Request, res: Response, next: NextFunction) {
    try {
      const { referAndEarnId } = dataFromRequest(req);
      // Calling the service
      const referAndEarnData =
        await this.referAndEarnService.getReferAndEarnById(referAndEarnId);

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Refer And Earn'),
        body: {
          data: { referAndEarnData: referAndEarnData },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  // Method to update the details of a specific brand
  async updateReferAndEarn(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        referAndEarnName,
        referAndEarnDescription,
        startDate,
        endDate,
        rewardForReferee,
        rewardForNewUser,
        rewardTypeForNewUser,
        rewardTypeForReferee,
        referAndEarnId,
      } = dataFromRequest(req); // Extract data from request
      const body = {
        referAndEarnName: referAndEarnName,
        referAndEarnDescription: referAndEarnDescription,
        startDate: startDate,
        endDate: endDate,
        rewardForReferee: rewardForReferee,
        rewardForNewUser: rewardForNewUser,
        rewardTypeForReferee: rewardTypeForReferee,
        rewardTypeForNewUser: rewardTypeForNewUser,
      };

      await this.referAndEarnService.updateReferAndEarn(body, referAndEarnId); // Call service method to update brand details
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Refer And Earn'),
        body: {},
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
  // Method to delete a specific additional service
  async deleteReferAndEarn(req: Request, res: Response, next: NextFunction) {
    try {
      const { referAndEarnId } = dataFromRequest(req); // Extract brand ID from request
      await this.referAndEarnService.deleteReferAndEarn(referAndEarnId); // Call service method to delete refer and earn

      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Refer And Earn'),
        body: {},
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async getReferrerList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, sortBy, orderBy, search, referAndEarnId } =
        dataFromRequest(req);

      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        search: search,
        limit: _limit,
        offset: _offset,
        referAndEarnId: referAndEarnId,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Calling the service
      const referrerData = await this.referAndEarnService.getReferrerList(
        queryBody
      );

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Referrer'),
        body: {
          data: {
            referrerData: referrerData.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              referrerData.count.length
            ), // Format pagination data
          },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  async getReferredUserList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, search, customerId, referAndEarnId } =
        dataFromRequest(req);

      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        search: search,
        limit: _limit,
        offset: _offset,
        referrerId: customerId,
        referAndEarnId: referAndEarnId,
      };

      // Calling the service
      const referredData = await this.referAndEarnService.getReferredUserList(
        queryBody
      );

      // // Calling the service
      const referrerdData = await this.referAndEarnService.getReferrerDetails(
        customerId
      );

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Referred User'),
        body: {
          data: {
            referrerData: referredData.rows,
            data: referrerdData,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              referredData.count
            ), // Format pagination data
          },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  async exportReferrerCollectionReport(req: any, res: any, next: any) {
    try {
      const { sortBy, orderBy, search } = dataFromRequest(req);

      const queryBody = {
        search: search,
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Fetch customer data based on the request parameters
      const referrerData = await this.referAndEarnService.getReferrerList(
        queryBody
      );

      let data: any = referrerData.rows;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        let bonusType: any;
        let bonus: any;
        if (data[i]?.dataValues?.totalWashBonus > 0) {
          bonusType = 'Washes';
          bonus = `${data[i]?.dataValues?.totalWashBonus}`;
          if (data[i]?.dataValues?.totalAmountBonus > 0) {
            bonusType = bonusType + ' ' + '&' + ' ' + 'Amount';
            bonus = bonus + '&' + `${data[i]?.dataValues?.totalAmountBonus}`;
          }
        } else {
          bonusType = 'Amount';
          bonus = `${data[i]?.dataValues?.totalAmountBonus}`;
        }

        result.push({
          'Sr.No': i + 1, // Serial number
          'Referee Name': `${data[i]?.dataValues?.referrer.firstName} ${data[i]?.referrer.lastName}`,
          'Referral Code': data[i]?.dataValues?.referrer.userReferralCode,
          'Total Referral Sent': data[i]?.dataValues?.totalReferrals,
          'Total Downloads': data[i]?.dataValues?.totalDownloads,
          'Bonus Type': bonusType,
          'Total Bonus Credited': bonus, // Number of vehicles added by the customer
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Referee Name',
        'Referral Code',
        'Total Referral Sent',
        'Total Downloads',
        'Bonus Type',
        'Total Bonus Credited',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'RefereeCollection.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('Referee details'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportReferredCollectionReport(req: any, res: any, next: any) {
    try {
      const { search, customerId } = dataFromRequest(req);

      const queryBody = {
        search: search,
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        referrerId: customerId,
      };

      // Calling the service
      const referrerData = await this.referAndEarnService.getReferredUserList(
        queryBody
      );

      let data: any = referrerData.rows;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          'Reference Name': `${data[i]?.dataValues?.referred?.firstName} ${data[i]?.referred?.lastName}`,
          'Email ID': isNullOrUndefined(data[i]?.dataValues?.referred?.email)
            ? ' '
            : data[i]?.dataValues?.referred?.email,
          'Phone Number': data[i]?.dataValues?.referred?.phone,
          'Referral Date': data[i]?.dataValues?.createdAt,
          'Expiry Date': data[i]?.dataValues?.expiryDate,
          Downloaded: data[i]?.dataValues?.isDownload,
          'Booked Services': data[i]?.dataValues?.isBooked,
          Status: data[i]?.dataValues?.status,
          'Total Bonus Credited': data[i]?.dataValues?.referredUserBonus,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Reference Name',
        'Email ID',
        'Phone Number',
        'Referral Date',
        'Expiry Date',
        'Downloaded',
        'Booked Services',
        'Status',
        'Total Bonus Credited',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'ReferredCollection.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('Referred user details'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  async getAllReferAndEarn(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, sortBy, orderBy, search } = dataFromRequest(req);

      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        search: search,
        limit: _limit,
        offset: _offset,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };
      // Calling the service
      const { count, rows } = await this.referAndEarnService.getAllReferAndEarn(
        queryBody
      );

      res.locals.response = {
        message: templateConstants.LIST_OF('ReferAndEarn'),
        body: {
          data: {
            referAndEarnData: rows,
            pagination: paginatorService(_limit, _offset / _limit + 1, count), // Format pagination data
          },
        },
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async exportReferredAndEarnSettingCollectionReport(
    req: any,
    res: any,
    next: any
  ) {
    try {
      const { sortBy, orderBy, search } = dataFromRequest(req);

      const queryBody = {
        search: search,
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Calling the service
      // Calling the service
      const { count, rows } = await this.referAndEarnService.getAllReferAndEarn(
        queryBody
      );

      let data: any = rows;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          'Referral Name': `${data[i]?.referAndEarnName}`,
          'Total Referral Sent': data[i]?.totalReferrals,
          'Total Downloads': data[i]?.totalDownloads,
          'Start Date': moment(data[i]?.startDate).format('YYYY-MM-DD'),
          'End Date': moment(data[i]?.endDate).format('YYYY-MM-DD'),
          'Bonus Type':
            `${data[i]?.rewardTypeForReferee}` +
            ' & ' +
            `${data[i]?.rewardTypeForNewUser}`,
          'Total Bonus Credited':
            `${data[i]?.rewardForReferee}` +
            ' & ' +
            `${data[i]?.rewardForNewUser}`,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Referral Name',
        'Total Referral Sent',
        'Total Downloads',
        'Start Date',
        'End Date',
        'Bonus Type',
        'Total Bonus Credited',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'ReferredAndEarnSettingCollection.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE(
          'Referred And Earn Setting details'
        ), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  async countReferredAndEarnSetting(req: any, res: any, next: any) {
    try {
      const { sortBy, orderBy, search } = dataFromRequest(req);

      const queryBody = {
        search: search,
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Calling the service
      // Calling the service
      const { count, rows } = await this.referAndEarnService.getAllReferAndEarn(
        queryBody
      );

      let data: any = rows;

      let totalDownloads: number = 0;
      let totalReferrals: number = 0;
      let totalBookedServices: number = 0;
      let totalPendingServices: number = 0;
      let walletCredited: number = 0;
      let washesCredited: number = 0;

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.rewardTypeForReferee == 'Wash') {
          washesCredited += data[i]?.rewardForReferee;
        }
        if (data[i]?.rewardTypeForNewUser == 'Wash') {
          washesCredited += data[i]?.rewardForNewUser;
        }

        if (data[i]?.rewardTypeForReferee == 'Amount') {
          walletCredited += data[i]?.rewardForReferee;
        }
        if (data[i]?.rewardTypeForNewUser == 'Amount') {
          walletCredited += data[i]?.rewardForNewUser;
        }

        totalDownloads += parseInt(data[i]?.totalDownloads);
        totalReferrals += parseInt(data[i]?.totalReferrals);

        totalBookedServices += parseInt(data[i]?.totalBookedServices);
        totalPendingServices += parseInt(data[i]?.totalPendingServices);
      }

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            totalDownloads: totalDownloads,
            totalReferral: totalReferrals,
            totalBookedServices: totalBookedServices,
            totalPendingServices: totalPendingServices,
            walletCredited: walletCredited,
            washesCredited: washesCredited,
          },
        },
        message: templateConstants.LIST_OF('Referred And Earn Setting details'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  async countReferrerReferral(req: any, res: any, next: any) {
    try {
      const { sortBy, orderBy, search, referAndEarnId } = dataFromRequest(req);

      const queryBody = {
        search: search,
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        referAndEarnId: referAndEarnId,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Fetch customer data based on the request parameters
      const referrerData = await this.referAndEarnService.getReferrerList(
        queryBody
      );

      let data: any = referrerData.rows;

      let totalDownloads: number = 0;
      let totalReferrals: number = 0;
      let totalBookedServices: number = 0;
      let totalPendingServices: number = 0;
      let walletCredited: number = 0;
      let washesCredited: number = 0;

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.dataValues?.referrerBonusType == 'Wash') {
          washesCredited += parseInt(data[i]?.dataValues?.totalWashBonus);
        }
        if (data[i]?.dataValues?.referredUserBonusType == 'Wash') {
          washesCredited += parseInt(data[i]?.dataValues?.totalWashBonus);
        }

        if (data[i]?.dataValues?.referrerBonusType == 'Amount') {
          walletCredited += parseInt(data[i]?.dataValues?.totalAmountBonus);
        }
        if (data[i]?.dataValues?.referredUserBonusType == 'Amount') {
          walletCredited += parseInt(data[i]?.dataValues?.totalAmountBonus);
        }

        totalDownloads += parseInt(data[i]?.dataValues?.totalDownloads);
        totalReferrals += parseInt(data[i]?.dataValues?.totalReferrals);

        totalBookedServices += parseInt(
          data[i]?.dataValues?.totalBookedServices
        );
        totalPendingServices += parseInt(
          data[i]?.dataValues?.totalPendingServices
        );
      }

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            totalDownloads: totalDownloads,
            totalReferral: totalReferrals,
            totalBookedServices: totalBookedServices,
            totalPendingServices: totalPendingServices,
            walletCredited: walletCredited,
            washesCredited: washesCredited,
          },
        },
        message: templateConstants.LIST_OF('Referee details count'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  async getReferredUserListForCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { limit, offset, search, customerId } = dataFromRequest(req);

      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        search: search,
        limit: _limit,
        offset: _offset,
        referrerId: customerId,
      };

      // Calling the service
      const referredData =
        await this.referAndEarnService.getReferredUserListForCustomer(
          queryBody
        );

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Referred User'),
        body: {
          data: {
            referrerData: referredData.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              referredData.count
            ), // Format pagination data
          },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  async getCurrentReferAndEarn(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Calling the service
      const referAndEarnData =
        await this.referAndEarnService.getCurrentReferAndEarn();
      referAndEarnData;

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Refer And Earn'),
        body: {
          data: { referAndEarnData: referAndEarnData ? referAndEarnData : {} },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }
}

const referAndEarnController = new ReferAndEarnController();
export { referAndEarnController };
