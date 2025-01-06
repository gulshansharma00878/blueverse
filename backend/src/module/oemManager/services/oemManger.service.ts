import { Op } from 'sequelize';

import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { OEM } from '../../../models/oem';
import { config } from '../../../config/config';
import { UserArea } from '../../../models/User/UserArea';
import { User } from '../../../models/User/user';
import { OEMManagerDealers } from '../../../models/User/OEMManagerDealers';
import { Outlet } from '../../../models/outlet';
import { Machine } from '../../../models/Machine/Machine';
class OEMManagerService {
  async createUser(userDetails: any) {
    try {
      return await User.create(userDetails);
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async createUserArea(userAreaDetails: any) {
    try {
      return await UserArea.bulkCreate(userAreaDetails);
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async deleteUserArea(userId: any) {
    try {
      return await UserArea.destroy({
        where: {
          userId: userId,
        },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async createOEMDealerships(oemDealersDetails: any) {
    try {
      return await OEMManagerDealers.bulkCreate(oemDealersDetails);
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async deleteOEMDealers(oemManagerId: string) {
    try {
      return await OEMManagerDealers.destroy({
        where: {
          oemManagerId: oemManagerId,
        },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async getOEMManagers(body: any) {
    try {
      const { search, _limit, _offset } = body;
      let whereCondition: any = {
        role: config.userRolesObject.OEM,
        deletedAt: null,
      };
      if (search) {
        whereCondition['username'] = { [Op.iLike]: `%${search}%` };
      }
      let includeCondition = [
        {
          model: UserArea,
          attributes: ['userAreaId'],
          include: [
            {
              model: Region,
              attributes: ['regionId', 'name'],
            },
            {
              model: State,
              attributes: ['stateId', 'name'],
            },
            {
              model: City,
              attributes: ['cityId', 'name'],
            },
          ],
        },
        {
          model: OEM,
          attributes: ['oemId', 'name', 'status'],
        },
        {
          model: OEMManagerDealers,
          attributes: ['oemManagerDealerId'],
          include: [
            {
              model: User,
              as: 'dealer',
              attributes: ['userId', 'uniqueId', 'username', 'role', 'email'],
            },
          ],
        },
      ];
      let condition: any = {
        attributes: [
          'userId',
          'uniqueId',
          'username',
          'email',
          'description',
          'phone',
          'isActive',
          'createdAt',
        ],
        where: whereCondition,
        include: includeCondition,
        order: [['createdAt', 'DESC']],
        distinct: true,
      };

      if (!!_limit || _limit >= 0) {
        condition['limit'] = _limit;
      }
      if (!!_offset || _offset >= 0) {
        condition['offset'] = _offset;
      }
      const oemManager = await User.findAndCountAll(condition);
      return oemManager;
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  // to fetch oem manager details
  async getOEMManagerCompleteDetail(userId: string) {
    try {
      let includeCondition = [
        {
          model: UserArea,
          attributes: ['userAreaId'],
          include: [
            {
              model: Region,
              attributes: ['regionId', 'name'],
            },
            {
              model: State,
              attributes: ['stateId', 'name'],
            },
            {
              model: City,
              attributes: ['cityId', 'name'],
            },
          ],
        },
        {
          model: OEM,
          attributes: ['oemId', 'name', 'status'],
        },
        {
          model: OEMManagerDealers,
          attributes: ['oemManagerDealerId'],
          include: [
            {
              model: User,
              as: 'dealer',
              attributes: ['userId', 'uniqueId', 'username', 'role', 'email'],
            },
          ],
        },
      ];
      const oemManager = await User.findOne({
        attributes: [
          'userId',
          'uniqueId',
          'username',
          'email',
          'description',
          'phone',
          'isActive',
        ],
        where: {
          userId: userId,
        },
        include: includeCondition,
      });
      return oemManager;
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async updateUser(userDetails: any, userId: string) {
    try {
      return await User.update(userDetails, {
        where: { userId: userId },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async updateUserArea(userAreaDetails: any, userId: string) {
    try {
      return await UserArea.update(userAreaDetails, {
        where: { userId: userId },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async getFormattedOEMManagerDealers(oemManagerId: string) {
    try {
      const oemDealers = await OEMManagerDealers.findAll({
        where: {
          oemManagerId: oemManagerId,
        },
        include: [
          {
            model: User,
            as: 'dealer',
            where: {
              isActive: true,
              isKycDone: true,
            },
          },
        ],
      });
      let dealersArr: any = [];
      if (oemDealers) {
        oemDealers.forEach((oemDealer: any) => {
          dealersArr.push(`${oemDealer.dealerId}`);
        });
      }
      return dealersArr;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getOemManagerDealerDetail(
    oemManagerId: string,
    cityWhereCondtion: any
  ) {
    try {
      return await User.findOne({
        attributes: ['username'],
        where: {
          userId: oemManagerId,
        },
        include: [
          {
            model: OEMManagerDealers,
            attributes: ['oemManagerDealerId'],
            include: [
              {
                model: User,
                as: 'dealer',
                attributes: ['username', 'userId'],
                where: {
                  deletedAt: null,
                  isActive: true,
                  role: config.userRolesObject.DEALER,
                },
                include: [
                  {
                    model: Outlet,
                    where: cityWhereCondtion,
                    attributes: ['outletId', 'name'],
                    include: [
                      {
                        model: Machine,
                        attributes: ['machineGuid', 'name', 'ShortName'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const oemManagerService = new OEMManagerService();
export { oemManagerService };
