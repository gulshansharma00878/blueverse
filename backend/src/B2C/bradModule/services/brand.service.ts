import { isNullOrUndefined } from '../../../common/utility';
import { serviceListQueryBody } from '../../additionalService/types/additionService.type';
import { MasterBrandList } from '../../models/master_brand_list';

class BrandServices {
  async createBrand(body: any) {
    try {
      return await MasterBrandList.create(body);
    } catch (err: any) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getBrand() {
    try {
      // Creating the new entry for brand of car
      return await MasterBrandList.findAll();
    } catch (err: any) {
      return Promise.reject(err);
    }
  }

  // Method to get a list of brand with pagination and sorting
  async getBrandList(queryBody: serviceListQueryBody) {
    try {
      let { limit, offset, sortBy, orderBy, isTwoWheeler, isFourWheeler } =
        queryBody;
      let sortOrder: any = [[sortBy, orderBy]]; // Sort order for the query
      const whereCondition: any = {
        deletedAt: null,
      };
      if (!isNullOrUndefined(isTwoWheeler)) {
        whereCondition['isTwoWheeler'] = isTwoWheeler;
      }
      if (!isNullOrUndefined(isFourWheeler)) {
        whereCondition['isFourWheeler'] = isFourWheeler;
      }
      return await MasterBrandList.findAndCountAll({
        where: whereCondition,
        order: sortOrder, // Apply sorting
        limit: limit, // Limit the number of results
        offset: offset, // Offset for pagination
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Method to update an brand details
  async updateBrandDetails(body: any, brandId: string) {
    try {
      return await MasterBrandList.update(body, {
        where: {
          brandId: brandId, // Update the brand by ID
        },
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Method to "delete" an Brand by setting the deletedAt timestamp
  async deleteBrand(brandId: string) {
    try {
      return await MasterBrandList.update(
        {
          deletedAt: new Date(), // Set the deletedAt timestamp to mark the service as deleted
        },
        {
          where: {
            brandId: brandId, // Find the brand by ID
          },
        }
      );
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

   // Method to get details of a specific additional service by ID
   async getBrandDetails(brandId: string) {
    try {
      return await MasterBrandList.findOne({
        where: {
          brandId: brandId, // Find the service by ID
        },
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }
}

const BrandService = new BrandServices();
export { BrandService };
