import { Op } from 'sequelize';
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
      return Transactions.findOne(condition);
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getWashFeedbackDetail(skuNumber: string) {
    try {
      return TransactionsFeedback.findOne({
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
      return TransactionsFeedback.findOne({
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
      return FeedbackResponse.findOne({
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
        if (role == USERROLE.DEALER) {
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
        } else if (role == USERROLE.ADMIN) {
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
                  [Op.or]: filters.dealerIds,
                },
              },
              {
                '$machine.outlet.dealer.oem.oem_id$': {
                  [Op.or]: filters.oemIds,
                },
              },
              {
                '$machine.outlet.city.city_id$': {
                  [Op.or]: filters.cityIds,
                },
              },
              {
                '$machine.outlet.city.state.state_id$': {
                  [Op.or]: filters.stateIds,
                },
              },
              {
                '$machine.outlet.city.state.region.region_id$': {
                  [Op.or]: filters.regionIds,
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
      if (role == USERROLE.DEALER) {
        whereCondition['$machine.outlet.dealer.user_id$'] = userId;
        washTypeModel = {
          model: WashType,
          attributes: ['Name', ['Guid', 'WashTypeGuid']],
          where: { Name: { [Op.in]: config.washTypeArr } },
        };
      }
      if (search) {
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              SkuNumber: { [Op.iLike]: '%' + search + '%' },
            },
          ],
        };
      }
      if (filterKey.startDate && filterKey.endDate) {
        whereCondition.AddDate = {
          [Op.between]: [filterKey.startDate, filterKey.endDate],
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
        'MachineGuid',
        'WashTypeGuid',
        'ElectricityUsed',
        'FoamUsed',
        'ShampooUsed',
        'WaxUsed',
        'WaterUsed',
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
}

const washService = new WashService();
export { washService };
