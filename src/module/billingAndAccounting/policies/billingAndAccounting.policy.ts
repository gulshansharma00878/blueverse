import { NextFunction } from 'express';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { Request, Response } from 'ts-express-decorators';
import { templateConstants } from '../../../common/templateConstants';
import createError from 'http-errors';

class BillingAndAccountingPolicy {
  async validateGetMemoDetailRequest(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      const isMemoExist = await MachineMemo.findOne({
        where: { machineMemoId: req.params.machineMemoId },
        attributes: ['machineMemoId'],
      });
      if (!isMemoExist) {
        throw createError(400, templateConstants.INVALID('machineMemoId'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}
const billingAndAccountingPolicy = new BillingAndAccountingPolicy();
export { billingAndAccountingPolicy };
