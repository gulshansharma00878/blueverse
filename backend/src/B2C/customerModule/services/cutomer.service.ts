import { Op } from 'sequelize';
import { Customer } from '../../models/customer';
import { config } from '../../../config/config';
import { CustomerUpdateDTO } from '../dto/customer.dto';
import { DataTypes } from 'sequelize';
import { Vehicle } from '../../models/vehicle';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { CONSTANT } from '../constant';
import { UserWallet } from '../../models/user_wallet';
import { CustomerNotification } from '../../models/customerNotification';
import { Booking, Status } from '../../models/booking';
import { isNullOrUndefined } from '../../../common/utility';

class CustomerServices {
  async updateCustomer(customerParam: CustomerUpdateDTO, customerId: string) {
    try {
      return await Customer.update(
        {
          firstName: customerParam.firstName,
          lastName: customerParam.lastName,
          city: customerParam.city ? customerParam.city : '',
          state: customerParam.state ? customerParam.state : '',
          email: customerParam.email,
          isActive: CONSTANT.USER_ACTIVATED,
          address: customerParam.address,
          phone: customerParam.phone,
          gender: customerParam.gender,
          image: customerParam.image,
          stateId: customerParam.stateId,
          cityId: customerParam.cityId,
          pincode: customerParam.pincode,
        },
        {
          where: {
            customerId: customerId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getCustomer(customerId: string) {
    try {
      return await Customer.findOne({
        where: {
          customerId: customerId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomers(query: any) {
    try {
      let { search, state, city, offset, limit, vehicleType } = query;

      const { _limit, _offset } = paginatorParamFormat(limit, offset);

      // Making The Searching condition
      let whereCondition: any = {
        isDeleted: false,
        deletedAt: null,
      };

      if (city) {
        const cityValues = city.split(',');
        whereCondition = {
          cityId: {
            [Op.in]: cityValues,
          },
        };
      }

      if (state) {
        const stateValues = state.split(',');
        whereCondition = {
          stateId: {
            [Op.in]: stateValues,
          },
        };
      }

      // implementing the search on brand name and market name
      if (search) {
        // Elmenting the extra space
        search = search.trim();

        whereCondition = {
          ...whereCondition,

          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },

            {
              lastName: { [Op.iLike]: `%${search}%` },
            },
            {
              address: { [Op.iLike]: `%${search}%` },
            },
            {
              email: { [Op.iLike]: `%${search}%` },
            },
          ],
        };
      }

      let vehicleCondtion: any = {
        isDeleted: false,
      };

      if (vehicleType) {
        const vehicleValues = vehicleType.split(',');
        vehicleCondtion.vehicleType = { [Op.in]: vehicleValues };
      }

      let sortOrder: any = [['createdAt', 'desc']];

      const customerList = await Customer.findAndCountAll({
        where: {
          ...whereCondition,
          isActive: {
            [Op.ne]: 0,
          },
        },
        include: [
          {
            model: Vehicle,
            required: isNullOrUndefined(vehicleCondtion?.vehicleType)
              ? false
              : true,
            where: vehicleCondtion,
            attributes: [
              'hsrpNumber',
              'manufacturer',
              'vehicleModel',
              'vehicleType',
            ],
          },
        ],
        order: sortOrder,
        offset: _offset,
        limit: _limit,
        distinct: true,
      });

      return {
        customer: customerList.rows,
        pagination: paginatorService(
          _limit,
          _offset / _limit + 1,
          customerList.count
        ),
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async deleteCustomer(customerId: string) {
    try {
      // updating the last login date
      await Customer.update(
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          where: {
            customerId: customerId,
          },
        }
      );

      // Update Booking details
      await Booking.update(
        { bookingStatus: Status.Cancelled },
        {
          where: { customerId: customerId, bookingStatus: Status.Confirmed },
        }
      );

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async CustomerDeactivate(customerId: string, isActive: number) {
    try {
      return await Customer.update(
        {
          isActive: isActive,
        },
        {
          where: {
            customerId: customerId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomersStateCity() {
    try {
      const customerList = await Customer.findAll({
        attributes: ['state', 'city'],
        where: {
          isActive: {
            [Op.ne]: 0,
          },
        },
      });

      return customerList;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomerNotification(data: any) {
    try {
      let { offset, limit, loggedInUser } = data;

      const { _limit, _offset } = paginatorParamFormat(limit, offset);

      // Getting the all customer notification
      const customerNotification = await CustomerNotification.findAndCountAll({
        where: {
          customerId: loggedInUser.userId,
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        customer: customerNotification.rows,
        pagination: paginatorService(
          _limit,
          _offset / _limit + 1,
          customerNotification.count
        ),
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async customerReadNotification(data: any) {
    try {
      let { loggedInUser, customerNotificationId } = data;

      if (!isNullOrUndefined(customerNotificationId)) {
        await CustomerNotification.update(
          {
            isRead: true,
          },
          {
            where: {
              customerNotificationId: customerNotificationId,
            },
          }
        );
      } else {
        await CustomerNotification.update(
          {
            isRead: true,
          },
          {
            where: {
              customerId: loggedInUser.userId,
            },
          }
        );
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomerCancelNotification(data: any) {
    try {
      let { loggedInUser } = data;

      return await CustomerNotification.findAll({
        where: {
          customerId: loggedInUser.userId,
          isRead: false,
          isCancel: true,
          isMerchantClosure: true,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomerUnreadNotification(data: any) {
    try {
      let { offset, limit, loggedInUser } = data;

      const { _limit, _offset } = paginatorParamFormat(limit, offset);

      // Getting the all customer notification
      const customerNotification = await CustomerNotification.findAndCountAll({
        where: {
          customerId: loggedInUser.userId,
          isRead: false,
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        customer: customerNotification.rows,
        pagination: paginatorService(
          _limit,
          _offset / _limit + 1,
          customerNotification.count
        ),
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomerDetail(customerId: string) {
    try {
      return Customer.findOne({
        where: {
          customerId: customerId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const CustomerService = new CustomerServices();
export { CustomerService };
