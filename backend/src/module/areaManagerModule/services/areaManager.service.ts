import { Op } from 'sequelize';

import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { OEM } from '../../../models/oem';
import { config } from '../../../config/config';
import { AreaManagerOEM } from '../../../models/User/AreaManagerOEM';
import { UserArea } from '../../../models/User/UserArea';
import { User } from '../../../models/User/user';
import { AreaManagerDealers } from '../../../models/User/AreaManagerDealers';
import { Outlet } from '../../../models/outlet';
import { Machine } from '../../../models/Machine/Machine';
class AreaManagerService {
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

  // Remove code and this table
  async createUserOEM(userOEMDetails: any) {
    try {
      return await AreaManagerOEM.bulkCreate(userOEMDetails);
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  // delete code
  // async deleteUserOEM(areaManagerId: string) {
  //   try {
  //     return await AreaManagerOEM.destroy({
  //       where: {
  //         areaManagerId: areaManagerId,
  //       },
  //     });
  //   } catch (err) {
  //     throw Promise.reject(err);
  //   }
  // }

  async getAreaManagers(body: any) {
    try {
      const { search, _limit, _offset } = body;
      let whereCondition: any = {
        role: config.userRolesObject.AREA_MANAGER,
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
          model: AreaManagerDealers,
          attributes: ['areaManagerDealerId'],
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
      const areaManagers = await User.findAndCountAll(condition);
      return areaManagers;
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  // to fetch area manager details
  async getAreaManagerCompleteDetail(userId: string) {
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
          model: AreaManagerDealers,
          attributes: ['areaManagerDealerId'],
          include: [
            {
              model: User,
              as: 'dealer',
              attributes: ['userId', 'uniqueId', 'username', 'role', 'email'],
            },
          ],
        },
      ];
      const areaManagers = await User.findOne({
        attributes: [
          'userId',
          'uniqueId',
          'username',
          'email',
          'phone',
          'countryCode',
          'address',
          'isActive',
          'role',
          'profileImg',
          'description',
        ],
        where: {
          userId: userId,
          isActive: true,
          deletedAt: null,
        },
        include: includeCondition,
      });
      return areaManagers;
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

  async createAreaManagerDealers(areaManagerDealers: any) {
    try {
      return await AreaManagerDealers.bulkCreate(areaManagerDealers);
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async deleteAreaManagerDealers(areaManagerId: string) {
    try {
      return await AreaManagerDealers.destroy({
        where: {
          areaManagerId: areaManagerId,
        },
      });
    } catch (err) {
      throw Promise.reject(err);
    }
  }

  async getFormattedAreaManagerDealers(areaManagerId: string) {
    try {
      const areaManDealers = await AreaManagerDealers.findAll({
        where: {
          areaManagerId: areaManagerId,
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
      if (areaManDealers) {
        areaManDealers.forEach((areaManDealer: any) => {
          dealersArr.push(`${areaManDealer.dealerId}`);
        });
      }
      return dealersArr;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAreaManagerDealerDetails(
    areaManagerId: string,
    cityWhereCondtion: any
  ) {
    try {
      return await User.findOne({
        attributes: ['username'],
        where: {
          userId: areaManagerId,
        },
        include: [
          {
            model: AreaManagerDealers,
            attributes: ['areaManagerDealerId'],
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
                    // attributes: ['outletId', 'name'],
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

const areaManagerService = new AreaManagerService();
export { areaManagerService };
