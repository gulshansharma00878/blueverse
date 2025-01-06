import { Op } from 'sequelize';
import { AdditionalService } from '../../models/additional_service';
import {
  serviceListQueryBody,
  updateAdditionalServiceBody,
} from '../types/additionService.type';
import { isNullOrUndefined } from '../../../common/utility';

// Service class for managing additional services
class AdditonalSeriveServices {
  // Method to add a new additional service
  async addAdditionalService(additionalServiceBody: any) {
    try {
      return await AdditionalService.create(additionalServiceBody);
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Method to get a list of additional services with pagination and sorting
  async getAdditionalServiceList(queryBody: serviceListQueryBody) {
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
      return await AdditionalService.findAndCountAll({
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

  // Method to get details of a specific additional service by ID
  async getAdditionalServiceDetails(additionalServiceId: string) {
    try {
      return await AdditionalService.findOne({
        where: {
          additionalServiceId: additionalServiceId, // Find the service by ID
        },
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Method to update an additional service's details
  async updateAdditionalServiceDetails(
    body: updateAdditionalServiceBody,
    addAdditionalServiceId: string
  ) {
    try {
      return await AdditionalService.update(body, {
        where: {
          additionalServiceId: addAdditionalServiceId, // Update the service by ID
        },
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Method to "delete" an additional service by setting the deletedAt timestamp
  async deleteAdditionalService(addAdditionalServiceId: string) {
    try {
      return await AdditionalService.update(
        {
          deletedAt: new Date(), // Set the deletedAt timestamp to mark the service as deleted
        },
        {
          where: {
            additionalServiceId: addAdditionalServiceId, // Find the service by ID
          },
        }
      );
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getAdditionalServiceByIds(additionalServiceId: string[]) {
    try {
      return await AdditionalService.count({
        where: {
          additionalServiceId: {
            [Op.in]: additionalServiceId,
            deletedAt: null,
          },
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

// Create an instance of the service class and export it
const AdditonalSeriveService = new AdditonalSeriveServices();
export { AdditonalSeriveService };
