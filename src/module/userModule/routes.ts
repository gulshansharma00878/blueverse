import { validateUserApis } from './policies/user.policies';
import { validateDealerApis } from './policies/dealer.policies';
import validateUserAPIJOI from './validators/user.chain';
import dealerChain from './validators/dealer.chain';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { userController } from './controllers/user.controller';
import { validate } from 'express-validation';
import dealerController from './controllers/dealer.controller';
import userChain from './validators/user.chain';

class UserRoutes {
  constructor(private userRouter: any) {
    this.userRouter = userRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    /**
     * @route POST /user/register
     * @group User - Operations about user
     * @param {string} email.body.required - email - eg: user@domain
     * @param {string} password.body.required - user's password.
     * @param {string} username.body.required - user's username.
     * @returns {object} 200 - Token Successfully registered
     * @returns {Error}  default - Server Error
     */
    this.userRouter.post(
      '/register',
      validateUserApis.validateRegisterRequest.bind(validateUserApis),
      userController.register
    );
    /**
     * @route POST /user/authenticate
     * @group User - Operations about user
     * @param {string} email.body.required - email - eg: user@domain
     * @param {string} password.body.required - user's password.
     * @returns {object} 200 - Token Successfully login
     * @returns {Error}  default - Server Error
     */
    this.userRouter.post(
      '/authenticate',
      validateUserApis.validateLoginRequest.bind(validateUserApis),
      userController.login
    );

    this.userRouter.get('/deleteu', dealerController.deleteUserConstraints);
    /**
     * @route DELETE /user/authenticate
     * @group User - Operations about user
     * @returns {object} 200 - Successfully logged out
     * @returns {Error}  default - Server Error
     */
    this.userRouter.delete(
      '/authenticate',
      verifyClient.bind(verifyClient),
      userController.logout
    );
    /**
     * @route POST /user/password/forgot
     * @param {string} email.body.required - email - eg: user@domain
     * @group User - Operations about user
     * @returns {object} 200 - Successfully logged out
     * @returns {Error}  default - Server Error
     */
    this.userRouter.post(
      '/password/forgot',
      validateUserApis.validateForgotPasswordRequest,
      userController.forgotPassword
    );

    /**
     * @route POST /user/
     * @param {string} email.body.required - email - eg: user@domain
     * @param {string} verification_code.body.required - verification_code - eg: user
     * @group User - Operations about user
     * @returns {object} 200 - Otp verified successfully
     * @returns {Error}  default - Server Error
     */
    this.userRouter.post(
      '/verify/otp',
      validate(validateUserAPIJOI.verifyOtpValidation, {}, {}),
      validateUserApis.validateVerifyOtpRequest,
      userController.verifyOtp
    );

    /**
     * @route PUT /user/password/reset
     * @param {Number} verification_code.body.required - verification_code - eg: 111111
     * @param {string} email.body.required - email - eg: user@domain
     * @param {string} new_password.body.required - new_password - eg: test13@
     * @group User - Operations about user
     * @returns {object} 200 - Successfully logged out
     * @returns {Error}  default - Server Error
     */
    this.userRouter.put(
      '/password/reset',
      validateUserApis.validateResetPasswordRequest,
      userController.resetPassword
    );

    /**
     * @route POST /user/agent
     * @param {string} username.body.required - username - tester
     * @param {string} email.body.required - email - eg: user@domain
     * @param {string} phone.body- phone- eg: +919111111111
     * @param {boolean} is_active.body.required- is_active- eg: true
     * @group User - Operations about user
     * @returns {object} 200 - Agent Successfully created
     * @returns {Error}  default - Server Error
     */
    this.userRouter.post(
      '/agent',
      verifyClient.bind(verifyClient),
      validate(validateUserAPIJOI.createAgentValidation, {}, {}),
      validateUserApis.validateCreateAgentRequest,
      userController.createAgent
    );

    /**
     * @route PUT /user/agent/:id
     * @param {string} username.body- username - tester
     * @param {string} email.body- email - eg: user@domain
     * @param {string} phone.body- phone- eg: +919111111111
     * @param {boolean} is_active.body- is_active- eg: true
     * @group User - Operations about user
     * @returns {object} 200 - Agent Successfully Updated
     * @returns {Error}  default - Server Error
     */
    this.userRouter.put(
      '/agent/:id',
      verifyClient.bind(verifyClient),
      validate(validateUserAPIJOI.updateAgentValidation, {}, {}),
      validateUserApis.validateUpdateAgentRequest,
      userController.updateAgent
    );

    /**
     * @route DELETE /user/agent/:id
     * @group User - Operations about user
     * @returns {object} 200 - Agent Successfully Deleted
     * @returns {Error}  default - Server Error
     */
    this.userRouter.delete(
      '/agent/:id',
      verifyClient.bind(verifyClient),
      validateUserApis.validateDeleteAgentRequest,
      userController.deleteAgent
    );

    /**
     * @route DEACTIVATE /user/agent/:id
     * @group User - Operations about user
     * @returns {object} 200 - Agent Successfully Deleted
     * @returns {Error}  default - Server Error
     */
    this.userRouter.patch(
      '/agent/:id/deactivate',
      verifyClient.bind(verifyClient),
      validateUserApis.validateAgent,
      userController.deactivateAgent
    );

    /**
     * @route ACTIVATE /user/agent/:id
     * @group User - Operations about user
     * @returns {object} 200 - Agent Successfully Deleted
     * @returns {Error}  default - Server Error
     */
    this.userRouter.patch(
      '/agent/:id/activate',
      verifyClient.bind(verifyClient),
      validateUserApis.validateAgent,
      userController.activateAgent
    );

    /**
     * @route GET /user/agent/list
     * @group User - Operations about user
     * @returns {object} 200 - Agent List
     * @returns {Error}  default - Server Error
     */
    this.userRouter.get(
      '/agent/list',
      verifyClient.bind(verifyClient),
      userController.getAgentList
    );

    this.userRouter.put(
      '/password/update',
      verifyClient.bind(verifyClient),
      validate(userChain.validateUpdatePassword, {}, {}),
      validateUserApis.validateUpdatePasswordRequest,
      userController.changePassword
    );

    this.userRouter.put(
      '/profile/update',
      verifyClient.bind(verifyClient),
      validate(userChain.validateUpdateProfile, {}, {}),
      validateUserApis.validateUpdateProfile,
      userController.updateProfile
    );

    this.userRouter.get(
      '/oem/dealer',
      verifyClient.bind(verifyClient),
      validateUserApis.validateGetOEMDealerRequest,
      userController.getOEMDealer
    );

    this.userRouter.post(
      '/dealer/create',
      verifyClient.bind(verifyClient),
      validate(dealerChain.createDealerValidation, {}, {}),
      validateDealerApis.validateCreateDealerRequest,
      dealerController.createDealer
    );
    this.userRouter.post(
      '/dealer/outlet/machine/create',
      verifyClient.bind(verifyClient),
      validate(dealerChain.assignMachineToDealerOutlet, {}, {}),
      validateDealerApis.validateAssignMachineToDealerOutletRequest,
      dealerController.assignMachineToDealerOutlet
    );
    this.userRouter.get(
      '/machine',
      verifyClient.bind(verifyClient),
      dealerController.getMachineListForAssignDealer
    );
    this.userRouter.get(
      '/dealer/outlet/list',
      verifyClient.bind(verifyClient),
      validateUserApis.validateGetDealersOutletRequest,
      dealerController.getDealersOutletList
    );
    this.userRouter.delete(
      '/dealer/delete/:dealerId',
      verifyClient.bind(verifyClient),
      validateDealerApis.validateDeleteDealerRequest,
      dealerController.deleteDealer
    );

    this.userRouter.post(
      '/dealer/subscription/setting/:dealerId',
      verifyClient.bind(verifyClient),
      validate(dealerChain.validateDealerSubscriptionSetting, {}, {}),
      validateDealerApis.validateDealerSubscriptionSettingRequest,
      dealerController.createDealerSubscriptionSetting
    );
    this.userRouter.get(
      '/dealer/list',
      verifyClient.bind(verifyClient),
      dealerController.getDealerList
    );

    this.userRouter.put(
      '/dealer/update/:dealerId',
      verifyClient.bind(verifyClient),
      validate(dealerChain.updateDealerRequest, {}, {}),
      validateDealerApis.validateUpdateDealerRequest,
      dealerController.updateDealer
    );
    this.userRouter.put(
      '/dealer/outlet/machine/update/:dealerId',
      verifyClient.bind(verifyClient),
      validate(dealerChain.validateUpdateOutletAssignMachine, {}, {}),
      validateDealerApis.validateUpdateOutletAssignMachine,
      dealerController.updateOutletAssignMachine
    );
    this.userRouter.get(
      '/dealer/detail/:dealerId',
      verifyClient.bind(verifyClient),
      validateDealerApis.validateGetDealerDetailById,
      dealerController.getDealerDetailById
    );

    this.userRouter.get(
      '/module/list',
      verifyClient.bind(verifyClient),
      userController.getModuleList
    );
    this.userRouter.get(
      '/subrole/list',
      verifyClient.bind(verifyClient),
      userController.getSubRoleList
    );
    this.userRouter.post(
      '/subrole/create',
      verifyClient.bind(verifyClient),
      validate(userChain.validateCreateSubRoleRequest, {}, {}),
      validateUserApis.validateCreateSubRoleRequest,
      userController.createSubRole
    );

    this.userRouter.put(
      '/subrole/update/:subRoleId',
      verifyClient.bind(verifyClient),
      validate(userChain.validateUpdateSubRole, {}, {}),
      validateUserApis.validateUpdateSubRoleRequest,
      userController.updateSubRole
    );
    this.userRouter.delete(
      '/subrole/delete/:subRoleId',
      verifyClient.bind(verifyClient),
      validateUserApis.validateDeleteRoleRequest,
      userController.deleteSubRole
    );

    this.userRouter.get(
      '/employee/list',
      verifyClient.bind(verifyClient),
      validateDealerApis.validateDeleteDealerRequest,
      userController.getEmployeeList
    );

    this.userRouter.delete(
      '/employee/delete/:employeeId',
      verifyClient.bind(verifyClient),
      validateUserApis.validateDeleteEmployeeRequest,
      userController.deleteEmployee
    );

    this.userRouter.post(
      '/employee/create',
      verifyClient.bind(verifyClient),
      validate(userChain.validateCreateEmployee, {}, {}),
      validateUserApis.validateCreateEmployeeRequest,
      userController.createEmployee
    );

    this.userRouter.put(
      '/employee/update/:employeeId',
      verifyClient.bind(verifyClient),
      validate(userChain.validateUpdateEmployee, {}, {}),
      validateUserApis.validateUpdateEmployeeRequest,
      dealerController.updateEmployee
    );

    this.userRouter.post(
      '/dealer/verify/kyc/otp',
      validate(dealerChain.validateVerifyDealerKycOTPRequest),
      validateDealerApis.validateVerifyDealerKycOtpRequest,
      dealerController.verifyDealerKycOTP
    );

    this.userRouter.get(
      '/profile',
      verifyClient.bind(verifyClient),
      userController.getProfile
    );

    this.userRouter.post(
      '/dealer/kyc/otp',
      validateDealerApis.sendDealerKycOtpOnPhonePhone,
      dealerController.sendDealerKycOtpOnPhonePhone
    );

    this.userRouter.get(
      '/employee/detail/:employeeId',
      verifyClient.bind(verifyClient),
      validateUserApis.validateDeleteEmployeeRequest,
      userController.getEmployeeDetailById
    );
    this.userRouter.get(
      '/subRole/detail/:subRoleId',
      verifyClient.bind(verifyClient),
      userController.getSubRoleDetailById
    );
    this.userRouter.get(
      '/agent/machine/list',
      verifyClient.bind(verifyClient),
      userController.getAgentMachineWithDetail
    );
  }
}
const userRoutes = (userRouter: any) => {
  return new UserRoutes(userRouter);
};

export = {
  UserRoutes,
  userRoutes,
};
