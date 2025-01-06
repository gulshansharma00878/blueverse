import validateTermsAndPolicy from '../services/validationService/expressValidator/validationTermsAndPolicyApis';
import { ExpressRouter } from 'ts-express-decorators';
import { verifyClient } from '../services/common/requestResponseHandler';
import { validate } from 'express-validation';
import termsAndPolicy from '../controllers/termsAndPolicy/termsAndPolicy';

class TermsAndPolicyRoutes {
  constructor(private termsAndPolicyRouter: ExpressRouter) {
    this.termsAndPolicyRouter = termsAndPolicyRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.termsAndPolicyRouter.put(
      '/:id',
      verifyClient.bind(verifyClient),
      validate(validateTermsAndPolicy.updateTermsAndPolicyValidation, {}, {}),
      termsAndPolicy.updateTermsAndPolicy
    );
    this.termsAndPolicyRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      termsAndPolicy.getTermsAndPolicyList
    );
    this.termsAndPolicyRouter.get('/', termsAndPolicy.getTermsAndPolicy);
  }
}
const termsAndPolicyRoutes = (termsAndPolicyRouter: any) => {
  return new TermsAndPolicyRoutes(termsAndPolicyRouter);
};

export = {
  TermsAndPolicyRoutes: TermsAndPolicyRoutes,
  termsAndPolicyRoutes: termsAndPolicyRoutes,
};
