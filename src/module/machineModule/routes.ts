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
    this.machineRouter.put(
      '/status/update/:machineId',
      verifyClient.bind(verifyClient),
      validate(machineChain.validateUpdateMachineStatus, {}, {}),
      machineController.updateMachineStatus
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
