import {
  validateIndexFeedback,
  validateSubmitCustomerFeedbackForm,
} from './validators/feedback.chain';
import { _validate } from '../../helpers/validate';

//policies
import { feedbackPolicy } from './policies/feedback.policy';

//controllers
import { feedbackController } from './controllers/feedback.controller';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { feedbackService } from './services/feedback.service';
import { validate } from 'express-validation';
import { validateUserApis } from '../userModule/policies/user.policies';
import { abandonedFeedbackController } from './controllers/abandonedFeedback.controller';
import { feedbackAnalyticsController } from './controllers/FeedbackAnalytics.controller';

class FeedbackRoutes {
  constructor(private feedbackRouter: any) {
    this.feedbackRouter = feedbackRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.feedbackRouter.post(
      '/form/create',
      verifyClient.bind(verifyClient),
      feedbackService.validateCreateFeedbackRequest,
      feedbackController.createFeedbackForm
    );

    this.feedbackRouter.put(
      '/form/update/:formId',
      verifyClient.bind(verifyClient),
      feedbackService.validateCreateFeedbackRequest,
      feedbackController.updateFeedbackForm // if any one response exist question can't be deleted
    );
    this.feedbackRouter.delete(
      '/form/delete/:formId',
      verifyClient.bind(verifyClient),
      feedbackService.validateFormDelete,
      feedbackController.deleteFeedbackForm // add check if any response exist
    );

    this.feedbackRouter.post(
      '/form/machine/agent/assign/:formId',
      verifyClient.bind(verifyClient),
      feedbackService.validateAgentAssign,
      feedbackController.assignAgentFeedbackForm
    );

    this.feedbackRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexFeedback),
      feedbackPolicy.index,
      feedbackController.index
    );

    this.feedbackRouter.get(
      '/form/customer/:skuNumber',
      feedbackService.validateGetCustomerFeedbackForm,
      feedbackController.getCustomerFeedbackForm
    );

    this.feedbackRouter.post(
      '/form/submit',

      validate(validateSubmitCustomerFeedbackForm, {}, {}),
      feedbackService.validateSubmitCustomerFeedbackForm,
      feedbackController.submitCustomerFeedbackForm
    );

    this.feedbackRouter.get(
      '/form/:formId',
      verifyClient.bind(verifyClient),
      feedbackController.getFeedbackFormById
    );

    this.feedbackRouter.get(
      '/outlet/machine/list',
      verifyClient.bind(verifyClient),
      validateUserApis.validateGetDealersOutletRequest,
      feedbackController.getOutletWithMachineAndAgents
    );

    this.feedbackRouter.get(
      '/abandoned/list',
      verifyClient.bind(verifyClient),
      abandonedFeedbackController.getAbandonedFeedbackList
    );

    this.feedbackRouter.put(
      '/abandoned/customer/update/:transactionFeedbackId',
      verifyClient.bind(verifyClient),
      feedbackPolicy.validateCustomerRequest,
      abandonedFeedbackController.updateCustomerDetails
    );

    this.feedbackRouter.get(
      '/analytics/question/response/list/:questionId',
      verifyClient.bind(verifyClient),
      feedbackPolicy.validateQuestion,
      feedbackAnalyticsController.getFeedbackQuestionResponseList
    );

    this.feedbackRouter.get(
      '/analytics/form/:formId',
      verifyClient.bind(verifyClient),
      feedbackPolicy.validateFormId,
      feedbackAnalyticsController.getFormAnalytics
    );

    this.feedbackRouter.get(
      '/form/mapping/:formId',
      verifyClient.bind(verifyClient),
      feedbackController.getFormMappingDetailsByFormID
    );

    this.feedbackRouter.get(
      '/response/export/:formId',
      verifyClient.bind(verifyClient),
      feedbackAnalyticsController.exportFormResponse
    );
    this.feedbackRouter.post(
      '/abandoned/whatsapp/notification',
      verifyClient.bind(verifyClient),
      feedbackController.sendAbandonedFormNotification
    );

    this.feedbackRouter.get(
      '/merchant/machine/list',
      verifyClient.bind(verifyClient),
      validateUserApis.validateGetMerchantRequest,
      feedbackController.getMerchantWithMachineAndAgents
    );
  }
}
const feedbackRoutes = (feedbackRouter: any) => {
  return new FeedbackRoutes(feedbackRouter);
};

export = {
  FeedbackRoutes: FeedbackRoutes,
  feedbackRoutes: feedbackRoutes,
};
