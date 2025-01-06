import { Op, WhereOptions } from 'sequelize';
import { Badge } from '../../models/badge';
import { AddBadge } from '../types/badge.type';
import { CustomerBadge } from '../../models/customer_badge';
import { Customer } from '../../models/customer';
import { AnyAaaaRecord } from 'dns';
import { isNullOrUndefined } from '../../../common/utility';

/**
 * Service class for handling badge-related operations
 *
 * This class provides methods to interact with the Badge model,
 * performing operations such as adding, updating, deleting, and querying badges.
 */
class BadgeServices {
  /**
   * Method to add a new badge
   *
   * This method creates a new badge record in the database.
   *
   * @param {AddBadge} body - The details of the badge to be added
   * @returns {Promise<Badge>} - The created badge
   */
  async addNewbadge(body: AddBadge) {
    try {
      return await Badge.create(body); // Create a new badge record
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  /**
   * Method to check if a badge name already exists
   *
   * This method checks if there is an existing badge with the given name that has not been deleted.
   *
   * @param {string} name - The name of the badge to check
   * @returns {Promise<Badge | null>} - The badge if found, otherwise null
   */
  async badgeNameExist(name: string) {
    try {
      return await Badge.findOne({
        where: {
          badgeName: name,
          deletedAt: null, // Ensure the badge is not deleted
        },
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  /**
   * Method to check if a badge ID exists
   *
   * This method checks if there is an existing badge with the given ID that has not been deleted.
   *
   * @param {string} id - The ID of the badge to check
   * @returns {Promise<Badge | null>} - The badge if found, otherwise null
   */
  async badgeIdExist(id: string) {
    try {
      return await Badge.findOne({
        where: {
          badgeId: id,
          deletedAt: null, // Ensure the badge is not deleted
        },
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  /**
   * Method to logically delete a badge
   *
   * This method marks a badge as deleted by setting its `deletedAt` field.
   *
   * @param {string} id - The ID of the badge to delete
   * @returns {Promise<[number, Badge[]]>} - The result of the update operation
   */
  async deleteBadge(id: string) {
    try {
      return await Badge.update(
        {
          deletedAt: new Date(), // Set the deletedAt field to the current date
        },
        {
          where: {
            badgeId: id,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  /**
   * Method to update a badge's details
   *
   * This method updates a badge record with new details.
   *
   * @param {any} badgeBody - The new details for the badge
   * @param {string} badgeId - The ID of the badge to update
   * @returns {Promise<[number, Badge[]]>} - The result of the update operation
   */
  async updateBadge(badgeBody: any, badgeId: string) {
    try {
      return await Badge.update(badgeBody, {
        where: {
          badgeId: badgeId,
        },
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  /**
   * Method to get a list of badges with pagination and search options
   *
   * This method retrieves a paginated list of badges, optionally filtered by a search term,
   * and sorted by specified criteria.
   *
   * @param {any} queryBody - The query parameters for pagination, search, and sorting
   * @returns {Promise<{rows: Badge[], count: number}>} - The list of badges and the total count
   */
  async getBadgeList(queryBody: any) {
    try {
      const { limit, offset, search, sortBy, orderBy, isActive } = queryBody;
      const whereCondition: WhereOptions = {
        deletedAt: null, // Ensure only non-deleted badges are retrieved
      };
      if (search) {
        whereCondition['badgeName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`, // Add search filter for badge name
        };
      }
      if (!isNullOrUndefined(isActive)) {
        whereCondition['isActive'] = isActive;
      }
      return await Badge.findAndCountAll({
        where: whereCondition,
        limit: limit,
        offset: offset,
        order: [[sortBy, orderBy]], // Sort by the specified criteria
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async getAssignedBadgeCustomerList(queryBody: any, badgeId: string) {
    try {
      const { limit, offset, search, sortBy, orderBy } = queryBody;
      const whereCondition = {
        badgeId: badgeId,
      };
      // if (search) {
      //   whereCondition['badgeName'] = {
      //     [Op.iLike]: `%${decodeURIComponent(search)}%`, // Add search filter for badge name
      //   };
      // }
      return await CustomerBadge.findAndCountAll({
        where: whereCondition,
        attributes: ['customerBadgeId', 'createdAt'],
        include: [
          {
            model: Customer,
            where: {
              deletedAt: null,
              isDeleted: false,
            },
            attributes: ['customerId', 'firstName', 'lastName'],
          },
        ],
        limit: limit,
        offset: offset,
        order: [[sortBy, orderBy]], // Sort by the specified criteria
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async getCustomerAssignedBadges(
    queryBody: any,
    customerId: string,
    waterSaved: number
  ) {
    try {
      const { limit, offset, search, sortBy, orderBy } = queryBody;
      const whereCondition: any = {
        customerId: customerId,
      };
      if (search) {
        whereCondition['badgeName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`, // Add search filter for badge name
        };
      }
      if (waterSaved > 0) {
      }
      return await CustomerBadge.findAndCountAll({
        where: whereCondition,
        limit,
        offset: offset,
        order: [[sortBy, orderBy]], // Sort by the specified criteria
      });

      // const whereCondition: any = {
      //   deletedAt: null,
      //   criteria: {
      //     [Op.lte]: waterSaved,
      //   },
      // };
      // return Badge.findAndCountAll({
      //   where: whereCondition,
      //   limit,
      //   offset: offset,
      //   order: [[sortBy, orderBy]], // Sort by the specified criteria
      // });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async getCustomerUnAcheivedBadges(savedWater: number, userId: string) {
    try {
      const whereCondition: any = {
        deletedAt: null,
        criteria: {
          [Op.gt]: savedWater,
        },
      };
      return Badge.findAll({
        where: whereCondition,
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async badgesCount(badgeIds: string[]) {
    try {
      return await Badge.count({
        where: {
          badgeId: {
            [Op.in]: badgeIds,
          },
        },
      });
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async allotBadge(customerId: string) {
    try {
      const customer = await Customer.findOne({
        attributes: ['totalWaterSaved'],
        where: {
          customerId: customerId,
        },
      });
      let waterSaved = 0;
      if (customer) {
        waterSaved = customer.totalWaterSaved;
        // Fetch all customer badges in a single query
        const customerBadgeArr = await CustomerBadge.findAll({
          attributes: ['badgeId'],
          where: { customerId },  
          raw: true,
        }).then((badges) => badges.map((badge) => badge.badgeId));

        // Fetch eligible badges
        const badges = await Badge.findAll({
          where: {
            criteria: { [Op.lte]: waterSaved },
            isActive: true,
            deletedAt: null,
            badgeId: { [Op.notIn]: customerBadgeArr },
          },
          raw: true,
        });

        // Prepare new badges to be allotted
        const newCustomerBadges = badges.map((badge) => ({
          customerId,
          badgeId: badge.badgeId,
          badgeName: badge.badgeName,
          badgeDescription: badge.badgeDescription,
          badgeUrl: badge.badgeUrl,
          criteria: badge.criteria,
        }));

        // Bulk create new customer badges if any
        if (newCustomerBadges.length) {
          await CustomerBadge.bulkCreate(newCustomerBadges);
        }
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async unAllotBadge(customerId: string, waterSaved: number) {}
}

// Create an instance of BadgeServices and export it
const BadgeService = new BadgeServices();
export { BadgeService };
