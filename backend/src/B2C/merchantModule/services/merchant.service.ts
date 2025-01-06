// Import necessary modules and models
import { Merchant } from '../../models/merchant';
import { MerchantPricingTerm } from '../../models/merchant_pricing_term';
import { MerchantAdditionalServicePrice } from '../../models/merchant_additional_service_price';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { WashType } from '../../../models/wash_type';
import { AdditionalService } from '../../models/additional_service';
import { Machine } from '../../../models/Machine/Machine';
import { User } from '../../../models/User/user';
import { config } from '../../../config/config';
import { MachineAgent } from '../../../models/Machine/MachineAgent';
import {
  AddMerchantBody,
  AddPricingTermBody,
  AdditionalServiceBody,
  merchantListQueryBody,
} from '../types/merchant.type'; // Import necessary types/interfaces
import db from '../../../models/index'; // Import database instance
import { MerchantImages } from '../../models/merchant_images';
import {
  calculate_tax_details,
  isNullOrUndefined,
  isValidGuid,
} from '../../../common/utility'; // Import utility functions
import moment from 'moment-timezone'; // Import moment library for date/time manipulation
import { MerchantHoliday } from '../../models/merchant_holiday';
import { Holiday } from '../../models/holiday';
import { VehicleType } from '../../models/vehicle';
import { Booking, Status, WashBy } from '../../../B2C/models/booking';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';

/**
 * Service class containing methods related to merchant operations.
 * @class MerchantServices
 */

