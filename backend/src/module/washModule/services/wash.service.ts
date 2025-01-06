import { Op, QueryTypes, Transaction } from 'sequelize';
import { Transactions } from '../../../models/transactions';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { WashType } from '../../../models/wash_type';
import { Machine } from '../../../models/Machine/Machine';
import { MachineWallet } from '../../../models/Machine/MachineWallet';
import { OutletMachine } from '../../../models//outlet_machine';
import { Outlet } from '../../../models/outlet';
import { OEM } from '../../../models/oem';
import { User } from '../../../models/User/user';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { Form } from '../../../models/Feedback/form';
import { FeedbackResponse } from '../../../models/Feedback/feedback_response';
import { Question } from '../../../models/Feedback/question';
import { USERROLE } from '../constant';
import { config } from '../../../config/config';
import db from '../../../models/index';
import { userService } from '../../userModule/services/user.service';
import { regionService } from '../../areaModule/services/region.service';
import { stateService } from '../../areaModule/services/state.service';
import { cityService } from '../../areaModule/services/city.service';
import { oemManagerService } from '../../oemManager/services/oemManger.service';
import { areaManagerService } from '../../areaManagerModule/services/areaManager.service';
import sequelize from 'sequelize/types/sequelize';
import { isNullOrUndefined } from '../../../common/utility';
import { Booking } from '../../../B2C/models/booking';
import { Slot } from '../../../B2C/models/slot';
import { WashOrder } from '../../../B2C/models/wash_order';
import { Vehicle } from '../../../B2C/models/vehicle';
import { Customer } from '../../../B2C/models/customer';
import { MachineAgent } from '../../../models/Machine/MachineAgent';
import { Merchant } from '../../../B2C/models/merchant';

