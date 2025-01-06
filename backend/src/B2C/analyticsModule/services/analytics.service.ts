import { Model, Op } from 'sequelize';
import db from '../../../models';
import { Subscription } from '../../../B2C/models/subscription';
import { BookingAdditionalService } from '../../../B2C/models/booking_additional_service';
import { VehicleType } from '../../../B2C/models/vehicle';
import { paginatorParamFormat } from '../../../services/commonService';
import moment from 'moment';

class AnalyticsServices {
  /**
   * Gets the booking wash counts for customers within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns An object with counts for first wash, never booked, paid wash, and recurring wash.
   */
  async getBookingWashCounts(fromDateTime: any, toDateTime: any) {
    try {
      let replacements: any = {};
      let whereCondition: string = `WHERE booking.booking_status = 'Completed' 
                              AND booking.wash_by IN ('Subscription', 'Amount', 'free_wash')`;

      // Build the date condition only if both fromDateTime and toDateTime are provided
      if (fromDateTime && toDateTime) {
        whereCondition += ` AND slot.start_date_time::date >= :from 
                          AND slot.start_date_time::date <= :to`;
        replacements.from = moment(fromDateTime).startOf('day').toISOString(); // Start of the day
        replacements.to = moment(toDateTime).endOf('day').toISOString();
      }
      // SQL query to count various types of washes for each customer
      const query = `
                    SELECT 
                              booking.customer_id, 
                              -- Count of paid washes ('Subscription' or 'Amount')
                              SUM(CASE 
                                  WHEN booking.wash_by IN ('Subscription', 'Amount') THEN 1 
                                  ELSE 0 
                              END) AS paidwash,
                              
                              -- Count of free washes ('free_wash')
                              SUM(CASE 
                                  WHEN booking.wash_by = 'free_wash' THEN 1 
                                  ELSE 0 
                              END) AS firstwash,
                              
                              -- Recurring washes: Count of customers who have more than 1 completed 'paid' wash
                               GREATEST(
                                  (SELECT COUNT(*) - 1
                                  FROM booking b2 
                                  WHERE b2.customer_id = booking.customer_id 
                                    AND b2.wash_by IN ('Subscription', 'Amount') 
                                    AND b2.booking_status = 'Completed'), 0
                              ) AS recurringwash

                          FROM 
                              booking
                          LEFT JOIN 
                              slot ON booking.slot_id::varchar = slot.slot_id::varchar

                          -- Apply the filtering conditions (date range, etc.)
                          ${whereCondition}

                          GROUP BY 
                              booking.customer_id;`;

      // Execute the query and retrieve booking data
      const bookingData = await db.sequelize.query(query, {
        replacements: replacements,
        type: db.sequelize.QueryTypes.SELECT,
      });

      // Initialize result object
      const result = {
        FIRST_WASH_BOOKED: 0,
        NEVER_BOOKED: 0,
        PAID_WASH_BOOKED: 0,
        RECURRING_WASH_BOOKED: 0,
        TOTAL_APP_DOWNLOADS: 0,
      };
      // Fetch count of customers who never booked any service
      result.NEVER_BOOKED = parseInt(
        await this.getNeverBookedCustomerCount(fromDateTime, toDateTime)
      );

      result.TOTAL_APP_DOWNLOADS = parseInt(
        await this.getDownloadCustomerCount(fromDateTime, toDateTime)
      );

      // Calculate totals based on booking data
      bookingData.forEach((bookingObj: any) => {
        result.FIRST_WASH_BOOKED += parseInt(bookingObj.firstwash);
        result.PAID_WASH_BOOKED += parseInt(bookingObj.paidwash);
        result.RECURRING_WASH_BOOKED += parseInt(bookingObj.recurringwash);

        // if (parseInt(bookingObj.paidwash) > 1)
        //   result.RECURRING_WASH_BOOKED += parseInt(bookingObj.paidwash);
      });
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Gets the count of customers who have never booked any service within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns The count of customers who have never booked a service.
   */
  async getNeverBookedCustomerCount(fromDateTime: any, toDateTime: any) {
    let replacements: any = {};
    let whereCondition: string = `WHERE booking.booking_id is null`; // Include booking_id condition here

    // Build the date condition only if both fromDateTime and toDateTime are provided
    if (fromDateTime && toDateTime) {
      whereCondition += ` AND customer."createdAt" >= :from AND customer."createdAt" <= :to`;
      replacements.from = moment(fromDateTime).startOf('day').toISOString(); // Start of the day
      replacements.to = moment(toDateTime).endOf('day').toISOString(); // End of the day
    }

    // SQL query to find the count of customers with no bookings
    const query = `SELECT 
                        COUNT(customer.customer_id) AS neverBooked
                    FROM 
                        customer
                    LEFT JOIN 
                        booking ON customer.customer_id::varchar = booking.customer_id::varchar
                    JOIN 
                        city ON customer.city_id::varchar = city.city_id::varchar
                    JOIN 
                        state ON customer.state_id::varchar = state.state_id::varchar
                    JOIN 
                        region ON state.region_id = region.region_id
                    ${whereCondition}`;

    // Execute the query and get the count of never-booked customers
    const neverBooked = await db.sequelize.query(query, {
      replacements: replacements, // Use the already populated replacements object
      type: db.sequelize.QueryTypes.SELECT,
    });

    return neverBooked[0]?.neverbooked;
  }

  /**
   * Gets the count of bookings for each vehicle type within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns An object with booking counts for each vehicle type and total counts.
   */
  async getVehicalTypeBookingCount(fromDateTime: any, toDateTime: any) {
    // SQL query to get the count of bookings by vehicle type
    const query = `SELECT count(*) as count, vehicle.vehicle_type, slot.start_date_time::date as date 
            FROM booking
            inner join wash_order 
            on booking.wash_order_id::varchar = wash_order.wash_order_id::varchar
            inner join vehicle
            on wash_order.vehicle_id = vehicle.vehicle_id
            left join slot
            on booking.slot_id::varchar = slot.slot_id::varchar
            where slot.start_date_time::date >= TO_DATE(:from, 'YYYY-MM-DD') and slot.start_date_time::date <= TO_DATE(:to, 'YYYY-MM-DD')
            AND booking.booking_status = 'Completed'
            Group By vehicle.vehicle_type, slot.start_date_time::date`;

    // Execute the query and retrieve vehicle type booking data
    const vehicalType: any = await db.sequelize.query(query, {
      replacements: { from: fromDateTime, to: toDateTime },
      type: db.sequelize.QueryTypes.SELECT,
    });

    const minDate = new Date(fromDateTime);
    const maxDate = new Date(toDateTime);

    // Generate a list of all dates in the range
    const allDates = await this.generateDateRange(
      minDate.toISOString().split('T')[0],
      maxDate.toISOString().split('T')[0]
    );

    // Initialize result object
    const result: any = {
      TWO_WHEELER: {},
      FOUR_WHEELER: {},
    };

    // Populate result with data from the query
    vehicalType.forEach((obj: any) => {
      if (
        obj.vehicle_type == VehicleType.TWO_WHEELER ||
        obj.vehicle_type == VehicleType.FOUR_WHEELER
      ) {
        const formattedDate =
          new Date(obj.date).toISOString().split('T')[0] + 'T00:00:00.000Z';
        if (!result[obj.vehicle_type]) result[obj.vehicle_type] = {};
        result[obj.vehicle_type][formattedDate] = parseInt(obj.count, 10);
      }
    });

    // Fill in missing dates with 0 count
    allDates.forEach((date) => {
      const fullDate = date + 'T00:00:00.000Z';
      if (!result.FOUR_WHEELER[fullDate]) result.FOUR_WHEELER[fullDate] = 0;
      if (!result.TWO_WHEELER[fullDate]) result.TWO_WHEELER[fullDate] = 0;
    });

    // Calculate total counts for each vehicle type
    const totalCounts: any = {
      FOUR_WHEELER: Object.values(result.FOUR_WHEELER).reduce(
        (sum: number, count: number) => sum + count,
        0
      ),
      TWO_WHEELER: Object.values(result.TWO_WHEELER).reduce(
        (sum: number, count: number) => sum + count,
        0
      ),
    };

    return { result, totalCounts };
  }

  /**
   * Generates a list of dates between the start and end dates (inclusive).
   * @param startDate - Start date (YYYY-MM-DD format)
   * @param endDate - End date (YYYY-MM-DD format)
   * @returns An array of dates in YYYY-MM-DD format.
   */
  async generateDateRange(startDate: any, endDate: any) {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  /**
   * Gets the count of subscriptions and details of each subscription within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns An object with counts for each subscription type and subscription details.
   */
  async subscriptionCount(fromDateTime: any, toDateTime: any) {
    try {
      // SQL query to get subscription counts
      const query = `SELECT 
                            subscription.subscription_name, -- Subscription name/type
                            cs.subscription_id,
                            cs."createdAt"::date AS subscription_date, -- Subscription creation date
                            COUNT(DISTINCT cs.customer_subscription_id) AS unique_subscriptions -- Count of unique subscriptions
                        FROM 
                            customer_subscription cs
                        INNER JOIN subscription
                            ON cs.subscription_id = subscription.subscription_id    
                        WHERE 
                            cs."createdAt" <= :to
                        GROUP BY 
                            subscription.subscription_name, 
                            cs.subscription_id,
                            cs."createdAt"::date -- Group by subscription type and date
                        ORDER BY 
                            subscription_date, 
                            subscription.subscription_name`;

      // Execute the query and retrieve subscription count data
      const subscriptionCountData = await db.sequelize.query(query, {
        replacements: { from: fromDateTime, to: toDateTime },
        type: db.sequelize.QueryTypes.SELECT,
      });

      // Store processed data by date
      const subscriptionByDate: any = {};

      // Transform the data into the desired format
      subscriptionCountData.forEach((item: any) => {
        const { subscription_name, subscription_date, unique_subscriptions } =
          item;

        const formattedDate = new Date(subscription_date)
          .toISOString()
          .split('T')[0]; // Extract only the date part

        if (!subscriptionByDate[formattedDate]) {
          subscriptionByDate[formattedDate] = {
            totalCount: 0,
            subscription: {},
          };
        }

        // Increment subscription count for each date
        subscriptionByDate[formattedDate].totalCount += parseInt(
          unique_subscriptions,
          10
        );
        subscriptionByDate[formattedDate].subscription[subscription_name] =
          (subscriptionByDate[formattedDate].subscription[subscription_name] ||
            0) + parseInt(unique_subscriptions, 10);
      });

      // Handling missing dates and copying previous day's data
      let currentDate = moment(
        subscriptionCountData[0].subscription_date
      ).startOf('day');
      const endDate = moment(toDateTime).endOf('day');
      let lastAvailableDate: string | null = null;

      while (currentDate <= endDate) {
        const currentDateStr = currentDate.format('YYYY-MM-DD');

        if (subscriptionByDate[currentDateStr]) {
          if (lastAvailableDate) {
            // Add missing services from the previous day's data to the current day
            const previousDaySubscriptions =
              subscriptionByDate[lastAvailableDate].subscription;

            Object.keys(previousDaySubscriptions).forEach((service) => {
              // If no data found for a service, copy the previous day's data
              if (!subscriptionByDate[currentDateStr].subscription[service]) {
                subscriptionByDate[currentDateStr].subscription[service] =
                  previousDaySubscriptions[service];
                subscriptionByDate[currentDateStr].totalCount +=
                  previousDaySubscriptions[service];
              } else {
                // If data exists, add the current day's count to the previous day's count
                subscriptionByDate[currentDateStr].subscription[service] +=
                  previousDaySubscriptions[service];
                subscriptionByDate[currentDateStr].totalCount +=
                  previousDaySubscriptions[service];
              }
            });
          }
          lastAvailableDate = currentDateStr; // Update the last available date with data
        } else if (lastAvailableDate) {
          // If no data exists for the current date, copy from last available date
          subscriptionByDate[currentDateStr] = {
            totalCount: subscriptionByDate[lastAvailableDate].totalCount, // Copy total count
            subscription: {
              ...subscriptionByDate[lastAvailableDate].subscription,
            }, // Copy subscriptions
          };
        }

        // Move to the next day
        currentDate = currentDate.add(1, 'days');
      }

      // Sort dates in ascending order and prepare final output
      const sortedDates = Object.keys(subscriptionByDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      const subscriptionsArray = sortedDates.map((date) => ({
        [date]: subscriptionByDate[date],
      }));

      const startDateTime = moment(fromDateTime).startOf('day'); // The earliest date (start of range)

      // Filter data to include only items within the date range
      const filteredData = subscriptionsArray.filter((item) => {
        const dateKey = Object.keys(item)[0]; // Extract the date key
        const currentDate = moment(dateKey); // Convert dateKey string to Moment object

        // Compare dates as Moment.js objects
        return currentDate.isBetween(startDateTime, endDate, undefined, '[]'); // inclusive range
      });

      // Return the sorted result
      return filteredData;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Gets the count and total price of additional services within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns An object with counts and total prices for additional services.
   */
  async additionalServiceCount(fromDateTime: any, toDateTime: any) {
    fromDateTime = moment(fromDateTime).startOf('day').toISOString();
    toDateTime = moment(toDateTime).endOf('day').toISOString();
    // SQL query to get counts and total prices of additional services
    const additionalServiceData = await BookingAdditionalService.findAll({
      attributes: [
        'additionalServiceId',
        'additional_service_name',
        db.sequelize.fn('COUNT', db.sequelize.col('*')),
        db.sequelize.fn('SUM', db.sequelize.col('price')),
      ],
      where: {
        createdAt: {
          [Op.gte]: fromDateTime,
          [Op.lte]: toDateTime,
        },
      },
      group: ['additional_service_name', 'additionalServiceId'],
      raw: true,
    });

    // Process and return the result
    return additionalServiceData;
  }

  /**
   * Retrieves the count of service centers by location.
   *
   * @param location - The city ID to filter the results by. If 'all', returns counts for all active service centers.
   * @returns An array of objects where each object contains the city ID, city name, and count of service centers in that city.
   */
  async serviceCenterLocationCount(location: any = 'all') {
    // Initialize SQL condition for filtering by city
    let cityWhere = ``;

    // If location is not 'all', add a condition to filter by city ID
    if (location != 'all') cityWhere = `AND city.city_id IN (:city)`;

    // SQL query to get the count of active service centers grouped by city
    const query = `SELECT 
                      city.city_id, 
                      city.name AS city_name, 
                      state.state_id, 
                      state.name AS state_name, 
                      region.region_id, 
                      region.name AS region_name, 
                      COUNT(*) AS machine_count
                  FROM 
                      merchant
                  INNER JOIN 
                      city ON merchant.city_id::varchar = city.city_id::varchar
                  INNER JOIN 
                      state ON city.state_id::varchar = state.state_id::varchar
                  INNER JOIN 
                      region ON state.region_id::varchar = region.region_id::varchar
                  WHERE 
                      merchant.is_active = true 
                      AND merchant.deleted_at IS NULL
                       ${cityWhere}  -- Include the city filter here
                  GROUP BY 
                      city.city_id, city.name, 
                      state.state_id, state.name, 
                      region.region_id, region.name
                  ORDER BY 
                      machine_count DESC
                        `;

    // Execute the query with replacements for city ID if applicable
    const serviceCenterLocation = await db.sequelize.query(query, {
      replacements: location !== 'all' ? { city: location.split(',') } : {},
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Return the result which contains the count of service centers by city
    return serviceCenterLocation;
  }

  /**
   * Gets the count and total price of additional services within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns An object with counts and total prices for additional services.
   */
  async customerBookingList(data: any) {
    let {
      search,
      region,
      city,
      state,
      vehicleType,
      washType,
      startDate,
      endDate,
      offset,
      limit,
    } = data;

    const { _limit, _offset } = paginatorParamFormat(limit, offset);

    let whereCondition = `WHERE booking.booking_status = 'Completed'`;
    let replacementObj: any = {
      limit: _limit,
      offset: _offset,
    };

    if (startDate && endDate) {
      whereCondition += ` AND slot.start_date_time::date >= TO_DATE(:from, 'YYYY-MM-DD') 
            AND slot.start_date_time::date <= TO_DATE(:to, 'YYYY-MM-DD')`;
      replacementObj.from = startDate;
      replacementObj.to = endDate;
    }

    if (region) {
      whereCondition += ` AND region.region_id IN (:region)`;
      replacementObj.region = region.split(',');
    }

    if (state) {
      whereCondition += ` AND state.state_id IN (:state)`;
      replacementObj.state = state.split(',');
    }

    if (city) {
      whereCondition += ` AND city.city_id IN (:city)`;
      replacementObj.city = city.split(',');
    }

    if (vehicleType) {
      whereCondition += ` AND vehicle.vehicle_type IN (:vehicleType)`;
      replacementObj.vehicleType = vehicleType.split(',');
    }

    if (washType) {
      whereCondition += ` AND wash_types."Guid" IN (:washType)`;
      replacementObj.washType = washType.split(',');
    }

    if (search) {
      whereCondition += ` AND (
                CONCAT(LOWER(customer.first_name), ' ', LOWER(customer.last_name)) LIKE LOWER(:search)
                OR LOWER(customer.first_name) LIKE LOWER(:search)
                OR LOWER(customer.last_name) LIKE LOWER(:search)
                OR LOWER(merchant."outletName") LIKE LOWER(:search)
                OR LOWER(city.name) LIKE LOWER(:search)
                OR LOWER(state.name) LIKE LOWER(:search)
                OR LOWER(region.name) LIKE LOWER(:search)
                OR LOWER(vehicle.vehicle_type) LIKE LOWER(:search)
                OR LOWER(wash_types."Name") LIKE LOWER(:search)
            )`;
      replacementObj.search = `%${search.toLowerCase()}%`;
    }

    // SQL query to get counts and total prices of additional services
    const query = `SELECT DISTINCT ON (booking.booking_id) 
                    customer.first_name, 
                    customer.last_name, 
                    merchant."outletName", 
                    city.name AS city_name, 
                    state.name AS state_name, 
                    region.name AS region_name, 
                    vehicle.vehicle_type, 
                    slot.start_date_time, 
                    wash_types."Name" AS wash_type_name
                FROM booking
                -- Join on customer since booking must always have a customer
                JOIN customer 
                    ON booking.customer_id::varchar = customer.customer_id::varchar
                -- Inner join on merchant, city, state, and region to provide location details
                INNER JOIN merchant 
                    ON booking.merchant_id::varchar = merchant.merchant_id::varchar
                INNER JOIN city 
                    ON merchant.city_id::varchar = city.city_id::varchar
                INNER JOIN state 
                    ON city.state_id::varchar = state.state_id::varchar
                INNER JOIN region 
                    ON state.region_id::varchar = region.region_id::varchar
                -- Inner join on wash_order, vehicle, and wash_types as these are mandatory for a wash booking
                INNER JOIN wash_order 
                    ON booking.wash_order_id::varchar = wash_order.wash_order_id::varchar
                INNER JOIN vehicle 
                    ON wash_order.vehicle_id = vehicle.vehicle_id
                INNER JOIN wash_types 
                    ON wash_order.wash_type_id::varchar = wash_types."Guid"::varchar
                -- Inner join slot since every booking should have a time slot
                INNER JOIN slot 
                    ON booking.slot_id::varchar = slot.slot_id::varchar


                ${whereCondition}
               `;

    const bookingCount = await db.sequelize.query(query, {
      replacements: replacementObj,
      type: db.sequelize.QueryTypes.SELECT,
    });

    const limitQuery = ` limit :limit offset :offset`;

    // Execute the query
    const bookingData = await db.sequelize.query(`${query} ${limitQuery}`, {
      replacements: replacementObj,
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Sort by start_date_time in descending order
    bookingData.sort((a: any, b: any) => {
      return (
        new Date(b.start_date_time).getTime() -
        new Date(a.start_date_time).getTime()
      );
    });

    // Process and return the result
    return { bookingData, total: bookingCount.length };
  }

  /**
   * Gets the count and total price of additional services within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns An object with counts and total prices for additional services.
   */
  async additionalServiceDetails(data: any) {
    let {
      basId,
      search,
      region,
      city,
      state,
      startDate,
      endDate,
      offset,
      limit,
    } = data;

    const { _limit, _offset } = paginatorParamFormat(limit, offset);

    let whereCondition = `WHERE bas.additional_service_id='${basId}'`;
    let replacementObj: any = {
      limit: _limit,
      offset: _offset,
    };

    if (startDate && endDate) {
      startDate = moment(startDate).startOf('day').toISOString();
      endDate = moment(endDate).endOf('day').toISOString();
      whereCondition += ` AND bas."createdAt" >=:from
        AND bas."createdAt" <=:to`;

      replacementObj.from = startDate;
      replacementObj.to = endDate;
    }

    if (region) {
      whereCondition += ` AND region.region_id IN (:region)`;
      replacementObj.region = region.split(',');
    }

    if (state) {
      whereCondition += ` AND state.state_id IN (:state)`;
      replacementObj.state = state.split(',');
    }

    if (city) {
      whereCondition += ` AND city.city_id IN (:city)`;
      replacementObj.city = city.split(',');
    }

    if (search) {
      whereCondition += ` AND (
                LOWER(merchant."outletName") LIKE LOWER(:search)
                OR LOWER(city.name) LIKE LOWER(:search)
                OR LOWER(state.name) LIKE LOWER(:search)
                OR LOWER(region.name) LIKE LOWER(:search)
            )`;
      replacementObj.search = `%${search.toLowerCase()}%`;
    }

    // SQL query to get counts and total prices of additional services
    const query = `SELECT count(bas.price),sum(bas.price),bas.additional_service_id,city.name as city_name,state.name as state_name,region.name as region_name,merchant."outletName"
                        FROM public.booking_additional_service as bas 
                        join booking using(booking_id)
                        JOIN merchant ON booking.merchant_id=merchant.merchant_id 
                        JOIN city on city.city_id=merchant.city_id
                        JOIN "state" on state.state_id=city.state_id
                        JOIN region ON region.region_id=state.region_id
                     	 ${whereCondition}
                        GROUP BY merchant.city_id,merchant.merchant_id,city.name,state.name,region.name,merchant."outletName",bas.additional_service_id`;

    const bookingCount = await db.sequelize.query(query, {
      replacements: replacementObj,
      type: db.sequelize.QueryTypes.SELECT,
    });

    const limitQuery = ` limit :limit offset :offset`;

    // Execute the query
    const additionalService = await db.sequelize.query(
      `${query} ${limitQuery}`,
      {
        replacements: replacementObj,
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    // Process and return the result
    return { additionalService, total: bookingCount.length };
  }

  async totalVehicleCountAndWashType() {
    try {
      // SQL query to get subscription counts
      const query = `SELECT count(*) as count, vehicle.vehicle_type,wash_types."Name"
            FROM booking
            inner join wash_order 
            on booking.wash_order_id::varchar = wash_order.wash_order_id::varchar
            inner join vehicle
            on wash_order.vehicle_id = vehicle.vehicle_id
			inner join wash_types
            on wash_order.wash_type_id = wash_types."Guid"
            left join slot
            on booking.slot_id::varchar = slot.slot_id::varchar
            where  booking.booking_status = 'Completed'
            Group By vehicle.vehicle_type,wash_types."Name"`;

      // Execute the query and retrieve subscription count data
      const subscriptionCountData = await db.sequelize.query(query, {
        type: db.sequelize.QueryTypes.SELECT,
      });

      // Initialize the result structure with the necessary fields
      const result = {
        total: {
          totalWash: 0,
          silver: 0,
          gold: 0,
          platinum: 0,
        },
        twoWheeler: {
          totalWash: 0,
          silver: 0,
          gold: 0,
          platinum: 0,
        },
        fourWheeler: {
          totalWash: 0,
          silver: 0,
          gold: 0,
          platinum: 0,
        },
      };
      // Define a type for wash types
      type WashType = 'silver' | 'gold' | 'platinum';

      /// Iterate through each item in the array and calculate totals
      subscriptionCountData.forEach((item: any) => {
        const { count, vehicle_type, Name } = item;
        const washCount = parseInt(count); // Convert count to an integer

        // Convert wash type to lowercase and assert that it's one of the valid wash types
        const washType = Name.toLowerCase() as WashType;

        // Update total washes
        result.total.totalWash += washCount;

        // Update total based on wash type (Silver, Gold, Platinum)
        if (washType in result.total) {
          result.total[washType] += washCount;
        }

        // Update based on vehicle type and wash type
        if (vehicle_type === 'TWO_WHEELER') {
          if (washType in result.twoWheeler) {
            result.twoWheeler[washType] += washCount;
          }
          result.twoWheeler.totalWash += washCount; // Update totalWash for two-wheelers
        } else if (vehicle_type === 'FOUR_WHEELER') {
          if (washType in result.fourWheeler) {
            result.fourWheeler[washType] += washCount;
          }
          result.fourWheeler.totalWash += washCount; // Update totalWash for four-wheelers
        }
      });

      return result;
    } catch (err) {
      return Promise.reject(err); // Reject the promise with an error
    }
  }

  async totalAppDownloads(data: any) {
    let { search, region, city, state, offset, limit, startDate, endDate } =
      data;

    const { _limit, _offset } = paginatorParamFormat(limit, offset);

    let replacementObj: any = {};

    let conditions: any = [];
    let conditionTwo: any = [];
    let conditionThree: any = [];
    let finalWhereCondition = ``;

    if (startDate && endDate) {
      startDate = moment.utc(startDate).startOf('day').toISOString();
      endDate = moment.utc(endDate).endOf('day').toISOString();

      conditions.push(`cs."createdAt" >= :from AND cs."createdAt" <= :to`);
      conditionTwo.push(
        ` slot.start_date_time::date >= :from 
                          AND slot.start_date_time::date <= :to`
      );
      conditionThree.push(
        `customer."createdAt" >= :from AND customer."createdAt" <= :to`
      );
      replacementObj.from = startDate;
      replacementObj.to = endDate;

      finalWhereCondition = `
    WHERE COALESCE(PW."createdAt", CC."createdAt", NB."createdAt") >= :from
    AND COALESCE(PW."createdAt", CC."createdAt", NB."createdAt") <= :to
  `;
    }

    if (region) {
      conditions.push(`region.region_id IN (:region)`);
      conditionTwo.push(`region.region_id IN (:region)`);
      conditionThree.push(`region.region_id IN (:region)`);
      replacementObj.region = region.split(',');
    }

    if (state) {
      conditions.push(`state.state_id IN (:state)`);
      conditionTwo.push(`state.state_id IN (:state)`);
      conditionThree.push(`state.state_id IN (:state)`);
      replacementObj.state = state.split(',');
    }

    if (city) {
      conditions.push(`cs.city_id IN (:city)`);
      conditionTwo.push(`customer.city_id IN (:city)`);
      conditionThree.push(`customer.city_id IN (:city)`);
      replacementObj.city = city.split(',');
    }

    if (search) {
      conditions.push(`(
          LOWER(cs.city) LIKE :search
          OR LOWER(cs.state) LIKE :search
          OR LOWER(region.name) LIKE :search
        )`);

      conditionTwo.push(`(
              LOWER(customer.city) LIKE :search
              OR LOWER(customer.state) LIKE :search
              OR LOWER(region.name) LIKE :search
            )`);

      conditionThree.push(`(
              LOWER(city.name) LIKE :search
              OR LOWER(state.name) LIKE :search
              OR LOWER(region.name) LIKE :search
            )`);
      replacementObj.search = `%${search.toLowerCase()}%`;
    }

    const whereCondition =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const anotherCondition =
      conditionTwo.length > 0 ? `AND ${conditionTwo.join(' AND ')}` : '';

    const anotherConditionOne =
      conditionThree.length > 0 ? `AND ${conditionThree.join(' AND ')}` : '';

    // SQL query to get counts and total prices of additional services
    const query = `WITH PaidWashData AS (
    SELECT 
        customer.city_id,
        customer.state_id,
        region.region_id,
        customer.city,
        customer.state,
        region.name,
        customer."createdAt"::date AS "createdAt",

        -- Count of paid washes ('Subscription' or 'Amount')
        SUM(CASE 
            WHEN booking.wash_by IN ('Subscription', 'Amount') THEN 1 
            ELSE 0 
        END) AS paidwash,

        -- Count of free washes ('free_wash')
        SUM(CASE 
            WHEN booking.wash_by = 'free_wash' THEN 1 
            ELSE 0 
        END) AS firstwash,

        -- Recurring washes: Count of customers who have more than 1 completed 'paid' wash
        SUM(CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM booking b2 
                WHERE b2.customer_id = booking.customer_id 
                AND b2.wash_by IN ('Subscription', 'Amount') 
                AND b2.booking_status = 'Completed'
            ) > 1 
            THEN 1 ELSE 0 END) AS recurringWash
    FROM 
        booking
    LEFT JOIN 
        customer ON booking.customer_id::varchar = customer.customer_id::varchar
     LEFT JOIN 
        slot ON booking.slot_id::varchar = slot.slot_id::varchar    
    JOIN 
        state ON customer.state_id::varchar = state.state_id::varchar
    JOIN 
        region ON state.region_id = region.region_id
    WHERE 
        booking.booking_status = 'Completed'
        AND booking.wash_by IN ('Subscription', 'Amount', 'free_wash')
        ${anotherCondition}
    GROUP BY 
        customer.city_id, 
        customer.state_id, 
        region.region_id, 
        customer.city, 
        customer.state, 
        region.name,
        customer."createdAt"::date
),
CustomerCountData AS (
    SELECT 
        cs.city_id, 
        cs.state_id, 
        region.region_id, 
        cs.city, 
        cs.state, 
        region.name, 
        cs."createdAt"::date AS "createdAt",
        COUNT(cs.customer_id) AS customer_count -- Count of customers per group
    FROM 
        customer AS cs
    JOIN 
        state ON cs.state_id::varchar = state.state_id::varchar
    JOIN 
        region ON state.region_id = region.region_id
    ${whereCondition}   
    GROUP BY 
        cs.city_id, 
        cs.state_id, 
        region.region_id, 
        cs.city, 
        cs.state, 
        region.name,
        cs."createdAt"::date
),
NeverBookedData AS (
    SELECT 
        COUNT(customer.customer_id) AS neverBooked,
        customer.city_id,
        city.name AS city_name,
        customer.state_id,
        state.name AS state_name,
        region.region_id,
        region.name AS region_name,
        customer."createdAt"::date AS "createdAt"
    FROM 
        customer
    LEFT JOIN 
        booking ON customer.customer_id::varchar = booking.customer_id::varchar
    JOIN 
        city ON customer.city_id::varchar = city.city_id::varchar
    JOIN 
        state ON customer.state_id::varchar = state.state_id::varchar
    JOIN 
        region ON state.region_id = region.region_id
    WHERE 
        booking.booking_id IS NULL
        ${anotherConditionOne}
    GROUP BY 
        customer.city_id, 
        city.name, 
        customer.state_id, 
        state.name, 
        region.region_id, 
        region.name,
        customer."createdAt"::date
)
-- Final combined result
SELECT
    COALESCE(PW.city_id, CC.city_id, NB.city_id) AS city_id,
    COALESCE(PW.state_id, CC.state_id, NB.state_id) AS state_id,
    COALESCE(PW.region_id, CC.region_id, NB.region_id) AS region_id,
    COALESCE(PW.city, CC.city, NB.city_name) AS city,
    COALESCE(PW.state, CC.state, NB.state_name) AS state,
    COALESCE(PW.name, CC.name, NB.region_name) AS region_name,
    COALESCE(PW."createdAt", CC."createdAt", NB."createdAt") AS "createdAt",
    COALESCE(SUM(PW.paidwash), 0) AS paidwash,
    COALESCE(SUM(PW.firstwash), 0) AS firstwash,
    COALESCE(SUM(PW.recurringWash), 0) AS recurringWash,
    COALESCE(SUM(CC.customer_count), 0) AS customer_count,
    COALESCE(SUM(NB.neverBooked), 0) AS neverBooked
FROM PaidWashData PW
FULL JOIN CustomerCountData CC 
    ON PW.city_id = CC.city_id 
    AND PW.state_id = CC.state_id 
    AND PW.region_id = CC.region_id
    AND PW."createdAt" = CC."createdAt"
FULL JOIN NeverBookedData NB 
    ON PW.city_id = NB.city_id 
    AND PW.state_id = NB.state_id 
    AND PW.region_id = NB.region_id
    AND PW."createdAt" = NB."createdAt"
    ${finalWhereCondition}
GROUP BY
    COALESCE(PW.city_id, CC.city_id, NB.city_id),
    COALESCE(PW.state_id, CC.state_id, NB.state_id),
    COALESCE(PW.region_id, CC.region_id, NB.region_id),
    COALESCE(PW.city, CC.city, NB.city_name),
    COALESCE(PW.state, CC.state, NB.state_name),
    COALESCE(PW.name, CC.name, NB.region_name),
    COALESCE(PW."createdAt", CC."createdAt", NB."createdAt")
ORDER BY
    COALESCE(PW."createdAt", CC."createdAt", NB."createdAt") DESC

  `;

    const bookingCount = await db.sequelize.query(query, {
      replacements: replacementObj,
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Add the limit and offset to the replacements object
    replacementObj.limit = _limit;
    replacementObj.offset = _offset;

    // Create the limit query dynamically
    const limitQuery = `LIMIT :limit OFFSET :offset`;

    // Execute the query with limit and offset
    const appDownloads = await db.sequelize.query(`${query} ${limitQuery}`, {
      replacements: replacementObj,
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Process and return the result
    return { appDownloads, count: bookingCount.length };
  }

  /**
   * Gets the count of customers who have never booked any service within the specified date range.
   * @param fromDateTime - Start date for the query range (YYYY-MM-DD format)
   * @param toDateTime - End date for the query range (YYYY-MM-DD format)
   * @returns The count of customers who have never booked a service.
   */
  async getDownloadCustomerCount(fromDateTime: any, toDateTime: any) {
    let replacements: any = {};
    let whereCondition: string = ``; // Include booking_id condition here

    // Build the date condition only if both fromDateTime and toDateTime are provided
    if (fromDateTime && toDateTime) {
      whereCondition += `WHERE cs."createdAt" >= :from AND cs."createdAt" <= :to`;
      replacements.from = moment(fromDateTime).startOf('day').toISOString(); // Start of the day
      replacements.to = moment(toDateTime).endOf('day').toISOString(); // End of the day
    }

    // SQL query to find the count of customers with no bookings
    const query = `SELECT 
                  cs.city_id, 
                  cs.state_id, 
                  region.region_id, 
                  cs.city, 
                  cs.state, 
                  region.name, 
                  cs."createdAt"::date AS "createdAt",
                  COUNT(cs.customer_id) AS customer_count -- Count of customers per group
              FROM 
                  customer AS cs
              JOIN 
                  state ON cs.state_id::varchar = state.state_id::varchar
              JOIN 
                  region ON state.region_id = region.region_id
              ${whereCondition}   
              GROUP BY 
                  cs.city_id, 
                  cs.state_id, 
                  region.region_id, 
                  cs.city, 
                  cs.state, 
                  region.name,
                  cs."createdAt"::date
        `;

    // Execute the query and get the count of never-booked customers
    const customerData = await db.sequelize.query(query, {
      replacements: replacements, // Use the already populated replacements object
      type: db.sequelize.QueryTypes.SELECT,
    });

    if (customerData.length === 0) {
      return 0;
    }

    return customerData.reduce(
      (sum: any, item: any) => sum + parseInt(item.customer_count, 10),
      0
    );
  }
}

// Create an instance of the service class and export it
const AnalyticsService = new AnalyticsServices();
export { AnalyticsService };
