import { _validate } from '../../helpers/validate';

//policies
import { machinePolicy } from './policies/machine.policy';

//controllers
import { machineController } from './controllers/machine.controller';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { validate } from 'express-validation';
import machineChain from './validators/machine.chain';

class MachineRoutes {
  constructor(private machineRouter: any) {
    this.machineRouter = machineRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.machineRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      _validate(machineChain.validateIndexMachine),
      machinePolicy.index,
      machineController.index
    );
    //Machine module manage machines
    this.machineRouter.get(
      '/',
      verifyClient.bind(verifyClient),
      machineController.getMachineList
    );
    // export machine list data
    this.machineRouter.get(
      '/exportList',
      verifyClient.bind(verifyClient),
      machineController.exportGetMachineList
    );
    this.machineRouter.put(
      '/status/update/:machineId',
      verifyClient.bind(verifyClient),
      validate(machineChain.validateUpdateMachineStatus, {}, {}),
      machineController.updateMachineStatus
    );
    this.machineRouter.get(
      '/status/count',
      verifyClient.bind(verifyClient),
      machineController.getMachineListCountStatusWise
    );
    this.machineRouter.post(
      '/water/metrics/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineWaterMetrics
    );
    this.machineRouter.get(
      '/transactions/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineTransactionList
    );
    // export transaction consumpiton
    this.machineRouter.get(
      '/exportTransactions/:machineId',
      verifyClient.bind(verifyClient),
      machineController.exportMachineTransactionList
    );

    this.machineRouter.get(
      '/detail/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineDetailById
    );
    this.machineRouter.get(
      '/consumption/metrics/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineConsumptionMetrics
    );

    this.machineRouter.get(
      '/health/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineHealth
    );

    this.machineRouter.get(
      '/washes/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineWashes
    );

    this.machineRouter.post(
      '/service/request/:machineId',
      verifyClient.bind(verifyClient),
      machineController.createMachineServiceRequest
    );

    this.machineRouter.get(
      '/service/request/list/:machineId',
      verifyClient.bind(verifyClient),
      machineController.getMachineServiceRequestList
    );
    this.machineRouter.get(
      '/service/request/exportList/:machineId',
      verifyClient.bind(verifyClient),
      machineController.exportMachineServiceRequestList
    );
  }
}
const machineRoutes = (machineRouter: any) => {
  return new MachineRoutes(machineRouter);
};

export = {
  MachineRoutes: MachineRoutes,
  machineRoutes: machineRoutes,
};
