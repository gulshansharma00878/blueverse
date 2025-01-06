import stringConstants from '../../../common/stringConstants';
import { CustomerVehicleService } from '../services/vehicle.service';
import { CONSTANT } from '../constant';
import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';

export class VehicleController {
  private vehicleService: typeof CustomerVehicleService;
  constructor() {
    this.vehicleService = CustomerVehicleService;
  }

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);
      // Creating the vehicle
      const vehicleData: any = await this.vehicleService.addVehicle(
        data,
        data.loggedInUser.userId
      );

      res.locals.response = {
        message: CONSTANT.VEHICLE_CREATED,
        body: { data: { vehicleData: vehicleData } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);
      // updating the vehicle details
      await this.vehicleService.updateVehicle(data, data.vehicleId);

      res.locals.response = {
        message: CONSTANT.VEHICLE_UPDATED,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);
      // Getting the one vehicle details
      const vehicleData = await this.vehicleService.getVehicle(data.vehicleId);

      res.locals.response = {
        message: CONSTANT.VEHICLE_DETAILS,
        body: { data: { vehicleData: vehicleData } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);

      // Getting the all vehicle details
      const vehicleData = await this.vehicleService.getVehicles(
        data.loggedInUser.userId
      );

      res.locals.response = {
        message: CONSTANT.VEHICLE_DETAILS,
        body: { data: { vehicleData: vehicleData } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);
      // Getting the all vehicle details
      await this.vehicleService.deleteVehicle(data.vehicleId);

      res.locals.response = {
        message: CONSTANT.VEHICLE_DELETED,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const vehicleController = new VehicleController();
export { vehicleController };
