import { NextFunction, Request, Response } from 'express';
import { HolidayService } from '../services/holiday.service';
import { dataFromRequest } from '../../../helpers/basic_helper';
import createHttpError from 'http-errors';
import { templateConstants } from '../../../common/templateConstants';

/**
 * Class for validating holiday-related requests
 *
 * This class provides methods to validate various aspects of holiday-related requests,
 * such as checking if a holiday name already exists or if a holiday ID is valid.
 */
class ValidateHoliday {
  private holidayService: typeof HolidayService;
  constructor() {
    this.holidayService = HolidayService; // Initialize the BadgeService
  }

  /**
   * Method to validate if the holiday ID is valid
   *
   * This method checks if a holiday with the given ID exists in the system.
   * If it does not, an HTTP error is thrown. Otherwise, the request proceeds to the next middleware.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async validateHolidayId(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const { holidayId } = dataFromRequest(req);
      const validId = await this.holidayService.holidayIdExist(holidayId); // Check if holiday ID exists
      if (!validId) {
        throw createHttpError(400, templateConstants.INVALID(`holiday id`)); // Throw error if holiday ID is invalid
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateNewHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const { holidayName, holidayDate } = dataFromRequest(req);
      const year = String(new Date(holidayDate).getFullYear());
      const holiday = await this.holidayService.holidayExist(holidayName, year); // Check if holiday ID exists
      if (holiday) {
        throw createHttpError(400, templateConstants.ALREADY_EXIST(`Holiday`)); // Throw error if holiday ID is invalid
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the validation class and export it
const validateHoliday = new ValidateHoliday();
export { validateHoliday };
