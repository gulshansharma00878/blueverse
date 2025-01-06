import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { validate } from 'express-validation';
import { brandController } from './controllers/brand.controller';
import { brandUpdateDTO, brandValidation } from './dto/brand.dto';
import { validateBrandService } from './policies/brand.policy';

class BrandRoutes {
  private brandController: typeof brandController;

  constructor(private brandRouter: any) {
    this.brandRouter = brandRouter;
    this.brandController = brandController;
    this.slotRoutes();
  }

  private slotRoutes() {
    this.brandRouter.post(
      '/brand',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validate(brandValidation, {}, {}),
      validateBrandService.validateBrandName.bind(validateBrandService),
      this.brandController.createBrand.bind(this.brandController)
    );

    this.brandRouter.get(
      '/brand',
      this.brandController.getBrand.bind(this.brandController)
    );

    // API to get list of brand names
    this.brandRouter.get(
      '/brandList',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      this.brandController.getBrandList.bind(this.brandController) // Controller method to handle the request
    );

    // API to update brand name details
    this.brandRouter.put(
      '/brand/:brandId',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validate(brandUpdateDTO, {}, {}), // Middleware to validate the request body
      validateBrandService.validateBrandId.bind(validateBrandService), // Custom validation middleware for brand ID
      validateBrandService.validateUpdateBrandName.bind(validateBrandService), // Custom validation middleware for updating brand name
      this.brandController.updateBrandDetail.bind(this.brandController) // Controller method to handle the request
    );

    // API to delete additional service name details
    this.brandRouter.delete(
      '/brand/:brandId',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validateBrandService.validateBrandId.bind(validateBrandService), // Custom validation middleware for brand ID
      this.brandController.deleteBrand.bind(this.brandController) // Controller method to handle the request
    );

    // API to get additional service name details
    this.brandRouter.get(
      '/brand/:brandId',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validateBrandService.validateBrandId.bind(validateBrandService), // Custom validation middleware for brand ID
      this.brandController.getBrandDetail.bind(
        this.brandController
      ) // Controller method to handle the request
    );

    // API to get list of brand names
    this.brandRouter.get(
      '/customer/brandList',
      authCustomerGuard.bind(authCustomerGuard), // Middleware to verify the client
      this.brandController.getBrandList.bind(this.brandController) // Controller method to handle the request
    );
  }
}

export const brandRoutes = (brandRouter: any) => {
  return new BrandRoutes(brandRouter);
};