class MerchantServices {
  // Method to add a new merchant
  /**
   * Add a new merchant to the database.
   * @param {AddMerchantBody} body - The data of the new merchant.
   * @param {any} options - Additional options for database operation.
   * @returns {Promise<Merchant>} - The newly created merchant.
   */
  async addMerchant(body: AddMerchantBody, options: any) {
    try {
      return await Merchant.create(body, options);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to add pricing terms for a merchant
  /**
   * Add pricing terms for a merchant.
   * @param {AddPricingTermBody[]} pricingTermsBody - Array of pricing terms data.
   * @param {string} merchantId - The ID of the merchant.
   * @param {any} transaction - Transaction object for database operations.
   * @returns {Promise<MerchantPricingTerm[]>} - Array of created pricing terms.
   */
  async addMerchantPricingTerms(
    pricingTermsBody: AddPricingTermBody[],
    merchantId: string,
    transaction: any
  ) {
    try {
      pricingTermsBody.forEach((pricingTerm: AddPricingTermBody) => {
        pricingTerm.merchantId = merchantId;
        const totalAmount = Number(
          Number(pricingTerm.manPowerPrice) + Number(pricingTerm.washPrice)
        );
        const { grossAmount, cgstAmount, sgstAmount } =
          calculate_tax_details(totalAmount);
        pricingTerm['grossAmount'] = Number(grossAmount.toFixed(2));
        pricingTerm['cgstPercentage'] = Number(cgstAmount.toFixed(2));
        pricingTerm['sgstPercentage'] = Number(sgstAmount.toFixed(2));
        pricingTerm['totalPrice'] = Number(totalAmount.toFixed(2));
      });
      return await MerchantPricingTerm.bulkCreate(pricingTermsBody, {
        transaction,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to add additional services for a merchant
  /**
   * Add additional services for a merchant.
   * @param {AdditionalServiceBody[]} additionalService - Array of additional service data.
   * @param {string} merchantId - The ID of the merchant.
   * @param {any} transaction - Transaction object for database operations.
   * @returns {Promise<MerchantAdditionalServicePrice[]>} - Array of created additional services.
   */
  async addMerchantAdditionServices(
    additionalService: AdditionalServiceBody[],
    merchantId: string,
    transaction: any
  ) {
    try {
      additionalService.forEach((additionalService: AdditionalServiceBody) => {
        additionalService.merchantId = merchantId;
        const { grossAmount, cgstAmount, sgstAmount } = calculate_tax_details(
          Number(additionalService.price)
        );
        additionalService['grossAmount'] = Number(grossAmount.toFixed(2));
        additionalService['cgstPercentage'] = Number(cgstAmount.toFixed(2));
        additionalService['sgstPercentage'] = Number(sgstAmount.toFixed(2));
      });
      return await MerchantAdditionalServicePrice.bulkCreate(
        additionalService,
        { transaction }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to get a merchant by name
  /**
   * Get a merchant by its name.
   * @param {string} outletName - The name of the merchant's outlet.
   * @returns {Promise<Merchant | null>} - The found merchant or null if not found.
   */
  async getMerchantByName(outletName: string, vehicleType: string) {
    try {
      return await Merchant.findOne({
        where: {
          outletName: outletName,
          deletedAt: null,
          vehicleType: vehicleType,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to get full details of a merchant
  /**
   * Get full details of a merchant.
   * @param {string} merchantId - The ID of the merchant.
   * @returns {Promise<Merchant | null>} - The found merchant with its details or null if not found.
   */
  async getMerchantFullDetails(merchantId: string) {
    try {
      const currentDate = new Date();
      const merchant = await Merchant.findOne({
        where: {
          merchantId: merchantId,
        },
        include: [
          {
            model: MerchantPricingTerm,
            where: {
              deletedAt: null,
            },
            required: false,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                model: WashType,
                attributes: ['Guid', 'Name'],
              },
            ],
          },
          {
            model: MerchantAdditionalServicePrice,
            attributes: [
              'merchantAdditionalServicePriceId',
              'grossAmount',
              'cgstPercentage',
              'sgstPercentage',
              'price',
              'additionalServiceId',
              'deletedAt',
            ],
            where: {
              deletedAt: null,
            },
            required: false,
          },
          {
            model: Machine,
            attributes: ['machineGuid', 'name'],
            include: [
              {
                model: MachineAgent,
                attributes: ['machineAgentId', 'agentId'],
                include: [
                  {
                    model: User,
                    attributes: [
                      'userId',
                      'uniqueId',
                      'username',
                      'firstName',
                      'lastName',
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: MerchantImages,
            attributes: ['imageUrl'],
          },
          {
            model: MerchantHoliday,
            attributes: ['merchantHolidayId'],
            include: [
              {
                model: Holiday,
                attributes: ['holidayId', 'holidayName', 'holidayDate'],
                where: {
                  holidayDate: {
                    [Op.gte]: currentDate,
                  },
                },
              },
            ],
            where: {
              deletedAt: null,
            },
            required: false,
          },
        ],
      });
      if (merchant) {
        const additionalServicePromises =
          merchant.merchantAdditionalServicePrice.map(
            async (merchantAdditionalPrice: any) => {
              const additionalService = await AdditionalService.findOne({
                attributes: ['additionalServiceId', 'name', 'isActive'],
                where: {
                  additionalServiceId:
                    merchantAdditionalPrice.additionalServiceId,
                },
              });
              if (additionalService) {
                merchantAdditionalPrice.dataValues['additionalService'] =
                  additionalService.dataValues;
              }
              return merchantAdditionalPrice;
            }
          );

        // Wait for all additional service prices to be updated
        await Promise.all(additionalServicePromises);
      }

      // Ensure Silver, Gold, Platinum order in pricing terms
      if (merchant?.pricingTerms) {
        const desiredOrder = ['SILVER', 'GOLD', 'PLATINUM'];
        merchant.pricingTerms = desiredOrder
          .map((type) =>
            merchant.pricingTerms.find((term) => term.washType?.Name === type)
          )
          .filter((term) => term !== undefined); // Exclude undefined values
      }

      return merchant;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to get delete details of a merchant
  async deleteMerchant(merchantId: string) {
    try {
      // Update merchant delete status
      await Merchant.update(
        {
          deletedAt: new Date(),
        },
        {
          where: {
            merchantId: merchantId,
          },
        }
      );
      // fetch merchant all machines
      const machines = await Machine.findAll({
        attributes: ['machineGuid'],
        where: {
          merchantId: merchantId,
        },
      });
      const existingMachineIds = machines.map(
        (machine) => machine.dataValues.machineGuid
      );
      //Remove machine agents
      await MachineAgent.destroy({
        where: {
          machineId: {
            [Op.in]: existingMachineIds,
          },
        },
      });
      // Free merchant machines
      await Machine.update(
        {
          merchantId: null,
        },
        {
          where: {
            merchantId: merchantId,
          },
        }
      );
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getMachinesForMerchant() {
    try {
      return await Machine.findAndCountAll({
        attributes: ['machineGuid', 'name'],
        where: {
          outletId: null,
          isAssigned: false,
          merchantId: null,
          // deletedAt: null,
        },
        order: [['name', 'ASC']],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAgentsForMerchant() {
    try {
      const assignedAgent = await MachineAgent.findAll({
        attributes: ['agentId'],
      });
      const whereCondition: any = {
        deletedAt: null,
        role: config.userRolesObject.FEEDBACK_AGENT,
        // merchantId: null,
      };
      const agentIds = assignedAgent.map((el) => el.agentId);
      if (agentIds.length > 0) {
        whereCondition['userId'] = {
          [Op.notIn]: agentIds,
        };
      }
      return await User.findAndCountAll({
        attributes: ['userId', 'uniqueId', 'username', 'firstName', 'lastName'],
        where: whereCondition,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getMerchantList(queryBody: any) {
    try {
      let {
        limit,
        offset,
        sortBy,
        orderBy,
        search,
        region,
        city,
        state,
        machineIds,
        startDate,
        endDate,
      } = queryBody;

      let sortOrder: any = [[sortBy, orderBy]]; // Sort order for the query
      const whereCondition: WhereOptions = {
        deletedAt: null,
      };

      let cityWhereCondition: any = {};

      let stateWhereCondition: any = {};

      let regionWhereCondition: any = {};

      let machineWhereCondition: any = {};

      if (city) {
        cityWhereCondition.cityId = { [Op.in]: city.split(',') };
      }

      if (state) {
        stateWhereCondition.stateId = { [Op.in]: state.split(',') };
      }

      if (region) {
        regionWhereCondition.regionId = { [Op.in]: region.split(',') };
      }

      if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
        whereCondition['createdAt'] = {
          [Op.between]: [
            moment(startDate).startOf('day').toISOString(),
            moment(endDate).endOf('day').toISOString(),
          ],
        };
      }

      if (!isNullOrUndefined(search)) {
        whereCondition['outletName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`,
        };
      }

      if (!isNullOrUndefined(machineIds)) {
        const machineIdsArr = machineIds.split(',').filter(isValidGuid);
        if (machineIdsArr.length > 0) {
          machineWhereCondition['machineGuid'] = {
            [Op.in]: machineIdsArr,
          };
        }
      }

      return await Merchant.findAndCountAll({
        attributes: [
          'merchantId',
          'uniqueId',
          'outletName',
          'address',
          'latitude',
          'longitude',
          'createdAt',
          'isActive',
        ],
        where: whereCondition,
        include: [
          {
            model: Machine,
            attributes: ['machineGuid', 'name'],
            where: machineWhereCondition,
            required: machineWhereCondition ? true : false,
          },
          {
            model: City,
            where: cityWhereCondition, // Apply City condition here
            required: true, // Strict City matching
            attributes: ['cityId', 'name'],
            include: [
              {
                model: State,
                where: stateWhereCondition, // Apply State condition here
                required: true, // Strict State matching
                attributes: ['stateId', 'name'],
                include: [
                  {
                    model: Region,
                    where: regionWhereCondition, // Apply Region condition here
                    required: true, // Strict Region matching
                    attributes: ['regionId', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        order: sortOrder, // Apply sorting
        limit: limit, // Limit the number of results
        offset: offset, // Offset for pagination
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async isMerchantExist(merchantId: string) {
    try {
      return await Merchant.findOne({
        where: {
          deletedAt: null,
          merchantId: merchantId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateMerchantStatus(merchantId: string, isActive: boolean) {
    try {
      return await Merchant.update(
        {
          isActive: isActive,
        },
        {
          where: {
            merchantId: merchantId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async assignedMachineAgents(machineAgents: any) {
    try {
      const machineAgentArr: any = [];
      machineAgents.forEach((machineAgent: any) => {
        machineAgent.agentIds.forEach((agent: any) => {
          machineAgentArr.push({
            machineId: machineAgent.machineId,
            agentId: agent,
          });
        });
      });
      await MachineAgent.bulkCreate(machineAgentArr);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateMerchantDetails(updateBody: any, merchantId: string) {
    try {
      return await Merchant.update(updateBody, {
        where: {
          merchantId: merchantId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateMerchantPricingTerms(pricingTermsBody: any, merchantId: string) {
    try {
      // Assign the merchantId to each pricing term in the new data
      pricingTermsBody.forEach((pricingTerm: AddPricingTermBody) => {
        pricingTerm.merchantId = merchantId;
        const totalAmount = Number(
          Number(pricingTerm.manPowerPrice) + Number(pricingTerm.washPrice)
        );
        const { grossAmount, cgstAmount, sgstAmount } =
          calculate_tax_details(totalAmount);
        pricingTerm['grossAmount'] = Number(grossAmount.toFixed(2));
        pricingTerm['cgstPercentage'] = Number(cgstAmount.toFixed(2));
        pricingTerm['sgstPercentage'] = Number(sgstAmount.toFixed(2));
        pricingTerm['totalPrice'] = Number(totalAmount.toFixed(2));
      });

      // Find all existing pricing terms for the given merchantId
      const existPricingterms = await MerchantPricingTerm.findAll({
        where: {
          merchantId: merchantId,
          deletedAt: null,
        },
      });

      // Create a map of existing pricing terms for quick lookup
      const existingTermsMap = new Map();
      existPricingterms.forEach((term) => {
        existingTermsMap.set(term.washTypeId, term.dataValues);
      });

      // // Iterate over the new pricing terms and update or add them
      for (const pricingTerm of pricingTermsBody) {
        const existingTerm = existingTermsMap.get(pricingTerm.washTypeId);

        if (existingTerm) {
          // Update existing pricing term
          await MerchantPricingTerm.update(pricingTerm, {
            where: {
              merchantId: existingTerm.merchantId,
              washTypeId: existingTerm.washTypeId,
            },
          });
          // Remove from the map as it is already handled
          existingTermsMap.delete(pricingTerm.washTypeId);
        } else {
          // Add new pricing term
          await MerchantPricingTerm.create(pricingTerm);
        }
      }

      // Delete the remaining terms in the map (those not present in the new data)
      for (const remainingTerm of existingTermsMap.values()) {
        await MerchantPricingTerm.update(
          { deletedAt: new Date() },
          {
            where: {
              merchantPricingTermId: remainingTerm.merchantPricingTermId,
            },
          }
        );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateMerchantAdditionServices(
    additionalServices: AdditionalServiceBody[],
    merchantId: string
  ) {
    try {
      // Assign the merchantId to each pricing term in the new data
      additionalServices.forEach((additionalService: AdditionalServiceBody) => {
        additionalService.merchantId = merchantId;
        const { grossAmount, cgstAmount, sgstAmount } = calculate_tax_details(
          Number(additionalService.price)
        );
        additionalService['grossAmount'] = Number(grossAmount.toFixed(2));
        additionalService['cgstPercentage'] = Number(cgstAmount.toFixed(2));
        additionalService['sgstPercentage'] = Number(sgstAmount.toFixed(2));
      });
      // Find all existing pricing terms for the given merchantId
      const existAdditionalService =
        await MerchantAdditionalServicePrice.findAll({
          where: {
            merchantId: merchantId,
            deletedAt: null,
          },
        });

      // Create a map of existing pricing terms for quick lookup
      const existAdditionalServiceMap = new Map();
      existAdditionalService.forEach((term) => {
        existAdditionalServiceMap.set(
          term.additionalServiceId,
          term.dataValues
        );
      });

      // // // Iterate over the new pricing terms and update or add them
      for (const additionalService of additionalServices) {
        const existingTerm = existAdditionalServiceMap.get(
          additionalService.additionalServiceId
        );

        if (existingTerm) {
          // Update existing pricing term
          await MerchantAdditionalServicePrice.update(additionalService, {
            where: {
              merchantId: existingTerm.merchantId,
              additionalServiceId: existingTerm.additionalServiceId,
            },
          });
          // Remove from the map as it is already handled
          existAdditionalServiceMap.delete(
            additionalService.additionalServiceId
          );
        } else {
          // Add new pricing term
          await MerchantAdditionalServicePrice.create(additionalService);
        }
      }

      // Delete the remaining terms in the map (those not present in the new data)
      for (const remainingService of existAdditionalServiceMap.values()) {
        await MerchantAdditionalServicePrice.update(
          { deletedAt: new Date() },
          {
            where: {
              merchantAdditionalServicePriceId:
                remainingService.merchantAdditionalServicePriceId,
            },
          }
        );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async handleMachineAgents(machineAgents: any, merchantId: string) {
    try {
      const machines = await Machine.findAll({
        attributes: ['machineGuid'],
        where: {
          merchantId: merchantId,
        },
      });
      const existingMachineIds = machines.map(
        (machine) => machine.dataValues.machineGuid
      );
      await MachineAgent.destroy({
        where: {
          machineId: {
            [Op.in]: existingMachineIds,
          },
        },
      });
      await MachineAgent.bulkCreate(machineAgents);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getMerchantImages(queryBody: any) {
    try {
      const { merchantId, _limit, _offset } = queryBody;
      let whereCondition: any = {
        merchantId: null,
      };
      if (isValidGuid(merchantId)) {
        whereCondition = {
          [Op.or]: [{ merchantId: null }, { merchantId: merchantId }],
        };
      }
      return await MerchantImages.findAndCountAll({
        where: whereCondition,
        limit: _limit,
        offset: _offset,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async addMerchantImages(
    imagesArr: string[],
    merchantId: string,
    transaction: any
  ) {
    try {
      const newMerchantImageArr: any = [];
      imagesArr.forEach((image) => {
        newMerchantImageArr.push({
          merchantId: merchantId,
          imageUrl: image,
        });
      });
      if (newMerchantImageArr.length > 0) {
        await MerchantImages.bulkCreate(newMerchantImageArr, { transaction });
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async addMerchantHolidays(
    holidayArr: string[],
    merchantId: string,
    transaction: any
  ) {
    try {
      const newMerchantHolidayArr: any = [];
      holidayArr.forEach((holidayId) => {
        newMerchantHolidayArr.push({
          merchantId: merchantId,
          holidayId: holidayId,
        });
      });
      if (newMerchantHolidayArr.length > 0) {
        await MerchantHoliday.bulkCreate(newMerchantHolidayArr, {
          transaction,
        });
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async updateMerchantImages(imagesArr: string[], merchantId: string) {
    try {
      await MerchantImages.destroy({
        where: {
          merchantId: merchantId,
        },
      });
      const newMerchantImageArr: any = [];
      imagesArr.forEach((image) => {
        newMerchantImageArr.push({
          merchantId: merchantId,
          imageUrl: image,
        });
      });
      if (newMerchantImageArr.length > 0) {
        await MerchantImages.bulkCreate(newMerchantImageArr);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateMerchantHolidays(holidayArr: string[], merchantId: string) {
    try {
      await MerchantHoliday.destroy({
        where: {
          merchantId: merchantId,
        },
      });
      const newMerchantHolidayArr: any = [];
      holidayArr.forEach((holidayId) => {
        newMerchantHolidayArr.push({
          merchantId: merchantId,
          holidayId: holidayId,
        });
      });
      if (newMerchantHolidayArr.length > 0) {
        await MerchantHoliday.bulkCreate(newMerchantHolidayArr);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Fetches nearby merchants based on provided criteria.
   * @param {Object} data - Object containing criteria for fetching nearby merchants.
   * @returns {Promise<Object>} - Promise resolving to an object with total count and list of nearby merchants.
   */
  async getNearBYMerchants(data: any) {
    try {
      // Destructure input data
      const {
        latitude,
        longitude,
        distance,
        limit,
        offset,
        date,
        search,
        washTypeIds,
        operationStartTime,
        operationEndTime,
        vehicleType,
      } = data;
      // Earth's radius in kilometers
      const earthRadiusKm = config.earthRadius;

      // Constructing the where condition for the query
      const whereCondition: any = {
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        isActive: true,
        deletedAt: null,
        [Op.and]: [],
      };
      if (
        !isNullOrUndefined(vehicleType) &&
        (vehicleType == VehicleType.TWO_WHEELER ||
          vehicleType == VehicleType.FOUR_WHEELER)
      ) {
        whereCondition['vehicleType'] = vehicleType;
      }
      whereCondition[Op.and].push(
        db.sequelize.literal(
          `
          ${earthRadiusKm} * 2 * ASIN(SQRT(
            POWER(SIN((${latitude} - ABS(latitude)) * PI() / 180 / 2), 2) +
            COS(${latitude} * PI() / 180) * COS(ABS(latitude) * PI() / 180) *
            POWER(SIN((${longitude} - longitude) * PI() / 180 / 2), 2)
          )) <= ${distance}
          `
        )
      );
      // Add date condition if provided
      // if (!isNullOrUndefined(date)) {
      //   const dateCondition: any = {
      //     [Op.or]: [
      //       { closingStartTime: null },
      //       { closingEndTime: null },
      //       {
      //         [Op.or]: [
      //           { closingStartTime: { [Op.gt]: date } },
      //           { closingEndTime: { [Op.lt]: date } },
      //         ],
      //       },
      //     ],
      //   };
      //   Object.assign(whereCondition, dateCondition);
      // }
      // Add operation time condition if start and end time not provided
      if (
        !isNullOrUndefined(operationStartTime) &&
        !isNullOrUndefined(operationEndTime)
      ) {
        // let currentTime = moment().tz('Asia/Kolkata').format('HH:mm:ss');
        const operationTimeCondition = {
          [Op.and]: [
            { operationStartTime: { [Op.lte]: operationStartTime } },
            { operationEndTime: { [Op.gte]: operationEndTime } },
          ],
        };
        whereCondition[Op.and].push(operationTimeCondition);
      }
      // Adding search condition if search term is provided
      if (!isNullOrUndefined(search)) {
        whereCondition['outletName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`,
        };
      }
      // Define wash type where condition
      const washTypeWhereCondition: any = {};
      if (!isNullOrUndefined(washTypeIds)) {
        const washTypeIdArr = [];

        for (const id of washTypeIds.split(',')) {
          if (isValidGuid(id)) {
            washTypeIdArr.push(id);
          }
        }
        if (washTypeIdArr.length) {
          washTypeWhereCondition['Guid'] = {
            [Op.in]: washTypeIdArr,
          };
        }
      }

      // Fetching merchants with pagination and distance calculation
      const { rows, count } = await Merchant.findAndCountAll({
        attributes: [
          'merchantId',
          'bannerImageUrl',
          'outletName',
          'address',
          'latitude',
          'longitude',
          [
            db.sequelize.literal(
              `
              ${earthRadiusKm} * 2 * ASIN(SQRT(
                POWER(SIN((${latitude} - ABS(latitude)) * PI() / 180 / 2), 2) +
                COS(${latitude} * PI() / 180) * COS(ABS(latitude) * PI() / 180) *
                POWER(SIN((${longitude} - longitude) * PI() / 180 / 2), 2)
              ))
              `
            ),
            'distance',
          ],
        ],
        where: whereCondition,
        include: [
          {
            model: MerchantPricingTerm,
            attributes: ['merchantPricingTermId'],
            include: [
              {
                model: WashType,
                attributes: ['Guid', 'Name'],
                where: washTypeWhereCondition,
              },
            ],
          },
          {
            model: MerchantImages,
            attributes: ['imageUrl'],
          },
        ],
        offset: offset,
        limit: limit,
        order: [
          [
            db.sequelize.literal(
              `
              ${earthRadiusKm} * 2 * ASIN(SQRT(
                POWER(SIN((${latitude} - ABS(latitude)) * PI() / 180 / 2), 2) +
                COS(${latitude} * PI() / 180) * COS(ABS(latitude) * PI() / 180) *
                POWER(SIN((${longitude} - longitude) * PI() / 180 / 2), 2)
              ))
              `
            ),
            'ASC',
          ],
        ],
      });

      // Mapping the results to include distance
      const nearbyMerchants = rows.map((merchant) => ({
        ...merchant.toJSON(),
        distance: merchant.get('distance'),
      }));

      // Returning the total count and the list of merchants
      return { totalMerchants: count, merchants: nearbyMerchants };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getMerchantListWithBookingCounts(data: any) {
    try {
      const {
        limit,
        offset,
        search,
        city,
        state,
        region,
        vehicleType,
        machineIds,
      } = data;
      let whereCondition: any = {
        // deletedAt: null,
      };

      if (!isNullOrUndefined(vehicleType)) {
        const vehicleTypeArr = vehicleType.split(',').filter(Boolean); // Removes empty strings
        if (vehicleTypeArr.length > 0) {
          whereCondition['vehicleType'] = {
            [Op.in]: vehicleTypeArr,
          };
        }
      }
      const cityWhereCondition: any = {};
      const stateWhereCondition: any = {};
      const regionWhereCondition: any = {};
      let machineWhereCondition: any = {};

      if (!isNullOrUndefined(search)) {
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              outletName: { [Op.iLike]: `%${search}%` },
            },
          ],
        };
      }

      if (!isNullOrUndefined(city)) {
        const cityIdArr = city.split(',').filter(isValidGuid);
        if (cityIdArr.length > 0) {
          cityWhereCondition['cityId'] = {
            [Op.in]: cityIdArr,
          };
        }
      }

      if (!isNullOrUndefined(state)) {
        const stateIdArr = state.split(',').filter(isValidGuid);
        if (stateIdArr.length > 0) {
          stateWhereCondition['stateId'] = {
            [Op.in]: stateIdArr,
          };
        }
      }
      if (!isNullOrUndefined(machineIds)) {
        const machineIdsArr = machineIds.split(',').filter(isValidGuid);
        if (machineIdsArr.length > 0) {
          machineWhereCondition['machineGuid'] = {
            [Op.in]: machineIdsArr,
          };
        }
      }

      if (!isNullOrUndefined(region)) {
        const regionIdArr = region.split(',').filter(isValidGuid);
        if (regionIdArr.length > 0) {
          regionWhereCondition['regionId'] = {
            [Op.in]: regionIdArr,
          };
        }
      }

      return await Merchant.findAndCountAll({
        attributes: [
          'merchantId',
          'outletName',
          'vehicleType',
          'cityId',
          'isActive',
          'createdAt',
          'deletedAt',
          [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM "booking" WHERE "booking"."merchant_id" = "Merchant"."merchant_id")`
            ),
            'totalBookingCount',
          ],
          [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM "booking" WHERE "booking"."merchant_id" = "Merchant"."merchant_id" AND "booking"."booking_status" = '${Status.Completed}')`
            ),
            'completedCount',
          ],
          [
            Sequelize.literal(
              `(SELECT COUNT(*) FROM "booking" WHERE "booking"."merchant_id" = "Merchant"."merchant_id" AND "booking"."booking_status" = '${Status.Cancelled}')`
            ),
            'cancelledCount',
          ],
        ],
        include: [
          {
            model: Machine,
            attributes: ['machineGuid', 'name'],
            where: machineWhereCondition,
            required: machineWhereCondition ? true : false,
          },
          {
            model: City,
            attributes: ['cityId', 'name'],
            where: cityWhereCondition,
            include: [
              {
                model: State,
                attributes: ['stateId', 'name'],
                where: stateWhereCondition,
                include: [
                  {
                    model: Region,
                    attributes: ['regionId', 'name'],
                    where: regionWhereCondition,
                  },
                ],
              },
            ],
          },
        ],
        where: whereCondition,
        offset: offset,
        limit: limit,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async merchantCityList() {
    try {
      // SQL query to get counts and total prices of additional services
      const query = `SELECT DISTINCT 
                    city.city_id, 
                    city.name AS city_name,
                    state.state_id, 
                    state.name AS state_name,
                    region.region_id, 
                    region.name AS region_name
                FROM public.city
                JOIN public.state ON city.state_id::varchar = state.state_id::varchar
                JOIN public.region ON state.region_id::varchar = region.region_id::varchar
                JOIN public.merchant ON city.city_id::varchar = merchant.city_id::varchar;
 `;

      // Execute the query
      const merchantCity = await db.sequelize.query(`${query} `, {
        type: db.sequelize.QueryTypes.SELECT,
      });

      // Process and return the result
      return merchantCity;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

// Create an instance of MerchantServices and export it
const MerchantService = new MerchantServices();
export { MerchantService };
