import { vehicleController } from './controllers/vehicle.controller';
import { authCustomerGuard } from '../../services/common/requestResponseHandler';
import { CreateVehicleDTO, createVehicleSchema } from './dto/vechicle.dto';
import { validateVehicleApis } from './policies/vechicle.policy';
// import { authPolicy } from './policies/auth.policy';
import { validate } from 'express-validation';

class VehicleRoutes {
  private vehicleController: typeof vehicleController;

  constructor(private vehicleRouter: any) {
    this.vehicleRouter = vehicleRouter;
    this.vehicleController = vehicleController;
    this.vehicleRoutes();
  }

  private vehicleRoutes() {
    this.vehicleRouter.post(
      '/vehicle',
      validate(createVehicleSchema, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateVehicleApis.validateAddVehicleRequest.bind(
        validateVehicleApis
      ),
      this.vehicleController.createVehicle.bind(this.vehicleController)
    );

    this.vehicleRouter.put(
      '/vehicle/:vehicleId',
      validate(createVehicleSchema, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateVehicleApis.validateUpdateAndDeleteVehicleRequest.bind(
        validateVehicleApis
      ),
      this.vehicleController.updateVehicle.bind(this.vehicleController)
    );

    this.vehicleRouter.get(
      '/vehicle/:vehicleId',
      authCustomerGuard.bind(authCustomerGuard),
      this.vehicleController.getVehicle.bind(this.vehicleController)
    );

    this.vehicleRouter.get(
      '/vehicle',
      authCustomerGuard.bind(authCustomerGuard),
      this.vehicleController.getVehicles.bind(this.vehicleController)
    );

    this.vehicleRouter.delete(
      '/vehicle/:vehicleId',
      authCustomerGuard.bind(authCustomerGuard),
      validateVehicleApis.validateUpdateAndDeleteVehicleRequest.bind(
        validateVehicleApis
      ),
      this.vehicleController.deleteVehicle.bind(this.vehicleController)
    );
  }
}

export const vehicleRoutes = (vehicleRouter: any) => {
  return new VehicleRoutes(vehicleRouter);
};
