import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { hazardousWasteService } from '../services/hazardousWaste.service';
import moment from 'moment';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
import { config } from '../../../config/config';
import { HazardousWasteCollection } from '../../../models/HazardousWaste/hazardousWasteCollection';

class HazardousWasteController {
  // Function to get list of waste collections
  async getWasteCollectionReport(req: any, res: any, next: any) {
    try {
      const queryBody = res.locals.request.queryBody;
      const { limit, offset, showRecords } = queryBody;
      let recordRows: any = [];
      let recordCount: number = 0;
      // if show records is true then only fetch the records from the database
      if (showRecords) {
        const wasteCollections: any =
          await hazardousWasteService.getWasteCollectionList(queryBody);
        recordRows = wasteCollections.rows;
        recordCount = wasteCollections.count;
      }

      res.locals.response = {
        body: {
          data: {
            wasteCollectionList: recordRows,
            pagination: paginatorService(
              limit,
              offset / limit + 1,
              recordCount
            ),
          },
        },
        message: templateConstants.LIST_OF('hazardouse waste collection'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async exportWasteCollectionReport(req: any, res: any, next: any) {
    try {
      let queryBody = res.locals.request.queryBody;
      const { showRecords } = queryBody;
      let uploadLoc = '';
      // if show records is true then only fetch the records from the database
      if (showRecords) {
        queryBody.limit = config.exportFileMaxQueryLimit;
        queryBody.offset = 0;
        const { rows, count }: any =
          await hazardousWasteService.getWasteCollectionList(queryBody);
        let result: any = [];
        let csvFields: any = [];
        for (let i = 0; i < rows.length; i++) {
          result.push({
            'Sr.No': i + 1,
            OEM: rows[i].machine?.outlet?.dealer?.oem?.name,
            Region: rows[i].machine?.outlet?.city?.state?.region?.name,
            State: rows[i].machine?.outlet?.city?.state?.name,
            City: rows[i].machine?.outlet?.city?.name,
            Dealership: rows[i].machine?.outlet?.dealer?.username,
            'Service Centre': rows[i].machine?.outlet?.name,
            Machine: rows[i].machine?.name,
            'Waste Type': rows[i]?.waste_type,
            'No. of Bags': rows[i]?.wastage_bag_detail.length,
            'Total Weight (kg)': rows[i]?.total_waste_bag_weight,
            'No of Washes': rows[i]?.wash_count,
            'Average Weight': (
              rows[i]?.total_waste_bag_weight / rows[i]?.wash_count
            ).toFixed(2),
            'Cleaning Date': moment(rows[i]?.cleaning_date)
              .utcOffset('+05:30')
              .format('DD/MM/YYYY'),
          });
        }
        csvFields = [
          'OEM',
          'Region',
          'State',
          'City',
          'Dealership',
          'Service Centre',
          'Machine',
          'Waste Type',
          'No. of Bags',
          'Total Weight (kg)',
          'No of Washes',
          'Average Weight',
          'Cleaning Date',
        ];
        const csvParser = new Parser({ fields: csvFields });
        const csvData = csvParser.parse(result);
        const fileName = 'WasteCollection.csv';
        uploadLoc = await upload.uploadFile(csvData, fileName);
      }

      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc,
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE(
          'hazardouse waste collection'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to add new waste collection data
  async addWasteCollection(req: any, res: any, next: any) {
    try {
      const newWasteCollection = res.locals.request.newWasteCollection;
      const newCollection = await hazardousWasteService.addWasteCollection(
        newWasteCollection
      );
      res.locals.response = {
        body: {
          data: {
            newWasteCollection: newCollection,
          },
        },
        message: templateConstants.CREATED_SUCCESSFULLY(
          'Hazardous waste collection'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to update  waste collection new data
  async updateWasteCollectionDetail(req: any, res: any, next: any) {
    try {
      const { wasteBagDetail, totalWasteBagWeight, wasteCollectionId } =
        res.locals.request.newWasteCollection;
      const newCollection = await hazardousWasteService.updateWasteCollection(
        {
          wasteBagDetail,
          totalWasteBagWeight,
        },
        wasteCollectionId
      );
      res.locals.response = {
        body: {
          data: {
            newWasteCollection: newCollection,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY(
          'Hazardous waste collection'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to add new waste collection data
  async getLastWasteCollection(req: any, res: any, next: any) {
    try {
      const { machineId } = req.params;
      const newCollection = await hazardousWasteService.getLastWasteCollection(
        machineId
      );
      res.locals.response = {
        body: {
          data: {
            newWasteCollection: newCollection,
          },
        },
        message: templateConstants.DETAIL('last hazardouse waste collection'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to add new waste collection data
  async getLastWasteDisposalDetail(req: any, res: any, next: any) {
    try {
      const { machineId } = req.params;
      const newCollection =
        await hazardousWasteService.getLastWasteDisposalDetail(machineId);
      res.locals.response = {
        body: {
          data: {
            newWasteCollection: newCollection,
          },
        },
        message: templateConstants.DETAIL('last hazardouse waste disposal'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to get waste collection data
  async getWasteCollectionDetail(req: any, res: any, next: any) {
    try {
      const { wasteCollectionId } = req.params;
      const newCollection =
        await hazardousWasteService.getWasteCollectionDetail(wasteCollectionId);
      res.locals.response = {
        body: {
          data: {
            newWasteCollection: newCollection,
          },
        },
        message: templateConstants.DETAIL('Hazardouse waste collection'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to get the list of waste disposal
  async getWasteDisposalReport(req: any, res: any, next: any) {
    try {
      const queryBody = res.locals.request.queryBody;
      const { limit, offset, showRecords } = queryBody;
      let recordRows: any = [];
      let recordCount: number = 0;
      // if show records is true then only fetch the records from the database
      if (showRecords) {
        const wasteDisposalList =
          await hazardousWasteService.getWasteDisposalList(queryBody);
        recordRows = wasteDisposalList.rows;
        recordCount = wasteDisposalList.count;
      }

      res.locals.response = {
        body: {
          data: {
            wasteDisposalList: recordRows,
            pagination: paginatorService(
              limit,
              offset / limit + 1,
              recordCount
            ),
          },
        },
        message: templateConstants.LIST_OF('hazardouse waste disposal'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to get the list of waste disposal
  async exportWasteDisposalReport(req: any, res: any, next: any) {
    try {
      let queryBody = res.locals.request.queryBody;
      const { showRecords } = queryBody;
      let uploadLoc = '';
      // if show records is true then only fetch the records from the database
      if (showRecords) {
        queryBody.limit = config.exportFileMaxQueryLimit;
        queryBody.offset = 0;
        const { rows, count } =
          await hazardousWasteService.getWasteDisposalList(queryBody);
        let result: any = [];
        let csvFields: any = [];
        for (let i = 0; i < rows.length; i++) {
          result.push({
            'Sr.No': i + 1,
            OEM: rows[i].machine?.outlet?.dealer?.oem?.name,
            Region: rows[i].machine?.outlet?.city?.state?.region?.name,
            State: rows[i].machine?.outlet?.city?.state?.name,
            City: rows[i].machine?.outlet?.city?.name,
            Dealership: rows[i].machine?.outlet?.dealer?.username,
            'Service Centre': rows[i].machine?.outlet?.name,
            Machine: rows[i].machine?.name,
            'Waste Type': rows[i]?.waste_type,
            'Collected Weight (kg)': rows[i].collected_waste_weight,
            'Disposal Weight (kg)': rows[i]?.total_waste_bag_weight,
            'Remaining Weight (kg)': rows[i]?.remaining_collected_waste_weight,
            'Disposal Date': moment(rows[i]?.desposing_date)
              .utcOffset('+05:30')
              .format('DD/MM/YYYY'),
          });
        }
        csvFields = [
          'OEM',
          'Region',
          'State',
          'City',
          'Dealership',
          'Service Centre',
          'Machine',
          'Waste Type',
          'Collected Weight (kg)',
          'Disposal Weight (kg)',
          'Remaining Weight (kg)',
          'Disposal Date',
        ];
        const csvParser = new Parser({ fields: csvFields });
        const csvData = csvParser.parse(result);
        const fileName = 'WasteDisposal.csv';
        uploadLoc = await upload.uploadFile(csvData, fileName);
      }

      res.locals.response = {
        body: {
          data: {
            uploadLoc,
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE(
          'hazardouse waste disposal'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  // Function to add new waste disposal recorder
  async addWasteDisposal(req: any, res: any, next: any) {
    try {
      const newWasteDisposal = res.locals.request.newWasteDisposal;
      const newDisposal = await hazardousWasteService.addWasteDisposal(
        newWasteDisposal
      );
      res.locals.response = {
        body: {
          data: {
            newDisposal: newDisposal,
          },
        },
        message: templateConstants.CREATED_SUCCESSFULLY(
          'Hazardouse waste disposal'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // Function to add new waste disposal recorder
  async updateWasteDisposalDetails(req: any, res: any, next: any) {
    try {
      const {
        totalWasteBagWeight,
        formUrl,
        wasteDisposalId,
        remaining_collected_waste_weight,
      } = res.locals.request.newWasteDisposal;
      const newDisposal = await hazardousWasteService.updateWasteDisposal(
        {
          totalWasteBagWeight,
          formUrl,
          remaining_collected_waste_weight,
        },
        wasteDisposalId
      );
      res.locals.response = {
        body: {
          data: {
            newDisposal: newDisposal,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY(
          'Hazardouse waste disposal'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWasteDisposalDetails(req: any, res: any, next: any) {
    try {
      const { wasteDisposalId } = req.params;
      const newDisposal = await hazardousWasteService.getWasteDisposalDetails(
        wasteDisposalId
      );
      res.locals.response = {
        body: {
          data: {
            newDisposal: newDisposal,
          },
        },
        message: templateConstants.DETAIL('Hazardouse waste disposal'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  // Api to get monthly comibined waste collection and disposal  graph details
  async getMonthlyWasteCollectionDisposalDetails(
    req: any,
    res: any,
    next: any
  ) {
    try {
      let queryBody = res.locals.request.queryBody;
      let { showRecords } = queryBody;
      let wasteDisposal: any = [];
      let wasteCollections: any = [];
      let wasteRemaining: any = [];
      let remainingWaste = 0;
      if (showRecords) {
        remainingWaste = await hazardousWasteService.getRemainingWasteCount(
          queryBody
        );
        wasteDisposal =
          await hazardousWasteService.getMonthlyWasteDisposalDetails(queryBody);
        wasteCollections =
          await hazardousWasteService.getMonthlyWasteCollectionDetails(
            queryBody
          );
        wasteRemaining = hazardousWasteService.getMonthlyRemainingWaste(
          wasteDisposal,
          wasteCollections,
          remainingWaste
        );
      }
      res.locals.response = {
        body: {
          data: {
            wasteDisposal,
            wasteCollections,
            wasteRemaining: wasteRemaining,
          },
        },
        message: templateConstants.LIST_OF('Waste disposal'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  // function to get difference between sum of collected and sum of disposables weight
  async getMachineNetCollectedWasteWeight(req: any, res: any, next: any) {
    try {
      const { machineId } = req.params;
      const totalCollectedWeight =
        await hazardousWasteService.getMachineAllCollectedWaste(machineId);
      const totalDisposalWeight =
        await hazardousWasteService.getMachineAllDisposedWaste(machineId);
      const weightDifference =
        (totalCollectedWeight || 0) - (totalDisposalWeight || 0);
      res.locals.response = {
        body: {
          data: {
            weightDifference: weightDifference,
          },
        },
        message: templateConstants.DETAIL('Machine collected waste weight'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // function to get waste collection data
  async deleteWasteCollectionDetail(req: any, res: any, next: any) {
    try {
      const { wasteCollectionId } = req.params;
      const whereCondition: any = {};

      whereCondition['hazardous_waste_collection_id'] = wasteCollectionId;

      await HazardousWasteCollection.destroy({
        where: whereCondition,
      });
      res.locals.response = {
        body: {
          data: {},
        },
        message: templateConstants.DELETED_SUCCESSFULLY(
          'Hazardouse waste collection'
        ),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const hazardousWasteController = new HazardousWasteController();
export { hazardousWasteController };
