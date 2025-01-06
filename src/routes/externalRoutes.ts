import { Controller, Post } from 'ts-express-decorators';
import { externalController } from '../controllers/external/external-controller';
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for processing files directly in memory
const upload = multer({ storage });
@Controller('/external')
class ExternalRoutes {

  
  constructor(private externalRouter: any) {
    this.externalRouter = externalRouter;
    this.registerRoutes();
  }

  registerRoutes() {
    this.externalRouter.post(
      '/transaction',
      externalController.createTransaction
    );
    this.externalRouter.post(
      '/transactions-batch-update',
      externalController.batchUpdateTransaction
    );
    this.externalRouter.post(
      '/transactions-batch-update-upload', upload.single('file'),
      externalController.batchUpdateTransactionBulkUpload
    );

    this.externalRouter.post('/washtype', externalController.createWashType);
    this.externalRouter.post(
      '/machine-business-mode',
      externalController.createMachineBusinessMode
    );
    this.externalRouter.post('/machine', externalController.createMachine); //new machine onboarding

    this.externalRouter.post(
      '/health-matrix',
      externalController.createHealthMatrix
    );
    this.externalRouter.post(
      '/machine-health',
      externalController.createMachineHealth
    );
    this.externalRouter.post(
      '/machine-health-history',
      externalController.createMachineHealthHistory
    );
    this.externalRouter.post(
      '/machine-status',
      externalController.createMachineStatus
    );
    this.externalRouter.post(
      '/machine-status-history',
      externalController.createMachineStatusHistory
    );
    this.externalRouter.post(
      '/machine-status-log',
      externalController.createMachineStatusLog
    );
    this.externalRouter.post(
      '/machine-parameters',
      externalController.createMachineParameters
    );
    this.externalRouter.post(
      '/machine-parameters-audit',
      externalController.createMachineParametersAudit
    );

    this.externalRouter.post(
      '/machine-runtime',
      externalController.createMachineRuntime
    );
    this.externalRouter.post(
      '/machine-runtime-history',
      externalController.createMachineRuntimeHistory
    );
    this.externalRouter.post(
      '/machines-parameter-upper-lower-audit',
      externalController.createMachineParameterUpperLowerAudit
    );
    this.externalRouter.post(
      '/escalation-matrix-machine',
      externalController.createEscalationMatrixMachine
    );
    this.externalRouter.post(
      '/escalation-matrix-parameter',
      externalController.createEscalationMatrixParameter
    );
    this.externalRouter.post(
      '/escalation-contacts',
      externalController.createEscalationContacts
    );
    this.externalRouter.post(
      '/escalation-matrix',
      externalController.createEscalationMatrix
    );
    this.externalRouter.post(
      '/organisation',
      externalController.createOrganisation
    );
  }
}
const externalRoutes = (externalRouter: any) => {
  return new ExternalRoutes(externalRouter);
};

export = {
  ExternalRoutes,
  externalRoutes,
};
