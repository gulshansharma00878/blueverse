import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { waterQualityService } from '../services/waterQuality.service';
import moment from 'moment';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
import { config } from '../../../config/config';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { WaterQualityReport } from '../../../models/waterQualityReport';

class WaterQualityController {
  async addWaterQualityReport(req: any, res: any, next: any) {
    try {
      const newWaterQualityData = res.locals.request.newWaterQualityData;
      const newCollectionRes = await waterQualityService.addWaterQuality(
        newWaterQualityData
      );
      res.locals.response = {
        body: {
          data: {
            newCollectionRes,
          },
        },
        message: templateConstants.CREATED_SUCCESSFULLY('Water quality'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateWaterQualityReportDetails(req: any, res: any, next: any) {
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
      } = res.locals.request.newWaterQualityData;
      const newCollectionRes = await waterQualityService.updateWaterQuality(
        {
          wasteType,
          tdsValue,
          tssValue,
          codValue,
          bodValue,
          phValue,
          oilGreaseValue,
          labReportUrl,
        },
        waterQualityId
      );
      res.locals.response = {
        body: {
          data: {
            newCollectionRes,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('Water quality'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWaterQualityReportDetails(req: any, res: any, next: any) {
    try {
      const { waterQualityId } = dataFromRequest(req);
      const newCollectionRes = await waterQualityService.getWaterQuality(
        waterQualityId
      );
      res.locals.response = {
        body: {
          data: {
            newCollectionRes,
          },
        },
        message: templateConstants.DETAIL('Water quality'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWaterQualityReport(req: any, res: any, next: any) {
    try {
      const queryBody = res.locals.request.queryBody;
      const { limit, offset, showRecords } = queryBody;
      let recordRows: any = [];
      let recordCount: number = 0;
      // if show records is true then only fetch the records from the database
      if (showRecords) {
        const waterQualitList: any =
          await waterQualityService.getWaterQualityList(queryBody);
        recordRows = waterQualitList.rows;
        recordCount = waterQualitList.count;
      }

      res.locals.response = {
        body: {
          data: {
            waterQualitList: recordRows,
            pagination: paginatorService(
              limit,
              offset / limit + 1,
              recordCount
            ),
          },
        },
        message: templateConstants.LIST_OF('water qualities'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportWaterQualityReport(req: any, res: any, next: any) {
    try {
      let queryBody = res.locals.request.queryBody;
      const { showRecords } = queryBody;
      let uploadLoc = '';
      if (showRecords) {
        queryBody.limit = config.exportFileMaxQueryLimit;
        queryBody.offset = 0;
        const { rows, count }: any =
          await waterQualityService.getWaterQualityList(queryBody);
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
            Ph: rows[i]?.ph_value,
            Tds: rows[i]?.tds_value,
            Tss: rows[i]?.tss_value,
            Bod: rows[i]?.bod_value,
            Cod: rows[i]?.cod_value,
            'Oil & Grees': rows[i]?.oil_grease_value,
            'Cummulative Wash Count': rows[i]?.cummulative_wash_count,
            'Wash Count': rows[i]?.wash_count_between_reports,
            'Sampling Date': moment(rows[i]?.sampling_date)
              .utcOffset('+05:30')
              .format('DD/MM/YYYY hh:mm A'),
            'Reporting Date': moment(rows[i]?.report_date)
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
          'Ph',
          'Tds',
          'Tss',
          'Bod',
          'Cod',
          'Oil & Grees',
          'Cummulative Wash Count',
          'Wash Count',
          'Sampling Date',
          'Reporting Date',
        ];
        const csvParser = new Parser({ fields: csvFields });
        const csvData = csvParser.parse(result);
        const fileName = 'WaterQuality.csv';
        uploadLoc = await upload.uploadFile(csvData, fileName);
      }

      res.locals.response = {
        body: {
          data: { uploadLoc },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('water qualities'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getWaterQualitylastDetails(req: any, res: any, next: any) {
    try {
      const machineId = req.params.machineId;
      const waterQuality: any =
        await waterQualityService.getMachineLastWaterQuality(machineId);
      res.locals.response = {
        body: {
          data: {
            waterQuality: waterQuality,
          },
        },
        message: templateConstants.DETAIL('Water qualities'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWaterQualityListWithLastWash(req: any, res: any, next: any) {
    try {
      const queryBody = res.locals.request.queryBody;
      const { limit, offset, showRecords } = queryBody;
      let recordRows: any = [];
      let recordCount: number = 0;
      // if show records is true then only fetch the records from the database
      if (showRecords) {
        const machineList: any =
          await waterQualityService.getWaterQualityListWithLastWash(queryBody);
        recordRows = machineList.rows;
        recordCount = machineList.count;
      }

      res.locals.response = {
        body: {
          data: {
            machineList: recordRows,
            pagination: paginatorService(
              limit,
              offset / limit + 1,
              recordCount
            ),
          },
        },
        message: templateConstants.LIST_OF('water qualities'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteWaterQualityReportDetails(req: any, res: any, next: any) {
    try {
      const { waterQualityId } = dataFromRequest(req);
      await WaterQualityReport.destroy({
        where: {
          water_quality_report_id: waterQualityId,
        },
      });
      res.locals.response = {
        body: {
          data: {},
        },
        message: templateConstants.DELETED_SUCCESSFULLY('Water quality'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const waterQualityController = new WaterQualityController();
export { waterQualityController };
