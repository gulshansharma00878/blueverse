import { NextFunction, Request } from 'express';
import { templateConstants } from '../../common/templateConstants';
import { TermsAndPrivacyPolicy } from '../../models/termsAndPrivayPolicy';
import { isAdmin } from '../../services/commonService';
import createError from 'http-errors';

class TermsAndPolicy {
  async updateTermsAndPolicy(req: any, res: any, next: NextFunction) {
    try {
      const { privacy_policy, terms_of_use, isActive } = req.body;
      const id = req.params.id;
      const dataForUpdate: any = {};
      if (privacy_policy) {
        dataForUpdate['privacyPolicy'] = privacy_policy;
      }
      if (terms_of_use) {
        dataForUpdate['termsOfUse'] = terms_of_use;
      }
      if (isActive == 'true' || isActive == 'false') {
        dataForUpdate['isActive'] = isActive;
      }
      const isExist = await TermsAndPrivacyPolicy.findByPk(id);
      if (!isExist) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      if (Object.keys(dataForUpdate).length) {
        await TermsAndPrivacyPolicy.update(dataForUpdate, {
          where: { policyId: id },
        });
      }
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('TermsAndPolicy'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getTermsAndPolicyList(req: Request, res: any, next: NextFunction) {
    try {
      const privacyPolicy = await TermsAndPrivacyPolicy.findAll({});
      res.locals.response = {
        body: {
          data: privacyPolicy,
        },
        message: templateConstants.LIST_OF('Privacy policy and terms of use'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getTermsAndPolicy(req: Request, res: any, next: NextFunction) {
    try {
      const data = await TermsAndPrivacyPolicy.findAll({
        where: { isActive: true },
      });
      let policy: any = '';
      for (const _policy of data) {
        if (req.query.type === _policy.type) policy = _policy;
      }

      res.locals.response = {
        body: {
          data: policy ? policy : null,
        },
        message: templateConstants.DETAIL('Privacy policy and terms of use'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
export = new TermsAndPolicy();