class WashService {
  async getWashCompleteDetail(washId: string) {
    try {
      const selectedAttributes: any = [
        'SkuNumber',
        'ShampooUsed',
        'ShampooPrice',
        'FoamUsed',
        'FoamPrice',
        'ElectricityUsed',
        'ElectricityPrice',
        'WaterUsed',
        'WaterWastage',
        'WaterPrice',
        'WashTime',
        'WaxUsed',
        'WaxPrice',
        'AddDate',
      ];
      const whereCondition: any = {
        Guid: washId,
      };
      const includeCondition: any = [
        {
          model: WashType,
          attributes: ['Name'],
        },
        {
          model: Machine,
          attributes: ['name'],
          include: [
            {
              model: Outlet,
              attributes: ['name', 'address'],
              include: [
                {
                  model: User,
                  attributes: [
                    'userId',
                    'username',
                    'firstName',
                    'lastName',
                    'address',
                  ],
                },
                {
                  model: City,
                  attributes: ['cityId', 'name'],
                  include: [
                    {
                      model: State,
                      attributes: ['stateId', 'name'],
                      include: [
                        {
                          model: Region,
                          attributes: ['name', 'regionId'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: TransactionsFeedback,
          attributes: {
            exclude: [
              'transactionGuid',
              'isProfileCompleted',
              'transactionType',
              'createdBy',
              'updatedAt',
            ],
          },
        },
        {
          model: MachineWallet,
          attributes: ['baseAmount', 'cgst', 'sgst', 'totalAmount'],
        },
      ];
      const condition: any = {
        attributes: selectedAttributes,
        where: whereCondition,
        include: includeCondition,
      };
      return await Transactions.findOne(condition);
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getWashFeedbackDetail(skuNumber: string) {
    try {
      return await TransactionsFeedback.findOne({
        attributes: [
          'transactionFeedbackId',
          'name',
          'phone',
          'emailId',
          'hsrpNumber',
          'bikeModel',
        ],
        where: {
          skuNumber,
        },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getCompleteWashFeedbackDetail(transactionFeedbackId: string) {
    try {
      const includeCondition: any = [
        {
          model: FeedbackResponse,
          include: [
            {
              model: Question,
              attributes: ['questionId', 'isOptional', 'order'],
              // separate: true,
              order: [['order', 'ASC']],
            },
          ],
        },
        {
          model: User,
          attributes: [
            'userId',
            'username',
            'firstName',
            'lastName',
            'address',
          ],
        },
        {
          model: Transactions,
          attributes: ['Guid', 'QRGenerated', 'SkuNumber', 'AddDate'],
          include: [
            {
              model: WashType,
              attributes: ['Name'],
            },
            {
              model: Machine,
              attributes: ['name'],
              include: [
                {
                  model: Outlet,
                  attributes: ['name'],
                  include: [
                    {
                      model: User,
                      attributes: [
                        'userId',
                        'username',
                        'firstName',
                        'lastName',
                        'address',
                      ],
                      include: [
                        {
                          model: OEM,
                          attributes: ['oemId', 'name'],
                        },
                      ],
                    },
                    {
                      model: City,
                      attributes: ['cityId', 'name'],
                      include: [
                        {
                          model: State,
                          attributes: ['stateId', 'name'],
                          include: [
                            {
                              model: Region,
                              attributes: ['name', 'regionId'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Form,
          attributes: ['name'],
        },
      ];

      const selectedAttributes: any = {
        exclude: [
          'transactionGuid',
          'isProfileCompleted',
          'transactionType',
          'createdBy',
          'updatedAt',
        ],
      };
      return await TransactionsFeedback.findOne({
        where: { transactionFeedbackId },
        attributes: selectedAttributes,
        include: includeCondition,
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getWashFeedbackResponse(transactionId: string) {
    try {
      return await FeedbackResponse.findOne({
        where: {
          transactionFeedbackId: transactionId,
        },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getWashTypes(user: any, isAbandoned: any) {
    try {
      const { role } = user;
      let whereCondition = {};
      if (
        role == config.userRolesObject.DEALER ||
        role == config.userRolesObject.FEEDBACK_AGENT ||
        role == config.userRolesObject.AREA_MANAGER ||
        role == config.userRolesObject.OEM ||
        (isAbandoned && isAbandoned === 'true')
      ) {
        whereCondition = {
          Name: { [Op.in]: config.washTypeArr },
        };
      }

      return await WashType.findAll({
        attributes: ['Guid', 'Name', 'PlcTag', 'ExpectedWashTime'],
        where: whereCondition,
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async getCustomerWashTypes(allWashType: boolean) {
    try {
      const whereCondition: any = {};
      if (
        isNullOrUndefined(allWashType) ||
        (!isNullOrUndefined(allWashType) && allWashType === false)
      ) {
        whereCondition['Name'] = { [Op.in]: config.washTypeArr };
      }
      return await WashType.findAll({
        attributes: ['Guid', 'Name', 'PlcTag', 'ExpectedWashTime'],
        where: whereCondition,
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  // NEW Manage wash
  async getWashesList(body: any, user: any) {
    try {
      const washCondition: any = await washService.getWashListConditions(
        body,
        user
      );
      const washes = await Transactions.findAndCountAll(washCondition);
      return washes;
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async getWashTypesCount(body: any, user: any) {
    try {
      const washCondition: any = await this.getWashListConditions(body, user);
      let condition: any = {
        include: washCondition.include,
        where: washCondition.where,
      };
      const washes = await Transactions.count(condition);
      return washes;
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  // wash list condition setup
  async getWashListConditions(body: any, user: any) {
    try {
      const { userId, role } = user;
      let { sort_by, filters, filterKey, search, offset, limit } = body;
      let whereCondition: any = {};
      if (filters) {
        if (role == config.userRolesObject.DEALER) {
          whereCondition = {
            [Op.and]: [
              {
                '$machine.outlet.outlet_id$': {
                  [Op.or]: filterKey.outletIds,
                },
              },
              {
                '$machine.MachineGuid$': {
                  [Op.or]: filterKey.machineIds,
                },
              },
              {
                '$washType.Guid$': {
                  [Op.or]: filterKey.washTypeIds,
                },
              },
            ],
          };
        } else if (
          role == config.userRolesObject.ADMIN ||
          role == config.userRolesObject.AREA_MANAGER ||
          role == config.userRolesObject.OEM
        ) {
          whereCondition = {
            [Op.and]: [
              {
                MachineGuid: {
                  [Op.or]: filterKey.machineIds,
                },
              },
              {
                '$washType.Guid$': {
                  [Op.or]: filterKey.washTypeIds,
                },
              },
              {
                '$machine.outlet.dealer.user_id$': {
                  [Op.or]: filterKey.dealerIds,
                },
              },
              {
                '$machine.outlet.dealer.oem.oem_id$': {
                  [Op.or]: filterKey.oemIds,
                },
              },
              {
                '$machine.outlet.city.city_id$': {
                  [Op.or]: filterKey.cityIds,
                },
              },
              {
                '$machine.outlet.city.state.state_id$': {
                  [Op.or]: filterKey.stateIds,
                },
              },
              {
                '$machine.outlet.city.state.region.region_id$': {
                  [Op.or]: filterKey.regionIds,
                },
              },
            ],
          };
        }
      }
      let washTypeModel: any = {
        model: WashType,
        attributes: ['Name', ['Guid', 'WashTypeGuid']],
      };
      if (role == config.userRolesObject.DEALER) {
        whereCondition['$machine.outlet.dealer.user_id$'] = userId;
        washTypeModel = {
          model: WashType,
          attributes: ['Name', ['Guid', 'WashTypeGuid']],
          where: { Name: { [Op.in]: config.washTypeArr } },
        };
      }
      if (role != config.userRolesObject.ADMIN) {
        whereCondition['IsAssigned'] = true;
      }
      if (search) {
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              SkuNumber: { [Op.iLike]: '%' + search + '%' },
            },
            { '$machine.outlet.name$': { [Op.iLike]: `%${search}%` } },
            {
              '$machine.outlet.dealer.username$': { [Op.iLike]: `%${search}%` },
            },
          ],
        };
      }
      if (filterKey.startDate && filterKey.endDate) {
        whereCondition['AddDate'] = {
          [Op.gte]: filterKey.startDate,
          [Op.lte]: filterKey.endDate,
        };
      }
      let sortOrder = 'DESC';
      if (sort_by && Object.keys(sort_by).length > 0) {
        if (sort_by.type) {
          sortOrder = sort_by.type;
        }
      }
      const orderCondition = [['AddDate', sortOrder]];

      const includeCondition = [
        washTypeModel,
        {
          model: Machine,
          attributes: ['machineGuid', 'name'],
          include: [
            {
              model: Outlet,
              attributes: ['outletId', 'name'],
              include: [
                {
                  model: User,
                  attributes: ['userId', 'email', 'username'],
                  include: [
                    {
                      model: OEM,
                      attributes: ['oemId', 'name'],
                    },
                  ],
                },
                {
                  model: City,
                  attributes: ['cityId', 'name'],
                  include: [
                    {
                      model: State,
                      attributes: ['stateId', 'name'],
                      include: [
                        {
                          model: Region,
                          attributes: ['regionId', 'name'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: MachineWallet,
          attributes: ['baseAmount', 'cgst', 'sgst', 'totalAmount'],
        },
      ];
      const selectedAttributes = [
        ['Guid', 'transactionGuid'],
        'SkuNumber',
        'SkuDigit',
        'MachineGuid',
        'WashTypeGuid',
        'ElectricityUsed',
        'FoamUsed',
        'ShampooUsed',
        'WaxUsed',
        'WaterUsed',
        'WaterWastage',
        'WashTime',
        'AddDate',
      ];
      let condition: any = {
        include: includeCondition,
        attributes: selectedAttributes,
        where: whereCondition,
        order: orderCondition,
      };
      if (!!offset) {
        condition = { ...condition, offset };
      }
      if (!!limit) {
        condition = { ...condition, limit };
      }

      return condition;
    } catch (err) {
      Promise.reject(err);
    }
  }
  async getWashTypeDetails(washId: string) {
    try {
      const washType = await WashType.findOne({
        attributes: ['Guid', 'Name'],
        where: {
          Guid: washId,
        },
      });
      return washType;
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  // active wash Type [Gold,Silver,Platinum],ids
  async getActiveWashTypeIds() {
    try {
      const result: any = [];
      const washTypes = await this.getWashTypes({}, 'true');
      if (washTypes) {
        washTypes.forEach((washType) => {
          result.push(washType.Guid);
        });
      }
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // filters for oem and area managers
  async getFiltersForManager(userId: string) {
    try {
      const filters: any = {};
      const managerRegionIds: any = [];
      const managerStateIds: any = [];
      const managerCityIds: any = [];
      const userAreaDetails: any = await userService.getUserAreaDetails(userId);
      if (userAreaDetails && userAreaDetails.userArea) {
        userAreaDetails.userArea.forEach((area: any) => {
          managerRegionIds.push(area.regionId);
          managerStateIds.push(area.stateId);
          managerCityIds.push(area.cityId);
        });
      }
      (filters['regionIds'] = managerRegionIds),
        (filters['stateIds'] = managerStateIds);
      filters['cityIds'] = managerCityIds;
      filters['oemDealerIds'] =
        await oemManagerService.getFormattedOEMManagerDealers(userId);
      filters['areaManagerDealerIds'] =
        await areaManagerService.getFormattedAreaManagerDealers(userId);
      filters['washTypeIds'] = await this.getActiveWashTypeIds();
      return filters;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // return all transactions
  async getAllTransactionFeedbacks() {
    try {
      return Transactions.findAll({
        attributes: ['Guid', 'SkuNumber'],
        include: [
          {
            model: TransactionsFeedback,
            attributes: {
              exclude: [
                'transactionGuid',
                'isProfileCompleted',
                'transactionType',
                'createdBy',
                'updatedAt',
              ],
            },
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // API to get al wash transaction counts
  async getTotalWashCount(washtypeIds: string[]) {
    try {
      return await Transactions.count({
        where: {
          WashTypeGuid: {
            [Op.in]: washtypeIds,
          },
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getTotalSavedWater(washTypeIds: string[]) {
    try {
      const query = `
        SELECT SUM("WaterUsed" - :defaultFreshWaterQty) AS "totalSavedWater"
        FROM transactions
        WHERE "WashTypeGuid" IN (:washTypeIds);
      `;

      const result = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: {
          defaultFreshWaterQty: config.defaulFreshWaterQty,
          washTypeIds: washTypeIds,
        },
      });

      const totalSavedWater = result[0].totalSavedWater;
      return totalSavedWater;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async b2cFeedBack(skuNumber: any) {
    try {
      // Check if a transaction exists with the given SkuNumber and retrieve transaction details
      let isTransactionsGuidExist = await Transactions.findOne({
        where: { SkuNumber: skuNumber },
        attributes: [
          'Guid',
          'SkuNumber',
          'WashTypeGuid',
          'AddDate',
          'MachineGuid',
        ],
        include: [
          {
            model: WashType,
            attributes: ['Name'],
          },
        ],
      });

      if (isTransactionsGuidExist) {
        // Fetch booking details associated with the given SkuNumber
        let bookingDetails = await Booking.findOne({
          where: { SkuNumber: skuNumber },
          include: [
            {
              model: WashOrder,
              attributes: { exclude: ['createdAt', 'updatedAt'] },
              include: [
                {
                  model: Vehicle,
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                  include: [
                    {
                      model: Customer,
                      attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                  ],
                },
                {
                  model: WashType,
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
              ],
            },
          ],
        });

        if (bookingDetails) {
          // Fetch merchant and associated machines with agent information
          const merchant = await Merchant.findOne({
            where: { merchantId: bookingDetails.merchantId },
            include: [
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
            ],
          });

          const { SkuNumber, washType, AddDate, MachineGuid, Guid } =
            isTransactionsGuidExist;

          // Find the agentId for the machine that matches the MachineGuid in the transaction
          let agentId;
          const machine = merchant.machines.find(
            (item) => item.machineGuid === MachineGuid
          );

          if (machine && machine.agents.length > 0) {
            agentId = machine.agents[0].agentId; // Use the first agentId found
          }

          // Retrieve the machine feedback form ID
          const machineObj = await Machine.findOne({
            where: { machineGuid: MachineGuid },
            attributes: ['feedbackFormId'], // Limit to relevant field
          });

          // Proceed only if agentId and feedbackFormId are available
          if (agentId && machineObj.feedbackFormId) {
            const customer = bookingDetails?.washOrder?.vehicle?.customer;
            const vehicle = bookingDetails?.washOrder?.vehicle;

            // Prepare customer and vehicle details
            const name = `${customer?.firstName || ''} ${
              customer?.lastName || ''
            }`.trim();
            const phone = customer?.phone || null;
            const emailId = customer?.email || null;
            const hsrpNumber = vehicle?.hsrpNumber;
            const manufacturer = vehicle?.manufacturer || null;
            const bikeModel = vehicle?.vehicleModel || null;

            // Create a new feedback entry for the transaction
            await TransactionsFeedback.create({
              transactionGuid: Guid,
              name: name,
              phone: phone,
              emailId: emailId,
              hsrpNumber: hsrpNumber,
              manufacturer: manufacturer,
              bikeModel: bikeModel,
              skuNumber: SkuNumber,
              transactionType: washType.dataValues.Name,
              isProfileCompleted: true,
              washTime: AddDate,
              formId: machineObj.feedbackFormId,
              createdBy: agentId,
              vehicleType:vehicle?.vehicleType
            });

            // Update the transaction to indicate QR generation
            await Transactions.update(
              { QRGenerated: true },
              { where: { Guid: Guid } }
            );
          } else {
            console.log(
              '-----Agent or machine feedbackFormId is not available-------'
            );
          }
        }
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const washService = new WashService();
export { washService };
