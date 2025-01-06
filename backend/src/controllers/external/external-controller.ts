import { Post } from 'ts-express-decorators';
import { Transactions } from '../../models/transactions';
import { Controller } from 'ts-express-decorators';
import { WashType } from '../../models/wash_type';
import { MachineBusinessMode } from '../../models/Machine/machine_business_mode';
import { Machine } from '../../models/Machine/Machine';
import { HealthMatrix } from '../../models/HealthMatrix';
import { MachineHealth } from '../../models/Machine/MachineHealth';
import { MachineHealthHistory } from '../../models/Machine/MachineHealthHistory';
import { MachineStatus } from '../../models/Machine/MachineStatus';
import { MachineStatusHistory } from '../../models/Machine/MachineStatusHistory';
import { MachineStatusLog } from '../../models/Machine/MachineStatusLog';
import { MachineParameters } from '../../models/Machine/MachineParameters';
import { MachineParametersAudit } from '../../models/Machine/MachineParametersAudit';
import { MachineRuntime } from '../../models/Machine/MachineRuntime';
import { MachineRuntimeHistory } from '../../models/Machine/MachineRuntimeHistory';
import { MachinesParameterUpperLowerAudit } from '../../models/Machine/MachinesParameterUpperLowerAudit';
import { EscalationMatrixMachine } from '../../models/Escalation/EscalationMatrixMachine';
import { EscalationMatrixParameter } from '../../models/Escalation/escalation_matrix_parameter';
import { EscalationMatrix } from '../../models/Escalation/EscalationMatrix';
import { EscalationContacts } from '../../models/Escalation/EscalationContacts';
import { Organisation } from '../../models/Organisation';
import { deductAmount } from '../../services/commonService';
import { memoService } from '../../services/cron/machineMemo/machineMemo';
import { notificationConstant } from '../../common/notificationConstants';
import { config } from '../../config/config';
import { notificationService } from '../../services/notifications/notification';
import { machineService } from '../../module/machineModule/services/machine.service';
import {
  getSKUUniqueDigitNumeric,
  isNullOrUndefined,
  isValidGuid,
} from '../../common/utility';
import moment from 'moment';
import { sendMachineHealtNotification } from '../../services/notifications/sendNotification';
import { waterQualityService } from '../../module/waterQualityModule/services/waterQuality.service';
import { washService } from '../../module/washModule/services/wash.service';
import { hazardousWasteService } from '../../module/hazardousWasteModule/services/hazardousWaste.service';
import { templateConstants } from '../../common/templateConstants';
import { BookingService } from '../../B2C/bookingModule/services/booking.service';
import stringConstants from '../../common/stringConstants';
const csv = require('csv-parser');
const stream = require('stream');

