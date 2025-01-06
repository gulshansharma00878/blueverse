import { washController } from './controllers/wash.controller';
import { validateUserApis } from '../userModule/policies/user.policies';
import {
  verifyClient,
  authCustomerGuard,
} from '../../services/common/requestResponseHandler';
import { validate } from 'express-validation';
import validateWashApisJOI from '../../services/validationService/expressValidator/validateWashApis';
import validateWashApis from '../../services/validationService/dbValidator/validateWashApis';

class WashRoutes {
  constructor(private washRouter: any) {
    this.washRouter = washRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    /**
     * @route POST /wash/list
     * @param {string} sort_by.body - sort_by - eg: NEWEST- OLDEST
     * @param {string} status.body.required - status - eg: FEEDBACK_NOT_STARTED | FEEDBACK_IN_PROGRESS | FEEDBACK_COMPLETED
     * @param {string} search.body- search - eg: customer_name , sku_number - hsrp_number
     * @param {Number} offset.body.required - offset - eg: 1
     * @param {Number} limit.body.required - limit - eg: 1
     * @param {JSON} filters.body.required - wash_type:"",date_range:{from_date:"",to_date:""} eg:  { wash_type:"",date_range:{from_date:"",to_date:""}}
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/list',
      verifyClient.bind(verifyClient),
      washController.getWashList
    );
    /**
     * @route POST /wash/generate/feedback
     * @param {string} email_id.body.required - email_id - eg: user@domain
     * @param {string} phone.body.required - phone - eg: 1111111111
     * @param {string} name.body.required - name - eg: test
     * @param {string} manufacturer.body.required - manufacturer - eg: test
     * @param {string} transaction_guid.body.required - transaction_guid - eg: UUID
     * @param {string} hsrp_number.body.required - hsrp_number - eg: test
     * @param {string} bike_model.body.required - bike_model - eg: test
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/generate/feedback',
      verifyClient.bind(verifyClient),
      validateUserApis.validateGenerateFeedbackRequest,
      washController.generateFeedbackURL
    );

    /**
     * @route PUT /wash/generate/feedback/:id
     * @param {string} email_id.body - email_id - eg: user@domain
     * @param {string} phone.body - phone - eg: 1111111111
     * @param {string} name.body - name - eg: test
     * @param {string} manufacturer.body- manufacturer - eg: test
     * @param {string} transaction_guid.body - transaction_guid - eg: UUID
     * @param {string} hsrp_number.body - hsrp_number - eg: test
     * @param {string} bike_model.body - bike_model - eg: test
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.put(
      '/generate/feedback/:id',
      verifyClient.bind(verifyClient),
      validate(validateWashApisJOI.updateFeedbackGenerate),
      validateWashApis.validateUpdateFeedbackRequest,
      washController.updateFeedback
    );

    /**
     * @route POST /wash/transaction
     * @param {string} wash_type.body.required - sku_number - eg: user@domain
     * @param {string} sku_number.body.required - wash_type - eg: ENUM
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/transaction',
      verifyClient.bind(verifyClient),
      washController.createTransactions
    );
    /**
     * @route POST /wash/admin/washList
     * @param {string} sort_by.body - sort_by - eg: WashTime ASC/DESC
     * @param {string} status.body.required - status - eg: FEEDBACK_NOT_STARTED | FEEDBACK_IN_PROGRESS | FEEDBACK_COMPLETED
     * @param {string} search.body- search - eg: sku_number
     * @param {Number} offset.body.required - offset - eg: 1
     * @param {Number} limit.body.required - limit - eg: 1
     * @param {JSON} filters.body.required - machineIds:[],oemIds:[],cityIds:[], stateIds:[],regionIds:[],dealerIds:[] eg:cityIds:["2d3a1602-2787-4232-b731-ec24f5fe8272",]
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/admin/washList',
      verifyClient.bind(verifyClient),
      washController.getAdminDealerWashList
    );
    /**
     * @route Get /wash/admin/washDetail/
     * @param {string} queryParameter.washId.required -eg: washId=a3e339b8-cd5b-11ed-afa1-0242ac120006
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.get(
      '/admin/washDetail/:washId',
      verifyClient.bind(verifyClient),
      washController.getwashDetail
    );
    /**
     * @route POST /dealer/washList
     * @param {string} sort_by.body - sort_by - eg: WashTime ASC/DESC
     * @param {string} search.body- search - eg: "search":"SKUTEST",
     * @param {Number} offset.body.required - offset - eg: 1
     * @param {Number} limit.body.required - limit - eg: 1
     * @param {JSON} filters.body.required - outletIds:[],machineIds:[],washTypeIds:[], eg:outletIds:["2d3a1602-2787-4232-b731-ec24f5fe8272",]
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/dealer/washList',
      verifyClient.bind(verifyClient),
      washController.getAdminDealerWashList
    );
    /**
     * @route Get /wash/dealer/washDetail/
     * @param {string} queryParameter.washId.required -eg: washId=a3e339b8-cd5b-11ed-afa1-0242ac120006
     * @group Wash - Operations about wash
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.get(
      '/dealer/washDetail/:washId',
      verifyClient.bind(verifyClient),
      washController.getwashDetail
    );
    /**
     * @route Get /wash/admin/feedbackDetail/
     * @param {string} queryParameter.skuNumber.required -eg: skuNumber=SKUTEST
     * @group Wash - Operations about wash feedback detail
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.get(
      '/admin/feedbackDetail/:transactionFeedbackId',
      verifyClient.bind(verifyClient),
      washController.getCustomerFeedback
    );
    /**
     * @route Get /wash/washTypes/
     * @group Wash - Operations about wash types
     * @returns {object} 200 - Successfully
     * @returns {Error}  default - Server Error
     */
    this.washRouter.get(
      '/washTypes/',
      verifyClient.bind(verifyClient),
      washController.getWashTypeList
    );
    // Wash types for customers
    this.washRouter.get(
      '/customer/washTypes/',
      authCustomerGuard.bind(authCustomerGuard),
      washController.getCustomerWashTypes
    );

    this.washRouter.get(
      '/detail/:skuNumber',
      verifyClient.bind(verifyClient),
      washController.getWashDetailBySKU
    );
    /**
     * @route Get /wash/admin/exportCSV
     * @group Wash - Operations to export wash list data for admin
     * @returns {object} 200 - Successfully return csv file
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/admin/exportCSV',
      verifyClient.bind(verifyClient),
      washController.exportWashDetails
    );
    /**
     * @route Get /wash/dealer/exportCSV
     * @group Wash - Operations to export wash list data for admin
     * @returns {object} 200 - Successfully return csv file
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/dealer/exportCSV',
      verifyClient.bind(verifyClient),
      washController.exportWashDetails
    );
    /**
     * @route Get /wash/washTypeCount
     * @group Wash - Operations about different type of wash type count
     * @returns {object} 200 - Successfully return csv file
     * @returns {Error}  default - Server Error
     */
    this.washRouter.post(
      '/washTypeCount',
      verifyClient.bind(verifyClient),
      washController.getWashTypeCount
    );
    // API to generate all wash certificates as client requirement
    this.washRouter.post(
      '/generateAllCertificates',
      washController.generateCertificate
    );
  }
}
const washRoutes = (washRouter: any) => {
  return new WashRoutes(washRouter);
};

export = {
  WashRoutes: WashRoutes,
  washRoutes: washRoutes,
};
