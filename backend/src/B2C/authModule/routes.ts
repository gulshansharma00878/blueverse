import { authController } from './controllers/auth.controller';
import { validateDto } from '../common/dtoValidator';
import {
  CreateCustomerDTO,
  SendOtpDTO,
  VerifyOtpDTO,
  CustomerUpdateDTO,
  socialValidation
} from './dto/customer.dto';
import { validateCustomerApis } from './policies/auth.policy';
import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { validate } from 'express-validation';;

class AuthRoutes {
  private authController: typeof authController;

  constructor(private authRouter: any) {
    this.authRouter = authRouter;
    this.authController = authController;
    this.registerRoutes();
  }

  private registerRoutes() {

    this.authRouter.post(
      '/auth/sendOtp',
      validateDto(SendOtpDTO),
      validateCustomerApis.validateCustomerLogin.bind(validateCustomerApis),
      this.authController.sendOtpToMobile.bind(this.authController)
    );

    this.authRouter.post(
      '/auth/verifyOtp',
      validateDto(VerifyOtpDTO),
      validateCustomerApis.validateCustomerLogin.bind(validateCustomerApis),
     validateCustomerApis.validateVerifyOtpRequest.bind(validateCustomerApis),
      this.authController.verifyOtp.bind(this.authController)
    );


    this.authRouter.get(
      '/',
      authCustomerGuard.bind(authCustomerGuard),
      this.authController.getCustomer.bind(this.authController)
    );

    this.authRouter.get(
      '/auth/logout',
      authCustomerGuard.bind(authCustomerGuard),
      this.authController.logout.bind(this.authController)
    );

    this.authRouter.post(
      '/auth/social/signup',
      validate(socialValidation, {}, {}),
      validateCustomerApis.validateSocialLogin.bind(validateCustomerApis),
      this.authController.socialSignUp.bind(this.authController)
    );

    this.authRouter.post(
      '/apply/referralCode',
      validateCustomerApis.validateReferralCode.bind(validateCustomerApis),
      authCustomerGuard.bind(authCustomerGuard),
       this.authController.applyReferralCode.bind(this.authController)
    );
  }
}

export const authRoutes = (authRouter: any) => {
  return new AuthRoutes(authRouter);
};
