import { NextFunction, Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import createHttpError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { ReferAndEarn } from '../../models/refer_earn_setting';
import stringConstants from '../../../common/stringConstants';
import moment from 'moment';
// Class for validating merchant-related requests
class ValidateReferAndEarn {
  // Method to validate if the merchant name already exists when adding a new merchant
  async validateNewReferAndEarn(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract values from request body
      const { referAndEarnName, startDate, endDate } = dataFromRequest(req);

      const whereCondition: WhereOptions = {
        referAndEarnName: referAndEarnName,
        deletedAt: null,
      };
      const referAndEarn = await ReferAndEarn.findOne({
        where: whereCondition,
      });
      if (referAndEarn) {
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(
            `A referAndEarn with the name ${referAndEarnName}`
          )
        );
      }

      req.body.startDate = moment(startDate)
        .tz('Asia/Kolkata')
        .startOf('day')
        .toISOString();

      req.body.endDate = moment(endDate)
        .tz('Asia/Kolkata')
        .endOf('day')
        .toISOString();

      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateReferAndEarnId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      // Destruct the data
      const { referAndEarnId, startDate, endDate } = data;

      const whereCondition: WhereOptions = {
        referAndEarnId: referAndEarnId,
        deletedAt: null,
      };
      const referAndEarn = await ReferAndEarn.findOne({
        where: whereCondition,
      });
      if (isNullOrUndefined(referAndEarn)) {
        throw createHttpError(
          400,
          templateConstants.INVALID('referAndEarn id')
        );
      }

      req.body.startDate = moment(startDate)
        .tz('Asia/Kolkata')
        .startOf('day')
        .toISOString();
      
      req.body.endDate = moment(endDate)
        .tz('Asia/Kolkata')
        .endOf('day')
        .toISOString();
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateReferAndEarnDates(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      // Destruct the data
      const { startDate, endDate, referAndEarnId } = data;

      let whereCondition = referAndEarnId
        ? { referAndEarnId: { [Op.ne]: referAndEarnId } }
        : {};

      const referAndEarn = await ReferAndEarn.findAll({
        where: {
          ...whereCondition,
          [Op.or]: [
            {
              [Op.and]: [
                { startDate: { [Op.lte]: startDate } },
                { endDate: { [Op.gte]: startDate } },
              ],
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: endDate } },
                { endDate: { [Op.gte]: endDate } },
              ],
            },
            {
              [Op.and]: [
                { startDate: { [Op.gt]: startDate } },
                { endDate: { [Op.lt]: endDate } },
              ],
            },
            {
              [Op.and]: [{ startDate: startDate }, { endDate: endDate }],
            },
          ],
        },
      });

      if (referAndEarn.length) {
        throw createHttpError(400, stringConstants.genericMessage.DATE_INVALID);
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

// Create an instance of the validation class and export it
const validateReferAndEarn = new ValidateReferAndEarn();
export { validateReferAndEarn };
