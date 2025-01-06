import { Op } from 'sequelize';
import { NextFunction, Request, Response } from 'express';
import { Customer } from '../../models/customer';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { Vehicle } from '../../models/vehicle';
import createHttpError from 'http-errors';
import { CONSTANT } from '../constant';

class ValidateVehicleApis {
  async validateUpdateAndDeleteVehicleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      let vehicleData = await Vehicle.findOne({
        where: {
          customerId: data.loggedInUser.userId,
          vehicleId: data.vehicleId,
        },
      });
      if (!vehicleData) {
        throw createHttpError(400, CONSTANT.VEHICLE_NOT_OWNED);
      }

      next();
    } catch (err) {
      next(err);
    }
  }
  async validateAddVehicleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      let vehicleData = await Vehicle.findOne({
        where: {
          hsrpNumber: data.hsrpNumber,
          isDeleted: false,
        },
        include: [
          {
            model: Customer,
            where: {
              isDeleted: false,
            },
          },
        ],
      });

      if (vehicleData) {
        throw createHttpError(400, CONSTANT.VEHICLE_ALREADY_ADDED);
      }

      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateVehicleApis = new ValidateVehicleApis();
export { validateVehicleApis };
