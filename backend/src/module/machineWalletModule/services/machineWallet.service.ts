import { MachineWallet } from '../../../models/Machine/MachineWallet';
import { Machine } from '../../../models/Machine/Machine';
import { Transactions } from '../../../models/transactions';
import { Outlet } from '../../../models/outlet';
import { WashType } from '../../../models/wash_type';
import constant from '../../../common/stringConstants';
import { Op } from 'sequelize';
import db from '../../../models/index';
import { machine } from 'os';
class MachineWalletService {
  async getMachineTransactionHistory(user: any, body: any) {
    try {
      let { sort_by, filters, filterKey, search, _offset, _limit } = body;
      const { userId, role } = user;
      let whereCondition: any = {};
      if (filters) {
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
              transactionType: {
                [Op.or]: filterKey.transactionType,
              },
            },
            {
              sourceType: {
                [Op.or]: filterKey.sourceType,
              },
            },
            {
              '$transactions.washType.Guid$': {
                [Op.or]: filterKey.washTypeId,
              },
            },
          ],
        };
      }
      if (filterKey.startDate && filterKey.endDate) {
        whereCondition.createdAt = {
          [Op.between]: [filterKey.startDate, filterKey.endDate],
        };
      }
      if (search) {
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              skuNumber: { [Op.iLike]: '%' + search + '%' },
            },
            {
              uniqueId: { [Op.iLike]: '%' + search + '%' },
            },
          ],
        };
      }
      // if (role == constant.USERROLE.DEALER) {
      whereCondition['$machine.outlet.dealer_id$'] = userId;
      // }
      let sortOrder = 'DESC';
      if (sort_by && Object.keys(sort_by).length > 0) {
        if (sort_by.type) {
          sortOrder = sort_by.type;
        }
      }
      const orderCondition = [['realCreatedAt', sortOrder]];

      const includeCondition = [
        {
          model: Machine,
          attributes: ['machineGuid', 'name'],
          include: [
            {
              model: Outlet,
              attributes: ['outletId', 'name', 'address', 'dealerId'],
            },
          ],
        },
        {
          model: Transactions,
          // where: {
          //   IsAssigned: true,
          // },
          attributes: ['Guid', 'SkuNumber'],
          include: [
            {
              model: WashType,
              attributes: ['Guid', 'Name'],
            },
          ],
        },
      ];
      let condition: any = {
        where: whereCondition,
        include: includeCondition,
        order: orderCondition,
      };
      if (!!_offset) {
        condition = { ...condition, offset: _offset };
      }
      if (!!_limit) {
        condition = { ...condition, limit: _limit };
      }
      const result = await MachineWallet.findAndCountAll(condition);
      return result;
    } catch (err) {
      throw Promise.reject(err);
    }
  }
  async getDealerMachineBalance(user: any, machineIds: any) {
    try {
      const machines = await Machine.findAndCountAll({
        attributes: [
          'machineGuid',
          'walletBalance',
          'blueverseCredit',
          'topUpBalance',
        ],
        include: [
          {
            model: Outlet,
            attributes: ['outletId', 'dealerId'],
          },
        ],
        where: {
          machineGuid: {
            [Op.or]: machineIds,
          },
          '$outlet.dealer_id$': user.userId,
        },
      });
      let walleteBalance: any = 0;
      let blueverseCredit: any = 0;
      machines.rows.forEach((element) => {
        walleteBalance +=
          Number(element.walletBalance) + Number(element.topUpBalance);
        blueverseCredit += Number(element.blueverseCredit);
      });
      walleteBalance = Number(walleteBalance.toFixed(2));
      blueverseCredit = Number(blueverseCredit.toFixed(2));
      return { walleteBalance, blueverseCredit };
    } catch (err) {
      throw Promise.reject(err);
    }
  }
}
const machineWalletService = new MachineWalletService();
export { machineWalletService };
