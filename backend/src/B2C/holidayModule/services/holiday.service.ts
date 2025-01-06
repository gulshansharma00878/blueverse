import { Op, Sequelize, WhereOptions } from 'sequelize';
import { Holiday } from '../../models/holiday';
import db from '../../../models/';
/**
 * Service class for handling holiday-related operations
 *
 * This class provides methods to interact with the Badge model,
 * performing operations such as adding, updating, deleting, and querying holidays.
 */
class HolidayServices {
  /**
   * Method to add a new holiday
   *
   * This method creates a new holiday record in the database.
   *
   * @param {AddBadge} body - The details of the holiday to be added
   * @returns {Promise<Badge>} - The created holiday
   */
  async addNewHoliday(body: { holidayName: string; holidayDate: string }) {
    try {
      return await Holiday.create(body); // Create a new holiday record
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  /**
   * Method to add a new holiday
   *
   * This method creates a new holiday record in the database.
   *
   * @param {AddBadge} body - The details of the holiday to be added
   * @returns {Promise<Badge>} - The created holiday
   */
  async getHolidayList(queryBody: any) {
    try {
      const { limit, offset, search, sortBy, orderBy } = queryBody;
      const whereCondition: WhereOptions = {
        deletedAt: null, // Ensure only non-deleted holidays are retrieved
      };
      if (search) {
        whereCondition['holidayName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`, // Add search filter for holiday name
        };
      }
      return await Holiday.findAndCountAll({
        where: whereCondition,
        limit: limit,
        offset: offset,
        order: [[sortBy, orderBy]], // Sort by the specified criteria
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async getHolidayDetails(holidayId: any) {
    try {
      return await Holiday.findOne({
        where: {
          holidayId: holidayId,
        },

        // order: [[sortBy, orderBy]], // Sort by the specified criteria
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async updateHolidayDetail(body: any, holidayId: string) {
    try {
      return await Holiday.update(body, {
        where: {
          holidayId: holidayId,
        },
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async deleteHolidayDetail(holidayId: string) {
    try {
      return await Holiday.update(
        {
          deletedAt: new Date(),
        },
        {
          where: {
            holidayId: holidayId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async holidayIdExist(holidayId: string) {
    try {
      return await Holiday.findOne({
        where: {
          holidayId: holidayId,
          deletedAt: null,
        },
      });
    } catch (err) {
      return Promise.reject(err); // Re
    }
  }

  async holidayExist(holidayName: string, year: string) {
    try {
      return await Holiday.findOne({
        where: Sequelize.and(
          { holidayName: holidayName },
          { deletedAt: null },
          Sequelize.where(
            Sequelize.literal(`EXTRACT(YEAR FROM "holiday_date")`),
            year
          )
        ),
      });
    } catch (err) {
      return Promise.reject(err); // Re
    }
  }
}

// Create an instance of HolidayServices and export it
const HolidayService = new HolidayServices();
export { HolidayService };
