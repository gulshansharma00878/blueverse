import { config } from '../../../config/config';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { messageService } from '../../../services/common/messageService';
import { serviceRequestService } from '../services/serviceRequest.service';
import moment from 'moment';
import { parse, Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
class ServiceRequestController {
  // service request list
  async getServiceRequestlist(req: any, res: any, next: any) {
    try {
      const { offset, limit } = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const paginate = {
        _limit,
        _offset,
      };
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      // Service function
      const services = await serviceRequestService.getServiceRequestList(
        req,
        res,
        user,
        paginate
      );
      res.locals.response = {
        body: {
          data: {
            records: services.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              services.count
            ),
          },
        },
        message: templateConstants.LIST_OF('service request'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async exportServiceRequestlist(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user?.role,
      };
      const { offset, limit } = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const paginate = {};
      // Service function
      const services = await serviceRequestService.getServiceRequestList(
        req,
        res,
        user,
        paginate
      );
      let result: any = [];
      let csvFields: any = [];
      let i = 1;
      let fileName = 'ServiceRequest';
      if (user.role == config.userRolesObject.ADMIN) {
        services.rows.map((service) => {
          result.push({
            'Sr.No': i,
            'Service ID': service.serviceId,
            Machine: service.machine?.ShortName,
            OEM: service.machine?.outlet?.dealer?.oem?.name,
            'Service Centre': service.machine?.outlet?.name,
            Region: service.machine?.outlet?.city?.state?.region?.name,
            State: service.machine?.outlet?.city?.state?.name,
            City: service.machine?.outlet?.city?.name,
            'Date & Time': moment(service.createdAt)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Service ID',
          'Machine',
          'OEM',
          'Service Centre',
          'Region',
          'State',
          'City',
          'Date & Time',
        ];
      } else if (user.role == config.userRolesObject.DEALER) {
        services.rows.map((service) => {
          result.push({
            'Sr.No': i,
            'Service ID': service.serviceId,
            Machine: service.machine?.ShortName,
            'Service Centre': service.machine?.outlet?.name,
            'Request Date': moment(service.createdAt)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Service ID',
          'Machine',
          'Service Centre',
          'Request Date',
        ];
      }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('service request'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const serviceRequestController = new ServiceRequestController();
export { serviceRequestController };
