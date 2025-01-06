import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { Op } from 'sequelize';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { MasterBrandList } from '../../models/master_brand_list';

// Class for validating additional service-related requests
class ValidateBrandService {
  // Method to validate if the additional service name already exists when adding a new service
  async validateBrandName(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destructure the value from request body
      const { name } = dataFromRequest(req);
      const isNameExist = await MasterBrandList.findOne({
        where: {
          name: name,
          deletedAt: null,
        },
      });
      if (isNameExist) {
        // Throw an error if the service name already exists
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(
            `An brand with the name ${name}`
          )
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate if the brand name already exists when updating a service
  async validateUpdateBrandName(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destructure the values from request body
      const { name, brandId } =
        dataFromRequest(req);
      if (!isNullOrUndefined(name)) {
        const isNameExist = await MasterBrandList.findOne({
          where: {
            name: name,
            deletedAt: null,
            brandId: {
              [Op.not]: brandId, // Exclude the current brand ID from the check
            },
          },
        });
        if (isNameExist) {
          // Throw an error if the brand name already exists
          throw createHttpError(
            400,
            templateConstants.ALREADY_EXIST(
              `An brand with the name ${name}`
            )
          );
        }
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate the brand ID
  async validateBrandId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Destructure the value from request body
      const { brandId } = dataFromRequest(req);
      if (!isValidGuid(brandId)) {
        // Throw an error if the service ID is not a valid GUID
        throw createHttpError(
          400,
          templateConstants.INVALID('brandId')
        );
      }
      const brand = await MasterBrandList.findOne({
        where: {
          deletedAt: null,
          brandId: brandId,
        },
      });
      if (!brand) {
        // Throw an error if the brand with the given ID does not exist
        throw createHttpError(
          400,
          templateConstants.DOES_NOT_EXIST(`brandId`)
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the validation class and export it
const validateBrandService = new ValidateBrandService();
export { validateBrandService };
