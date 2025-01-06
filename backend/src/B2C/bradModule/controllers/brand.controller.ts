import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brand.service';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { isNullOrUndefined } from '../../../common/utility';

class BrandController {
  private brandService: typeof BrandService;

  constructor() {
    this.brandService = BrandService;
  }

  async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, isTwoWheeler, isFourWheeler } = dataFromRequest(req); // Extract data from request
      const body = {
        name: name,
        isTwoWheeler,
        isFourWheeler,
      };

      // Calling the service
      const brandData = await this.brandService.createBrand(body);

      // Prepare response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('brand'),
        body: {
          data: {
            brandData: brandData,
          },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  async getBrand(req: Request, res: Response, next: NextFunction) {
    try {
      // Calling the service
      const brandData = await this.brandService.getBrand();

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('brand'),
        body: {
          data: { brandData: brandData },
        },
      };

      next();
    } catch (err: any) {
      next(err);
    }
  }

  // Method to get the list of additional services
  async getBrandList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, sortBy, orderBy, isTwoWheeler, isFourWheeler } =
        dataFromRequest(req); // Extract pagination and sorting parameters from request
      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        limit: _limit,
        offset: _offset,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
        isTwoWheeler,
        isFourWheeler,
      };
      const brandList = await this.brandService.getBrandList(queryBody); // Call service method to get additional services
      res.locals.response = {
        message: templateConstants.LIST_OF('Brand List'),
        body: {
          data: {
            brandList: brandList.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              brandList.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to update the details of a specific brand
  async updateBrandDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, isActive, brandId, isTwoWheeler, isFourWheeler } =
        dataFromRequest(req); // Extract data from request
      const body: any = {};
      if (!isNullOrUndefined(name)) {
        body['name'] = name; // Update brand name if provided
      }
      if (!isNullOrUndefined(isActive)) {
        body['isActive'] = isActive; // Update brand active status if provided
      }
      if (!isNullOrUndefined(isTwoWheeler)) {
        body['isTwoWheeler'] = isTwoWheeler;
      }
      if (!isNullOrUndefined(isFourWheeler)) {
        body['isFourWheeler'] = isFourWheeler;
      }

      await this.brandService.updateBrandDetails(body, brandId); // Call service method to update brand details
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Brand Detail'),
        body: {},
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
  // Method to delete a specific additional service
  async deleteBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { brandId } = dataFromRequest(req); // Extract brand ID from request
      await this.brandService.deleteBrand(brandId); // Call service method to delete brand

      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Brand'),
        body: {},
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get the details of a specific bran details
  async getBrandDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { brandId } = dataFromRequest(req); // Extract additional service ID from request
      const brandDetail =
        await this.brandService.getBrandDetails(
          brandId
        ); // Call service method to get additional service details
      res.locals.response = {
        message: templateConstants.DETAIL('Brand Details'),
        body: {
          data: {
            brandDetail: brandDetail,
          },
        },
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

const brandController = new BrandController();
export { brandController };
