import { ReferAndEarn } from '../../models/refer_earn_setting';
import db from '../../../models';
import { Customer } from '../../models/customer';
import { Referral } from '../../models/reffer';
import { Op } from 'sequelize';
import { isNullOrUndefined } from '../../../common/utility';
import moment from 'moment';

class ReferAndEarnServices {
  async createReferAndEarn(body: any) {
    try {
      return await ReferAndEarn.create(body);
    } catch (err: any) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async updateReferAndEarn(body: any, referAndEarnId: string) {
    try {
      return await ReferAndEarn.update(body, {
        where: {
          referAndEarnId: referAndEarnId, // Update the referAndEarnId
        },
      });
    } catch (err: any) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getReferAndEarnById(referAndEarnId: string) {
    try {
      return await ReferAndEarn.findOne({
        where: {
          referAndEarnId: referAndEarnId,
          isActive: true, // Find the service by ID
        },
      });
    } catch (err: any) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Method to "delete" an Refer And Earn by setting the deletedAt timestamp
  async deleteReferAndEarn(referAndEarnId: string) {
    try {
      return await ReferAndEarn.update(
        {
          deletedAt: new Date(), // Set the deletedAt timestamp to mark the service as deleted
          isActive: false, // Find the service by ID
        },
        {
          where: {
            referAndEarnId: referAndEarnId, // Find the brand by ID
          },
        }
      );
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getReferrerList(queryBody: any) {
    try {
      let { limit, offset, search, referAndEarnId } = queryBody;
      console.log(
        '🚀 ~ ReferAndEarnServices ~ getReferrerList ~ referAndEarnId:',
        referAndEarnId
      );

      // Initialize an empty whereCondition object
      let whereCondition: any = {
        referAndEarnId: referAndEarnId,
      };

      // Check if search is not null or empty
      if (search) {
        // Trim the search string to remove any leading or trailing spaces
        search = search.trim();

        // Define the whereCondition object
        whereCondition = {
          ...whereCondition,
          // Use the OR operator to combine multiple conditions
          [Op.or]: [
            // Search for the search term in the referrer's first name
            {
              '$referrer.first_name$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the referrer's last name
            {
              '$referrer.last_name$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the referrer's user referral code
            {
              '$referrer.user_referral_code$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the combined first name and last name
            {
              [Op.and]: [
                // Search for the first part of the search term in the first name or last name
                {
                  [Op.or]: [
                    {
                      '$referrer.first_name$': {
                        [Op.iLike]: `%${search.split(' ')[0]}%`,
                      },
                    },
                    {
                      '$referrer.last_name$': {
                        [Op.iLike]: `%${search.split(' ')[0]}%`,
                      },
                    },
                  ],
                },
                // Search for the second part of the search term in the first name or last name
                {
                  [Op.or]: [
                    {
                      '$referrer.first_name$': {
                        [Op.iLike]: `%${search.split(' ')[1]}%`,
                      },
                    },
                    {
                      '$referrer.last_name$': {
                        [Op.iLike]: `%${search.split(' ')[1]}%`,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
      }

      return await Referral.findAndCountAll({
        // Define the attributes to be retrieved
        attributes: [
          'referrerUserId',
          'referrerBonusType',
          'referredUserBonusType',
          'referAndEarnId',
          [db.sequelize.fn('COUNT', '*'), 'totalReferrals'],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN is_download = true THEN 1 ELSE 0 END`
              )
            ),
            'totalDownloads',
          ],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN referrer_bonus_type = 'Wash' THEN referrer_bonus ELSE 0 END`
              )
            ),
            'totalWashBonus',
          ],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN referrer_bonus_type = 'Amount' THEN referrer_bonus ELSE 0 END`
              )
            ),
            'totalAmountBonus',
          ],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN is_booked = true THEN 1 ELSE 0 END`
              )
            ),
            'totalBookedServices',
          ],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN referral_status = 'Pending' THEN 1 ELSE 0 END`
              )
            ),
            'totalPendingServices',
          ],
        ],
        // Define the include option to include the referrer customer
        include: [
          {
            model: Customer,
            as: 'referrer',
            attributes: ['firstName', 'lastName', 'userReferralCode'],
          },
        ],
        // Apply the whereCondition
        where: whereCondition,
        // Group the results by referrerUserId and referrer.customer_id
        group: [
          'referrerUserId',
          'referrer.customer_id',
          'referrerBonusType',
          'referredUserBonusType',
          'referAndEarnId',
        ],

        order: [['referrer', 'first_name', 'ASC']], // Sort by first name in ascending order
        limit: limit, // Limit the number of results
        offset: offset, // Offset for pagination
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getReferredUserList(queryBody: any) {
    try {
      let { limit, offset, search, referrerId, referAndEarnId } = queryBody;

      // Initialize an empty whereCondition object
      let whereCondition: any = { referAndEarnId: referAndEarnId };

      // Check if search is not null or empty
      if (search) {
        // Trim the search string to remove any leading or trailing spaces
        search = search.trim();

        // Define the whereCondition object
        whereCondition = {
          ...whereCondition,
          // Use the OR operator to combine multiple conditions
          [Op.or]: [
            // Search for the search term in the referred user's first name
            {
              '$referred.firstName$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the referred user's last name
            {
              '$referred.lastName$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the referred user's email
            {
              '$referred.email$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the combined first name and last name
            {
              [Op.and]: [
                // Search for the first part of the search term in the first name or last name
                {
                  [Op.or]: [
                    {
                      '$referred.firstName$': {
                        [Op.iLike]: `%${search.split(' ')[0]}%`,
                      },
                    },
                    {
                      '$referred.lastName$': {
                        [Op.iLike]: `%${search.split(' ')[0]}%`,
                      },
                    },
                  ],
                },
                // Search for the second part of the search term in the first name or last name
                {
                  [Op.or]: [
                    {
                      '$referred.firstName$': {
                        [Op.iLike]: `%${search.split(' ')[1]}%`,
                      },
                    },
                    {
                      '$referred.lastName$': {
                        [Op.iLike]: `%${search.split(' ')[1]}%`,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
      }

      // Use Sequelize to find all referrals that match the whereCondition
      return await Referral.findAndCountAll({
        // Define the attributes to include in the result
        attributes: [
          'createdAt',
          'expiryDate',
          'isDownload',
          'isBooked',
          'status',
          'referredUserBonus',
          'referredUserBonusType',
        ],
        // Include the referred user in the result
        include: [
          {
            model: Customer,
            as: 'referred',
            attributes: ['firstName', 'lastName', 'email', 'phone'],
          },
        ],
        // Apply the whereCondition and pagination
        where: {
          referrerUserId: referrerId,
          ...whereCondition,
        },
        limit,
        offset,
        // Sort the result by the specified column and order
        order: [[{ model: Customer, as: 'referred' }, 'first_name', 'asc']],
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getAllReferAndEarn(queryBody: any) {
    try {
      let { limit, offset, search } = queryBody;
      const query = `
                    SELECT
                      "ReferAndEarn"."refer_and_earn_id" AS "referAndEarnId",
                      "ReferAndEarn"."refer_and_earn_name" AS "referAndEarnName",
                      "ReferAndEarn"."refer_and_earn_description" AS "referAndEarnDescription",
                      "ReferAndEarn"."start_date" AS "startDate",
                      "ReferAndEarn"."end_date" AS "endDate",
                      "ReferAndEarn"."is_active" AS "IsActive",
                      "ReferAndEarn"."reward_for_referee" AS "rewardForReferee",
                      "ReferAndEarn"."reward_for_new_user" "rewardForNewUser",
                      "ReferAndEarn"."reward_type_for_referee" AS "rewardTypeForReferee",
                      "ReferAndEarn"."reward_type_for_new_user" AS "rewardTypeForNewUser",
                      "ReferAndEarn"."createdAt",
                      "ReferAndEarn"."deleted_at" AS "deletedAt",
                      COALESCE(COUNT("Referral"."refer_and_earn_id"), 0) AS "totalReferrals",
                      COALESCE(SUM(CASE WHEN "Referral"."is_download" = true THEN 1 ELSE 0 END), 0) AS "totalDownloads",
                      COALESCE(SUM(CASE WHEN "Referral"."is_booked" = true THEN 1 ELSE 0 END), 0) AS "totalBookedServices",
                      COALESCE(SUM(CASE WHEN "Referral"."referral_status" = 'Pending' THEN 1 ELSE 0 END), 0) AS "totalPendingServices"
                    FROM
                      "refer_and_earn" AS "ReferAndEarn"
                      LEFT JOIN "referrals" AS "Referral" ON "ReferAndEarn"."refer_and_earn_id" = "Referral"."refer_and_earn_id"
                    WHERE
                      "ReferAndEarn"."is_active" = true
                     ${
                       search
                         ? `AND ("ReferAndEarn"."refer_and_earn_name" ILIKE :search )`
                         : ''
                     }
                    GROUP BY
                      "ReferAndEarn"."refer_and_earn_id",
                      "ReferAndEarn"."refer_and_earn_name",
                      "ReferAndEarn"."refer_and_earn_description",
                      "ReferAndEarn"."start_date",
                      "ReferAndEarn"."end_date",
                      "ReferAndEarn"."is_active",
                      "ReferAndEarn"."reward_for_referee",
                      "ReferAndEarn"."reward_for_new_user",
                      "ReferAndEarn"."reward_type_for_referee",
                      "ReferAndEarn"."reward_type_for_new_user",
                      "ReferAndEarn"."deleted_at",
                      "ReferAndEarn"."createdAt"
                    ORDER BY
                      "ReferAndEarn"."createdAt" DESC
                    LIMIT ${limit} OFFSET ${offset};
                  `;
      const results = await db.sequelize.query(query, {
        type: db.sequelize.QueryTypes.SELECT,
        replacements: {
          search: search ? `%${search}%` : null,
        },
      });

      return {
        count: results.length,
        rows: results,
      };
    } catch (err: any) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getReferrerDetails(referrerId: any) {
    try {
      // Fetch referral data with aggregated bonus amounts
      const referralData = await Referral.findAll({
        where: {
          referrerUserId: referrerId,
        },
        attributes: [
          'referrerUserId',
          // Calculate total amount bonus
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN referrer_bonus_type = 'Amount' THEN referrer_bonus ELSE 0 END`
              )
            ),
            'totalAmount',
          ],
          // Calculate total wash bonus
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN referrer_bonus_type = 'Wash' THEN referrer_bonus ELSE 0 END`
              )
            ),
            'totalWash',
          ],
        ],
        group: ['referrerUserId'],
      });

      // Fetch customer data
      const customerData = await Customer.findOne({
        where: {
          customerId: referrerId,
        },
      });

      // Create response object
      const response = referralData.length
        ? {
            ...referralData[0].dataValues,
            referrer: customerData,
          }
        : {
            totalAmount: 0,
            totalWash: 0,
            referrer: customerData,
          };

      return response;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getReferredUserListForCustomer(queryBody: any) {
    try {
      let { limit, offset, search, referrerId } = queryBody;

      // Initialize an empty whereCondition object
      let whereCondition = {};

      // Check if search is not null or empty
      if (search) {
        // Trim the search string to remove any leading or trailing spaces
        search = search.trim();

        // Define the whereCondition object
        whereCondition = {
          // Use the OR operator to combine multiple conditions
          [Op.or]: [
            // Search for the search term in the referred user's first name
            {
              '$referred.firstName$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the referred user's last name
            {
              '$referred.lastName$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the referred user's email
            {
              '$referred.email$': { [Op.iLike]: `%${search}%` },
            },
            // Search for the search term in the combined first name and last name
            {
              [Op.and]: [
                // Search for the first part of the search term in the first name or last name
                {
                  [Op.or]: [
                    {
                      '$referred.firstName$': {
                        [Op.iLike]: `%${search.split(' ')[0]}%`,
                      },
                    },
                    {
                      '$referred.lastName$': {
                        [Op.iLike]: `%${search.split(' ')[0]}%`,
                      },
                    },
                  ],
                },
                // Search for the second part of the search term in the first name or last name
                {
                  [Op.or]: [
                    {
                      '$referred.firstName$': {
                        [Op.iLike]: `%${search.split(' ')[1]}%`,
                      },
                    },
                    {
                      '$referred.lastName$': {
                        [Op.iLike]: `%${search.split(' ')[1]}%`,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
      }

      // Use Sequelize to find all referrals that match the whereCondition
      return await Referral.findAndCountAll({
        // Define the attributes to include in the result
        attributes: [
          'createdAt',
          'expiryDate',
          'isDownload',
          'isBooked',
          'status',
          'referredUserBonus',
          'referredUserBonusType',
        ],
        // Include the referred user in the result
        include: [
          {
            model: Customer,
            as: 'referred',
            attributes: ['firstName', 'lastName', 'email', 'phone'],
          },
        ],
        // Apply the whereCondition and pagination
        where: {
          referrerUserId: referrerId,
          ...whereCondition,
        },
        limit,
        offset,
        // Sort the result by the specified column and order
        order: [[{ model: Customer, as: 'referred' }, 'first_name', 'asc']],
      });
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getCurrentReferAndEarn() {
    try {
      const currentTime = moment().toISOString();

      return await ReferAndEarn.findOne({
        where: {
          isActive: true, //
          startDate: {
            [Op.lte]: currentTime, // Only select the refer and earn which is valid
          },
          endDate: {
            [Op.gte]: currentTime, // Only select the refer and earn which is valid
          },
        },
      });
    } catch (err: any) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }
}

const ReferAndEarnService = new ReferAndEarnServices();
export { ReferAndEarnService };
