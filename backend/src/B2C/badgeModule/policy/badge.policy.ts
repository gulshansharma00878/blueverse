import { NextFunction, Request, Response } from 'express';
import { BadgeService } from '../services/badge.service';
import { dataFromRequest } from '../../../helpers/basic_helper';
import createHttpError from 'http-errors';
import { templateConstants } from '../../../common/templateConstants';

/**
 * Class for validating badge-related requests
 *
 * This class provides methods to validate various aspects of badge-related requests,
 * such as checking if a badge name already exists or if a badge ID is valid.
 */
class ValidateBadge {
  private badgeService: typeof BadgeService;
  constructor() {
    this.badgeService = BadgeService; // Initialize the BadgeService
  }

  /**
   * Method to validate if the badge name already exists when adding a new badge
   *
   * This method checks if a badge with the given name already exists in the system.
   * If it does, an HTTP error is thrown. Otherwise, the request proceeds to the next middleware.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async validateNewBadge(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const { badgeName, badgeUrl, criteria, badgeDescription } =
        dataFromRequest(req);
      const nameExist = await this.badgeService.badgeNameExist(badgeName); // Check if badge name exists
      if (nameExist) {
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(`A badge with the name ${badgeName}`)
        ); // Throw error if badge name exists
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  /**
   * Method to validate if the badge ID is valid
   *
   * This method checks if a badge with the given ID exists in the system.
   * If it does not, an HTTP error is thrown. Otherwise, the request proceeds to the next middleware.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async validateBadgeId(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const { badgeId } = dataFromRequest(req);
      const validId = await this.badgeService.badgeIdExist(badgeId); // Check if badge ID exists
      if (!validId) {
        throw createHttpError(400, templateConstants.INVALID(`badge id`)); // Throw error if badge ID is invalid
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the validation class and export it
const validateBadge = new ValidateBadge();
export { validateBadge };