@Controller('/external')
class ExternalController {
  /**
   * @swagger
   * /api/v1/transactions
   */
  @Post('/transactions')
  async createTransaction(req: any, res: any, next: any) {
    try {
      // Check if the phone number is present in the request body
      if (req.body.phone) {
        // Call the updateSkuNumber function from BookingService, passing in the phone number, OTP, and SkuNumber
        let customerId = await BookingService.updateSkuNumber(
          req.body.phone,
          req.body.otp,
          req.body.SkuNumber
        );

        // Remove the phone and OTP properties from the request body
        delete req.body.phone;
        delete req.body.otp;

        // Add a new property called customerId to the request body, with the value returned from updateSkuNumber
        req.body['customerId'] = customerId;
      }

      let IsAssigned = false;
      IsAssigned = await machineService.isMachineAssigned(req.body.MachineGuid);
      req.body['IsAssigned'] = IsAssigned;
      // get machine last water quality accordin to its sampling date
      const lastWaterQulaity =
        await waterQualityService.getMachineLastWaterQuality(
          req.body.MachineGuid
        );
      // if last water quality data exist then update the transaction data accordingly
      if (!isNullOrUndefined(lastWaterQulaity)) {
        req.body['TSSValue'] = lastWaterQulaity.tss_value;
        req.body['CODValue'] = lastWaterQulaity.cod_value;
        req.body['OilAndGreaseValue'] = lastWaterQulaity.oil_grease_value;
      }
      // store unique sku digit
      if (
        !isNullOrUndefined(req.body.SkuNumber) &&
        req.body.SkuNumber.length > 4
      ) {
        req.body['SkuDigit'] = getSKUUniqueDigitNumeric(req.body.SkuNumber);
      }
      await Transactions.upsert(req.body);

      // If its not a b2c wash then this flow works
      if (!req.body.customerId) {
        await deductAmount(req);
      } else {
        // Creating the feedback for customer
        await washService.b2cFeedBack(req.body.SkuNumber);
      }

      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/transactions-batch-update
   */
  @Post('/transactions-batch-update')
  async batchUpdateTransaction(req: any, res: any, next: any) {
    try {
      if (req.body.length > 0) {
        for (const data of req.body) {
          if (data.IsSynced) delete data.IsSynced;

          let IsAssigned = false;

          IsAssigned = await machineService.isMachineAssigned(data.MachineGuid);
          data['IsAssigned'] = IsAssigned;
          // get machine last water quality accordin to its sampling date

          const lastWaterQulaity =
            await waterQualityService.getMachineLastWaterQuality(
              data.MachineGuid
            );

          // if last water quality data exist then update the transaction data accordingly
          if (!isNullOrUndefined(lastWaterQulaity)) {
            data['TSSValue'] = lastWaterQulaity.tss_value;
            data['CODValue'] = lastWaterQulaity.cod_value;
            data['OilAndGreaseValue'] = lastWaterQulaity.oil_grease_value;
          }
          //store unique sku digit
          if (!isNullOrUndefined(data.SkuNumber) && data.SkuNumber.length > 4) {
            data['SkuDigit'] = getSKUUniqueDigitNumeric(data.SkuNumber);
          }

          await Transactions.upsert(data);
          await deductAmount({ body: data });
        }
      }
      res.locals.response = {
        status: 200,
        message: 'Updated',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/transactions-batch-update-upload')
  async batchUpdateTransactionBulkUpload(req: any, res: any, next: any) {
    try {

      const csvBuffer = req.file.buffer;

      const parsedData = await parseCSV(csvBuffer); 

      console.log(parsedData , "parsed");
      if (parsedData.length > 0) {
        for (const data of parsedData) {
          if (data.IsSynced) delete data.IsSynced;

          let IsAssigned = false;

          IsAssigned = await machineService.isMachineAssigned(data.MachineGuid);
          data['IsAssigned'] = IsAssigned;
          // get machine last water quality accordin to its sampling date

          const lastWaterQulaity =
            await waterQualityService.getMachineLastWaterQuality(
              data.MachineGuid
            );

          // if last water quality data exist then update the transaction data accordingly
          if (!isNullOrUndefined(lastWaterQulaity)) {
            data['TSSValue'] = lastWaterQulaity.tss_value;
            data['CODValue'] = lastWaterQulaity.cod_value;
            data['OilAndGreaseValue'] = lastWaterQulaity.oil_grease_value;
          }
          //store unique sku digit
          if (!isNullOrUndefined(data.SkuNumber) && data.SkuNumber.length > 4) {
            data['SkuDigit'] = getSKUUniqueDigitNumeric(data.SkuNumber);
          }

          await Transactions.upsert(data);
          await deductAmount({ body: data });
        }
      }
      res.locals.response = {
        status: 200,
        message: 'Updated',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/washtype')
  async createWashType(req: any, res: any, next: any) {
    try {
      req.body.Name = req.body.Name?.toUpperCase();
      await WashType.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-business-mode')
  async createMachineBusinessMode(req: any, res: any, next: any) {
    try {
      await MachineBusinessMode.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine')
  async createMachine(req: any, res: any, next: any) {
    try {
      const requestObj = req.body;
      requestObj.name = requestObj.Name;
      requestObj.machineGuid = requestObj.Guid;
      delete requestObj.Name;
      delete requestObj.Guid;
      await Machine.upsert(requestObj);
      const alarms = await HealthMatrix.findAll({ raw: true });
      for (const alarm of alarms) {
        const isExist = await MachineHealth.findOne({
          where: {
            AlarmGuid: alarm.Guid,
            MachineGuid: requestObj.machineGuid,
          },
          attributes: ['Guid'],
          raw: true,
        });
        if (!isExist) {
          await MachineHealth.create({
            MachineGuid: requestObj.machineGuid,
            AlarmGuid: alarm.Guid,
            Status: true,
          });
        }
      }
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/health-matrix')
  async createHealthMatrix(req: any, res: any, next: any) {
    try {
      await HealthMatrix.upsert(req.body);
      const AlarmGuid = req.body.Guid;
      const machines = await Machine.findAll({
        attributes: ['machineGuid'],
        raw: true,
      });
      for (const machine of machines) {
        const isExist = await MachineHealth.findOne({
          where: { MachineGuid: machine.machineGuid, AlarmGuid: AlarmGuid },
        });
        if (!isExist) {
          await MachineHealth.create({
            MachineGuid: machine.machineGuid,
            AlarmGuid: AlarmGuid,
            Status: true,
          });
        }
      }

      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-health')
  async createMachineHealth(req: any, res: any, next: any) {
    try {
      const { Guid, Status, MachineGuid, AlarmGuid } = req.body;
      let machineHealthDetail = {
        uuid: '',
        dealerId: '',
        machineId: '',
      };
      const UpdateDate = moment();
      const machineHealth =
        await machineService.getMachineHealthFromMachineAndAlarmId(
          MachineGuid,
          AlarmGuid
        );
      await MachineHealth.update(
        {
          Status: Status,
          UpdateDate: UpdateDate,
        },
        {
          where: {
            MachineGuid: MachineGuid,
            AlarmGuid: AlarmGuid,
          },
        }
      );
      //   If machine health details exist and the alarm status indicates a failure
      if (
        !isNullOrUndefined(Status) &&
        !Status &&
        !isNullOrUndefined(machineHealth) &&
        machineHealth.Status != Status
      ) {
        sendMachineHealtNotification(machineHealth);
      }

      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-health-history')
  async createMachineHealthHistory(req: any, res: any, next: any) {
    try {
      await MachineHealthHistory.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-status')
  async createMachineStatus(req: any, res: any, next: any) {
    try {
      await MachineStatus.upsert(req.body);
      const updateBody: any = { status: 'INACTIVE' };
      if (req.body.Status) {
        updateBody.status = 'ACTIVE';
      }
      await Machine.update(updateBody, {
        where: { machineGuid: req.body.MachineGuid },
      });
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-status-history')
  async createMachineStatusHistory(req: any, res: any, next: any) {
    try {
      await MachineStatusHistory.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-status-log')
  async createMachineStatusLog(req: any, res: any, next: any) {
    try {
      await MachineStatusLog.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-parameters')
  async createMachineParameters(req: any, res: any, next: any) {
    try {
      await MachineParameters.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-parameters-audit')
  async createMachineParametersAudit(req: any, res: any, next: any) {
    try {
      await MachineParametersAudit.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-runtime')
  async createMachineRuntime(req: any, res: any, next: any) {
    try {
      await MachineRuntime.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machine-runtime-history')
  async createMachineRuntimeHistory(req: any, res: any, next: any) {
    try {
      await MachineRuntimeHistory.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/machines-parameter-upper-lower-audit')
  async createMachineParameterUpperLowerAudit(req: any, res: any, next: any) {
    try {
      await MachinesParameterUpperLowerAudit.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/escalation-matrix-machine')
  async createEscalationMatrixMachine(req: any, res: any, next: any) {
    try {
      await EscalationMatrixMachine.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/escalation-matrix-parameter')
  async createEscalationMatrixParameter(req: any, res: any, next: any) {
    try {
      await EscalationMatrixParameter.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/escalation-contacts')
  async createEscalationContacts(req: any, res: any, next: any) {
    try {
      await EscalationContacts.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/escalation-matrix')
  async createEscalationMatrix(req: any, res: any, next: any) {
    try {
      await EscalationMatrix.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/organisation')
  async createOrganisation(req: any, res: any, next: any) {
    try {
      await Organisation.upsert(req.body);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async generateInvoices(req: any, res: any, next: any) {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'qa' ||
        process.env.NODE_ENV === 'staging'
      ) {
        // this order should be always same for invoice id generation
        await memoService.generateTaxInvoice();
        await memoService.generateBlueverseCreditMemo();
        await memoService.generateAdvanceMemo();
      }
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  //Function to manually generate advance memo

  async generateAdvanceMemos(req: any, res: any, next: any) {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'qa' ||
        process.env.NODE_ENV === 'staging'
      ) {
        memoService.generateAdvanceMemo();
      }
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  //Function to manually generate TaxAndCreditMemos memo
  async generateTaxAndCreditMemos(req: any, res: any, next: any) {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'qa' ||
        process.env.NODE_ENV === 'staging'
      ) {
        // this order should be always same for invoice id generation
        const { machineId } = req.body;
        if (!isNullOrUndefined(machineId)) {
          // for testing purposes only
          await memoService.generateTaxInvoice(machineId);
          await memoService.generateBlueverseCreditMemo(machineId);
        } else {
          await memoService.generateTaxInvoice();
          await memoService.generateBlueverseCreditMemo();
        }
      }
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async syncMachineHealth(req: any, res: any, next: any) {
    try {
      const machines = await Machine.findAll({
        attributes: ['machineGuid'],
        raw: true,
      });
      const alarms = await HealthMatrix.findAll({ raw: true });
      for (const machine of machines) {
        for (const alarm of alarms) {
          const isExist = await MachineHealth.findOne({
            where: { AlarmGuid: alarm.Guid, MachineGuid: machine.machineGuid },
            attributes: ['Guid'],
            raw: true,
          });
          if (!isExist) {
            await MachineHealth.create({
              MachineGuid: machine.machineGuid,
              AlarmGuid: alarm.Guid,
              Status: true,
            });
          }
        }
      }

      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async generateCommencementAdvanceMemo(req: any, res: any, next: any) {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_EN === 'qa' ||
        process.env.NODE_ENV === 'staging'
      ) {
        await memoService.generateCommencementAdvanceMemo();
      }
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // API to get wash states [Total Wash count, total water saved, total disposed waste sludge]
  async getWashStats(req: any, res: any, next: any) {
    try {
      // const promiseArr = [
      const activeWashTypeIds = await washService.getActiveWashTypeIds();

      const washCount = await washService.getTotalWashCount(activeWashTypeIds);
      const savedWater = await washService.getTotalSavedWater(
        activeWashTypeIds
      );
      res.locals.response = {
        status: 200,
        message: templateConstants.DETAIL('Wash Stats'),
        body: {
          data: {
            washCount,
            sludgeDisposedWeight: Number(0.28 * washCount).toFixed(2),
            savedWater,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // API to get wash states [Total Wash count, total water saved, total disposed waste sludge]
  async verifyCustomerBookingOtp(req: any, res: any, next: any) {
    try {
      // Extract phone and OTP from the request body
      const { phone, otp, machineId } = req.body;

      // Verify the customer's booking OTP using the BookingService
      let { bookingDetails, isError } =
        await BookingService.verifyCustomerBookingOtp(phone, otp, machineId);


      res.locals.response = {
        status: 200,
        message: isError
          ? stringConstants.genericMessage.INVALID_MOBILE
          : stringConstants.genericMessage.OTP_VERIFIED_SUCCESSFULLY, // Success message
        body: {
          data: {
            wash_type: isError
              ? ''
              : bookingDetails['washOrder.washType.Name'],
            OTP_status: isError ? false : true,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  //Function to manually generate TaxAndCreditMemos memo
  async generateTaxMemos(req: any, res: any, next: any) {
    try {
      // this order should be always same for invoice id generation
      const { machineId, startDate, endDate } = req.body;

      if (
        !isNullOrUndefined(machineId) &&
        !isNullOrUndefined(startDate) &&
        !isNullOrUndefined(startDate)
      ) {
        // for testing purposes only
        await memoService.generateCustomTaxInvoice(
          machineId,
          startDate,
          endDate
        );
      } else {
        if (!isNullOrUndefined(startDate) && !isNullOrUndefined(startDate)) {
          await memoService.generateCustomTaxInvoice('', startDate, endDate);
        }
      }

      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  //Function to manually generate TaxAndCreditMemos memo
  async generateOldTaxAndCreditMemos(req: any, res: any, next: any) {
    try {
      // this order should be always same for invoice id generation
      const { machineId, startDate, endDate } = req.body;

      if (
        !isNullOrUndefined(machineId) &&
        !isNullOrUndefined(startDate) &&
        !isNullOrUndefined(endDate)
      ) {
        // for testing purposes only
        await memoService.generateOldCustomTaxInvoice(
          machineId,
          startDate,
          endDate
        );
      } else {
        if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
          await memoService.generateOldCustomTaxInvoice('', startDate, endDate);
        }
      }

      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

async function parseCSV(buffer: any): Promise<any[]>  {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const readableStream = stream.Readable.from(buffer.toString());

    readableStream
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err: any) => reject(err));
  });
};
const externalController = new ExternalController();

export { externalController, ExternalController };
