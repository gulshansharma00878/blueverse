import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { AdditionalService } from '../../models/additional_service';
import { Op } from 'sequelize';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { MerchantAdditionalServicePrice } from '../../models/merchant_additional_service_price';

// Class for validating additional service-related requests
class ValidateAdditionalService {
  // Method to validate if the additional service name already exists when adding a new service
  async validateAdditionalServiceName(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destructure the value from request body
      const { additionalServiceName } = dataFromRequest(req);
      const isNameExist = await AdditionalService.findOne({
        where: {
          name: additionalServiceName,
          deletedAt: null,
        },
      });
      if (isNameExist) {
        // Throw an error if the service name already exists
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(
            `An additional service with the name ${additionalServiceName}`
          )
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate if the additional service name already exists when updating a service
  async validateUpdateAdditionalServiceName(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destructure the values from request body
      const { additionalServiceName, additionalServiceId } =
        dataFromRequest(req);
      if (!isNullOrUndefined(additionalServiceName)) {
        const isNameExist = await AdditionalService.findOne({
          where: {
            name: additionalServiceName,
            deletedAt: null,
            additionalServiceId: {
              [Op.not]: additionalServiceId, // Exclude the current service ID from the check
            },
          },
        });
        if (isNameExist) {
          // Throw an error if the service name already exists
          throw createHttpError(
            400,
            templateConstants.ALREADY_EXIST(
              `An additional service with the name ${additionalServiceName}`
            )
          );
        }
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate the additional service ID
  async validateAdditionalServiceNameId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destructure the value from request body
      const { additionalServiceId } = dataFromRequest(req);
      if (!isValidGuid(additionalServiceId)) {
        // Throw an error if the service ID is not a valid GUID
        throw createHttpError(
          400,
          templateConstants.INVALID('additionalServiceId')
        );
      }
      const additionalService = await AdditionalService.findOne({
        where: {
          deletedAt: null,
          additionalServiceId: additionalServiceId,
        },
      });
      if (!additionalService) {
        // Throw an error if the service with the given ID does not exist
        throw createHttpError(
          400,
          templateConstants.DOES_NOT_EXIST(`additionalServiceId`)
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateDeleteAdditionalService(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { additionalServiceId } = dataFromRequest(req);
      const additionalService = await MerchantAdditionalServicePrice.findOne({
        where: {
          additionalServiceId: additionalServiceId,
          deletedAt: null,
        },
      });
      if (additionalService) {
        throw createHttpError(
          400,
          templateConstants.REMOVE_ASSOCIATION('additional service', 'merchant')
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

// Create an instance of the validation class and export it
const validateAdditionalService = new ValidateAdditionalService();
export { validateAdditionalService };
