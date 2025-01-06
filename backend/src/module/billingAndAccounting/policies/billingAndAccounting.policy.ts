import { NextFunction } from 'express';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import { Request, Response } from 'ts-express-decorators';
import { templateConstants } from '../../../common/templateConstants';
import createError from 'http-errors';
import { config } from '../../../config/config';

class BillingAndAccountingPolicy {
  async validateGetMemoDetailRequest(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      const whereCondition: any = {
        machineMemoId: req.params.machineMemoId,
      };
      if (res.user.role !== config.userRolesObject.ADMIN) {
        let dealerId;
        if (res.user.parentUserId && res.user.subRoleId) {
          dealerId = res.user.parentUserId;
        } else {
          dealerId = res.user.userId;
        }
        whereCondition['dealerId'] = dealerId;
      }
      const isMemoExist = await MachineMemo.findOne({
        where: whereCondition,
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
