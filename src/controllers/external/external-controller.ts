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
      await Transactions.upsert(req.body);
      await deductAmount(req);
      res.locals.response = {
        status: 200,
        message: 'Created',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  @Post('/transactions-batch-update')
  async batchUpdateTransaction(req: any, res: any, next: any) {
    try {

      if (req.body.length > 0) {
        for (const data of req.body) {
          if (data.IsSynced) delete data.IsSynced; 
          await Transactions.upsert(data);
          await deductAmount({ body: data });
        }
      }
      // return
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

      if (parsedData.length > 0) {
        for (const data of parsedData) {
          if (data.IsSynced) delete data.IsSynced;
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
      await MachineHealth.upsert(req.body);
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
