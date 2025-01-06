import { WashOrder } from '../../../B2C/models/wash_order';
import { Slot } from '../../../B2C/models/slot';
import { Booking, Status, WashBy } from '../../../B2C/models/booking';
import { BookingAdditionalService } from '../../../B2C/models/booking_additional_service';
import { Merchant } from '../../../B2C/models/merchant';
import { Op } from 'sequelize';
import { Vehicle, VehicleType } from '../../models/vehicle';
import { WashType } from '../../../models/wash_type';
import { UserWallet } from '../../models/user_wallet';
import {
  TransactionType,
  WalletTransaction,
} from '../../models/wallet_transection';
import { WalletService } from '../../walletModule/services/wallet.service';
import {
  getCancellationFeePercentage,
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import {
  fourDigitOtpGenerator,
  isNullOrUndefined,
  separateDateAndTime,
} from '../../../common/utility';
import { Referral } from '../../models/reffer';
import { MerchantPricingTerm } from '../../models/merchant_pricing_term';
import moment from 'moment-timezone'; // Import moment library for date/time manipulation
import { Customer } from '../../models/customer';
import { CustomerNotification } from '../../models/customerNotification';
import { CustomerDeviceToken } from '../../models/customerDeviceToken';
import {
  sendFirebaseNotification,
  sendFirebaseNotificationWithData,
} from '../../../services/common/firebaseService/firebaseNotification';
import { WashWalletService } from '../../washWalletModule/services/wallet.service';
import { WashWalletTransaction } from '../../models/wash_wallet_transaction';
import { WashTypeConstant } from '../../models/wash_wallet_transaction';
import { UserWashWallet } from '../../models/user_wash_wallet';
import { Coupon } from '../../models/coupon';
import db from '../../../models';
import { CustomerSubscription } from '../../models/customer_subscription';
import { config } from '../../../config/config';
import { ReferAndEarn } from '../../models/refer_earn_setting';
import { Machine } from '../../../models/Machine/Machine';
import { generateAndCustomerMemoPdf } from '../../../services/htmlToPdf';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { sendSMSMessage } from '../../../services/common/smsService';

class BookingServices {
  // Adding
  async addSlot(
    merchantId: string,
    startDateTime: Date,
    endDateTime: Date,
    transaction: any
  ) {
    try {
      // Attempt to create a new Slot record in the database with the provided details
      return await Slot.create(
        {
          merchantId: merchantId,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        },
        { transaction }
      );
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  // Adding
  async addWash(
    merchantId: string,
    washTypeId: string,
    slotId: string,
    vehicleId: string,
    waterSaved: number,
    washPoints: number,
    status: string,
    remarks: string,
    customerId: string,
    transaction: any
  ) {
    try {
      // Finding the pricing data
      const pricingData = await MerchantPricingTerm.findOne({
        where: {
          merchantId: merchantId,
          washTypeId: washTypeId,
        },
      });

      // Attempt to create a new Wash order record in the database with the provided details
      return await WashOrder.create(
        {
          merchantId: merchantId,
          washTypeId: washTypeId,
          slotId: slotId,
          vehicleId: vehicleId,
          waterSaved: waterSaved,
          washPoints: washPoints,
          status: status,
          remarks: remarks,
          customerId: customerId,
          washPrice: pricingData?.dataValues?.grossAmount,
          manPowerPrice: pricingData?.dataValues?.manPowerPrice,
          cgstPercentage: pricingData?.dataValues?.cgstPercentage,
          sgstPercentage: pricingData?.dataValues?.sgstPercentage,
        },
        { transaction }
      );
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async addBooking(
    slotId: string,
    merchantId: string,
    washOrderId: string,
    customerId: string,
    locked: boolean,
    transaction: any
  ) {
    try {
      // Attempt to create a new Booking record in the database with the provided details
      return await Booking.create(
        {
          merchantId: merchantId,
          washOrderId: washOrderId,
          slotId: slotId,
          customerId: customerId,
          locked: locked,
          //SkuNumber: 1,
        },
        { transaction }
      );
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async addBookingAdditionalServices(
    additionalServices: [],
    bookingId: string,
    merchantId: string,
    transaction: any
  ) {
    try {
      // Check if additionalServices is provided and is a non-empty array
      if (additionalServices && additionalServices.length) {
        // Map each element in additionalServices to a new object with necessary fields
        const docs = additionalServices.map((el: any) => {
          return {
            additionalServiceId: el.additionalServiceId,
            additionalServiceName: el.name,
            price: el.price,
            bookingId: bookingId,
            merchantId: merchantId,
          };
        });

        // Use bulkCreate to insert all the additional service records at once
        await BookingAdditionalService.bulkCreate(docs, { transaction });
      }

      // Return from the function if everything is successful
      return;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getCustomerBookingDetails(customerId: string, status: string) {
    try {
      // Determine the current date and time in ISO format
      const now = new Date().toISOString();

      let whereCondition: any = {
        customerId: customerId,
        paymentStatus: Status.Completed,
      };

      if (status === Status.Completed) {
        whereCondition['bookingStatus'] = {
          [Op.or]: [
            { [Op.eq]: Status.Cancelled },
            { [Op.eq]: Status.Completed },
          ],
        };
      } else if (status === Status.Upcoming) {
        whereCondition['bookingStatus'] = {
          [Op.or]: [{ [Op.eq]: Status.Confirmed }, { [Op.eq]: Status.Started }],
        };
      }

      // Fetch booking details based on the customerId and slot condition
      let bookingDetails = await Booking.findAll({
        where: whereCondition,
        include: [
          {
            model: Slot,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
          {
            model: WashOrder,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                model: Vehicle,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
              {
                model: WashType,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
            ],
          },
          {
            model: Merchant,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Declaring the empty array to hold the modified booking details
      let newBookingDetailsArray: any = [];

      // Loop through each booking detail retrieved from the database
      for (let i in bookingDetails) {
        let bookingDetailsObject: any;

        // Retrieve the additional service details for the current booking
        let additionalServiceDetails = await BookingAdditionalService.findAll({
          where: {
            bookingId: bookingDetails[i].bookingId,
          },
        });

        // Create a new copy of the booking details object
        bookingDetailsObject = {
          ...bookingDetails[i].dataValues, // Spread operator to copy the original object's properties
          additionalService: additionalServiceDetails, // Add the additional service details to the new object
        };

        // Push the new booking details object with additional service details into the array
        newBookingDetailsArray.push(bookingDetailsObject);
      }

      // Return the array with all booking details including additional services
      return newBookingDetailsArray;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async bookingPayment(body: any) {
    try {
      const {
        paymentAmount,
        couponId,
        couponCode,
        couponAmount,
        loggedInUser,
        bookingId,
      } = body;

      // Getting the user wallet data
      const beforeDeductionWallet = await WalletService.getUserWallet(
        loggedInUser.userId
      );
      // Getting the user wash wallet data
      const beforeDeductionWashWallet =
        await WashWalletService.getUserWashWallet(loggedInUser.userId);

      // Decrementing the balance in the user's wallet
      await UserWallet.decrement(
        { balance: paymentAmount }, // `balance` here is the amount to be subtracted from the existing balance
        {
          where: {
            customerId: loggedInUser.userId, // Condition to match the user by their customerId
          },
        }
      );

      // Getting the user wallet data
      const afterDeductionWallet = await WalletService.getUserWallet(
        loggedInUser.userId
      );

      // Making the object to save
      let obj: any = {
        previousBalance: {
          wallet: {
            amount: beforeDeductionWallet.balance,
          },
          washWallet: {
            silver: beforeDeductionWashWallet.silverWash,
            gold: beforeDeductionWashWallet.goldWash,
            platinum: beforeDeductionWashWallet.platinumWash,
            silverWashFourWheeler:
              beforeDeductionWashWallet.silverWashFourWheeler,
            goldWashFourWheeler: beforeDeductionWashWallet.goldWash,
            platinumWashFourWheeler:
              beforeDeductionWashWallet.platinumWashFourWheeler,
          },
        },
        currentBalance: {
          wallet: {
            amount: afterDeductionWallet.balance,
          },
          washWallet: {
            silver: beforeDeductionWashWallet.silverWash,
            gold: beforeDeductionWashWallet.goldWash,
            platinum: beforeDeductionWashWallet.platinumWash,
            silverWashFourWheeler:
              beforeDeductionWashWallet.silverWashFourWheeler,
            goldWashFourWheeler: beforeDeductionWashWallet.goldWash,
            platinumWashFourWheeler:
              beforeDeductionWashWallet.platinumWashFourWheeler,
          },
        },
      };

      // Updating the booking details
      await Booking.update(
        {
          paymentAmount: paymentAmount,
          couponId: couponId,
          couponCode: couponCode,
          washBy: WashBy.Amount,
          paymentStatus: Status.Completed,
          couponAmount: couponAmount,
          oneTimePassword: fourDigitOtpGenerator(),
          bookingStatus: Status.Confirmed,
          washWalletBalance: obj,
        },
        {
          where: {
            bookingId: bookingId, // Condition to match the booking by its bookingId
          },
        }
      );

      let waterSaved: number = 0;

      // Getting the vehicle type
      let vehicleDetails: any = await this.getVehicleDetailsOfBooking(
        bookingId
      );

      console.log(
        '🚀 ~ BookingServices ~ bookingPayment ~ vehicleDetails?.washOrder?.vehicle?.vehicleType:',
        vehicleDetails?.washOrder?.vehicle?.vehicleType
      );

      if (
        vehicleDetails?.washOrder?.vehicle?.vehicleType ==
        VehicleType.FOUR_WHEELER
      ) {
        waterSaved = config.waterSavedPerWashForFourWheeler;
      } else {
        waterSaved = config.waterSavedPerWashForTwoWheeler;
      }

      console.log(
        '🚀 ~ BookingServices ~ bookingPayment ~ waterSaved:',
        waterSaved
      );

      // Update customer water saved Value (Will delete in future)
      await Customer.increment(
        {
          totalWaterSaved: waterSaved,
        },
        {
          where: {
            customerId: loggedInUser.userId,
          },
        }
      );

      // Getting the user wallet data
      const walletData = await WalletService.getUserWallet(loggedInUser.userId);

      // Making the transaction History
      await WalletTransaction.create({
        walletId: walletData.walletId,
        amount: paymentAmount,
        type: TransactionType.DEBIT,
        bookingId: bookingId,
        transactionType: TransactionType.BOOKING,
      });

      let description = 'Your booking has been confirmed';
      let title = 'Booking Confirmed';
      // Creating the notification for customer
      await CustomerNotification.create({
        customerId: loggedInUser.userId,
        description: description,
        title: title,
      });

      // Getting the device token of one customer
      const deviceTokens: any = await this.getCustomerDeviceToken(
        loggedInUser.userId
      );

      // Making the notification data
      let notificationData: any = {
        type: 'Booking Confirmed',
        id: bookingId,
      };

      if (deviceTokens.length) {
        sendFirebaseNotificationWithData(
          deviceTokens,
          title,
          description,
          notificationData
        );
      }

      // Sending the text message to customer
      await this.sendTextMessage(
        bookingId,
        loggedInUser.userId,
        Status.Confirmed
      );

      return;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async cancelBooking(body: any, booking: any) {
    try {
      const { bookingId, loggedInUser } = body;

      // Assuming booking has properties: createdAt, amount
      const { createdAt, paymentAmount, washBy } = booking;

      let feeAmount = 0;
      let amountToAddToWallet = 0;

      if (paymentAmount && paymentAmount > 0) {
        const currentTime = new Date();
        const elapsedMinutes = Math.floor(
          (currentTime.getTime() - new Date(createdAt).getTime()) / 60000
        );

        // Calculate the cancellation fee
        const feePercentage = getCancellationFeePercentage(elapsedMinutes);
        feeAmount = (paymentAmount * feePercentage) / 100;
        amountToAddToWallet = paymentAmount - feeAmount;

        // Incrementing the balance in the user's wallet
        await UserWallet.increment(
          { balance: amountToAddToWallet }, // `balance` here is the amount to be added to the existing balance
          {
            where: {
              customerId: loggedInUser.userId, // Condition to match the user by their customerId
            },
          }
        );

        // Getting the user wallet data
        const walletData = await WalletService.getUserWallet(
          loggedInUser.userId
        );

        // Making the transaction history
        await WalletTransaction.create({
          walletId: walletData.walletId,
          amount: amountToAddToWallet,
          type: TransactionType.CREDIT,
          bookingId: bookingId,
          transactionType: TransactionType.REFUND,
        });
      }

      // If cancellation for subscription
      if (washBy == WashBy.Subscription) {
        const washData = await WashWalletTransaction.findOne({
          where: {
            bookingId: bookingId,
            type: TransactionType.DEBIT,
          },
        });

        if (washData) {
          if (washData.washType == WashTypeConstant.GOLD) {
            if (
              booking?.washOrder?.vehicle?.vehicleType ==
              VehicleType.TWO_WHEELER
            ) {
              // Adding the subscription data in user wash wallet
              await UserWashWallet.increment(
                {
                  goldWash: 1,
                },
                {
                  where: {
                    customerId: loggedInUser.userId,
                  },
                }
              );
            } else {
              // Adding the subscription data in user wash wallet
              await UserWashWallet.increment(
                {
                  goldWashFourWheeler: 1,
                },
                {
                  where: {
                    customerId: loggedInUser.userId,
                  },
                }
              );
            }

            // Incrementing the balance in the user's wallet
            await CustomerSubscription.increment(
              { remainingGoldWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
              {
                where: {
                  customerId: loggedInUser.userId, // Condition to match the user by their customerId
                  isExpired: false,
                  vehicleType: booking?.washOrder?.vehicle?.vehicleType,
                },
              }
            );
          } else if (washData.washType == WashTypeConstant.PLATINUM) {
            if (
              booking?.washOrder?.vehicle?.vehicleType ==
              VehicleType.TWO_WHEELER
            ) {
              // Adding the subscription data in user wash wallet
              await UserWashWallet.increment(
                {
                  platinumWash: 1,
                },
                {
                  where: {
                    customerId: loggedInUser.userId,
                  },
                }
              );
            } else {
              // Adding the subscription data in user wash wallet
              await UserWashWallet.increment(
                {
                  platinumWashFourWheeler: 1,
                },
                {
                  where: {
                    customerId: loggedInUser.userId,
                  },
                }
              );
            }
            // Incrementing the balance in the user's wallet
            await CustomerSubscription.increment(
              { remainingPlatinumWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
              {
                where: {
                  customerId: loggedInUser.userId, // Condition to match the user by their customerId
                  isExpired: false,
                  vehicleType: booking?.washOrder?.vehicle?.vehicleType,
                },
              }
            );
          } else {
            if (
              booking?.washOrder?.vehicle?.vehicleType ==
              VehicleType.TWO_WHEELER
            ) {
              // Adding the subscription data in user wash wallet
              await UserWashWallet.increment(
                {
                  silverWash: 1,
                },
                {
                  where: {
                    customerId: loggedInUser.userId,
                  },
                }
              );
            } else {
              // Adding the subscription data in user wash wallet
              await UserWashWallet.increment(
                {
                  silverWashFourWheeler: 1,
                },
                {
                  where: {
                    customerId: loggedInUser.userId,
                  },
                }
              );
            }

            // Incrementing the balance in the user's wallet
            await CustomerSubscription.increment(
              { remainingSilverWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
              {
                where: {
                  customerId: loggedInUser.userId, // Condition to match the user by their customerId
                  isExpired: false,
                  vehicleType: booking?.washOrder?.vehicle?.vehicleType,
                },
              }
            );
          }

          // Making the transaction History
          await WashWalletTransaction.create({
            washWalletId: washData.washWalletId,
            washBalance: 1,
            type: TransactionType.CREDIT,
            washType: washData.washType,
            bookingId: bookingId,
            vehicleType: booking?.washOrder?.vehicle?.vehicleType,
          });
        }
      }

      // Updating the booking details
      await Booking.update(
        {
          bookingStatus: Status.Cancelled,
          cancellationAmount: feeAmount,
        },
        {
          where: {
            bookingId: bookingId, // Condition to match the booking by its bookingId
          },
        }
      );

      let description = 'Your booking has been canceled';
      let title = 'Booking Cancel';
      // Creating the notification for customer
      await CustomerNotification.create({
        customerId: loggedInUser.userId,
        description: description,
        title: title,
        isCancel: true,
      });

      // Getting the device token of one customer
      const deviceTokens: any = await this.getCustomerDeviceToken(
        loggedInUser.userId
      );

      // Making the notification data
      let notificationData: any = {
        type: 'Booking Cancel',
        id: bookingId,
      };

      if (deviceTokens.length) {
        sendFirebaseNotificationWithData(
          deviceTokens,
          title,
          description,
          notificationData
        );
      }

      return {
        cancelledAmount: feeAmount,
        refundAmount: amountToAddToWallet,
      };
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async referralRedeem(customerId: string) {
    try {
      // Check if this is the user's first booking
      const userBookings = await Booking.findAll({
        where: {
          customerId: customerId,
          paymentStatus: 'Completed',
          washBy: { [Op.ne]: TransactionType.FREE_WASH },
        },
      });

      if (userBookings.length == 1) {
        // First booking completed, update referral status and reward referrer
        const referral = await Referral.findOne({
          where: {
            referredUserId: customerId,
            referralStatus: Status.Pending,
            status: {
              [Op.not]: ['Expired', 'Inactive'],
            },
          },
        });

        if (referral) {
          // Calculate the timestamp
          const currentTime = moment().toISOString();

          const referAndEarnData = await ReferAndEarn.findOne({
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

          console.log(
            '🚀 ~ BookingServices ~ referralRedeem ~ referAndEarnData:',
            referAndEarnData
          );

          // Update referral status to Completed
          await Referral.update(
            {
              referralStatus: Status.Completed,
              status: 'Inactive',
              isBooked: true,
              referrerBonusType: referAndEarnData.rewardTypeForReferee,
              referrerBonus: referAndEarnData.rewardForReferee,
              referredUserBonusType: referAndEarnData.rewardTypeForNewUser,
              referredUserBonus: referAndEarnData.rewardForNewUser,
              expiryDate: referAndEarnData.endDate,
              referAndEarnId: referAndEarnData.referAndEarnId,
            },
            {
              where: {
                referredUserId: customerId,
              },
            }
          );

          if (referAndEarnData.rewardTypeForReferee == 'Amount') {
            this.incrementBalanceWallet(
              referAndEarnData.rewardForReferee,
              referral.referrerUserId
            );
          }

          if (referAndEarnData.rewardTypeForReferee == 'Wash') {
            this.incrementWashWallet(
              referAndEarnData.rewardForReferee,
              referral.referrerUserId
            );
          }

          if (referAndEarnData.rewardTypeForNewUser == 'Amount') {
            this.incrementBalanceWallet(
              referAndEarnData.rewardForNewUser,
              referral.referredUserId
            );
          }

          if (referAndEarnData.rewardTypeForNewUser == 'Wash') {
            this.incrementWashWallet(
              referAndEarnData.rewardForNewUser,
              referral.referredUserId
            );
          }
        }
      }

      return;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async futureMerchantBookings(merchantId: string, date: string) {
    try {
      return await Booking.findOne({
        where: {
          merchantId: merchantId,
          paymentStatus: {
            [Op.ne]: Status.Cancelled,
          },
          bookingTime: {
            [Op.gte]: date,
          },
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Function to check booking  during merchant close start Date and end Date
  async checkMerchantBookingWithDate(
    merchantId: string,
    startDate: any,
    endDate: any
  ) {
    try {
      return await Booking.findAll({
        where: {
          merchantId: merchantId,
          paymentStatus: Status.Completed,
          bookingStatus: Status.Confirmed,
        },
        include: [
          {
            model: Slot,
            where: {
              startDateTime: {
                // [Op.and]: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
                // },
              },
            },
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Function to cancel booking during announced closure
  async cancelBookingDuringMerchantClosure(bookingIds: any) {
    try {
      // Finding all the bookings and customer
      const bookingData: any = await Booking.findAll({
        where: {
          bookingId: {
            [Op.in]: bookingIds, // Array of Booking ids
          },
        },
        include: [
          {
            model: WashOrder,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                model: Vehicle,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
            ],
          },
        ],
        attributes: ['customerId', 'paymentAmount', 'bookingId'],
      });

      if (bookingData.length) {
        for (let i in bookingData) {
          let data = bookingData[i].dataValues;
          let vehicleType = data.washOrder?.vehicle?.vehicleType;

          // Updating the booking details
          await Booking.update(
            {
              bookingStatus: Status.Cancelled,
            },
            {
              where: {
                bookingId: data.bookingId, // Condition to match the booking by its bookingId
              },
            }
          );
          if (data.paymentAmount && data.paymentAmount > 0) {
            // Incrementing the balance in the user's wallet
            await UserWallet.increment(
              { balance: data.paymentAmount }, // `balance` here is the amount to be added to the existing balance
              {
                where: {
                  customerId: data.customerId, // Condition to match the user by their customerId
                },
              }
            );

            // Getting the user wallet data
            const walletData = await WalletService.getUserWallet(
              data.customerId
            );

            // Making the transaction history
            await WalletTransaction.create({
              walletId: walletData.walletId,
              amount: data.paymentAmount,
              type: TransactionType.CREDIT,
              bookingId: data.bookingId,
              transactionType: TransactionType.REFUND,
            });
          }

          // If cancellation for subscription
          if (data.washBy == WashBy.Subscription) {
            const washData = await WashWalletTransaction.findOne({
              where: {
                bookingId: data.bookingId,
                type: TransactionType.DEBIT,
              },
            });

            if (washData) {
              if (washData.washType == WashTypeConstant.GOLD) {
                if (vehicleType == VehicleType.TWO_WHEELER) {
                  // Adding the subscription data in user wash wallet
                  await UserWashWallet.increment(
                    {
                      silverWash: 1,
                    },
                    {
                      where: {
                        customerId: data.customerId,
                      },
                    }
                  );
                } else {
                  // Adding the subscription data in user wash wallet
                  await UserWashWallet.increment(
                    {
                      silverWashFourWheeler: 1,
                    },
                    {
                      where: {
                        customerId: data.customerId,
                      },
                    }
                  );
                }

                // Incrementing the balance in the user's wallet
                await CustomerSubscription.increment(
                  { remainingGoldWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
                  {
                    where: {
                      customerId: data.customerId, // Condition to match the user by their customerId
                      isExpired: false,
                      vehicleType: vehicleType,
                    },
                  }
                );
              } else if (washData.washType == WashTypeConstant.PLATINUM) {
                if (vehicleType == VehicleType.TWO_WHEELER) {
                  // Adding the subscription data in user wash wallet
                  await UserWashWallet.increment(
                    {
                      platinumWash: 1,
                    },
                    {
                      where: {
                        customerId: data.customerId,
                      },
                    }
                  );
                } else {
                  // Adding the subscription data in user wash wallet
                  await UserWashWallet.increment(
                    {
                      platinumWashFourWheeler: 1,
                    },
                    {
                      where: {
                        customerId: data.customerId,
                      },
                    }
                  );
                }

                // Incrementing the balance in the user's wallet
                await CustomerSubscription.increment(
                  { remainingPlatinumWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
                  {
                    where: {
                      customerId: data.customerId, // Condition to match the user by their customerId
                      isExpired: false,
                      vehicleType: vehicleType,
                    },
                  }
                );
              } else {
                if (vehicleType == VehicleType.TWO_WHEELER) {
                  // Adding the subscription data in user wash wallet
                  await UserWashWallet.increment(
                    {
                      silverWash: 1,
                    },
                    {
                      where: {
                        customerId: data.customerId,
                      },
                    }
                  );
                } else {
                  // Adding the subscription data in user wash wallet
                  await UserWashWallet.increment(
                    {
                      silverWashFourWheeler: 1,
                    },
                    {
                      where: {
                        customerId: data.customerId,
                      },
                    }
                  );
                }

                // Incrementing the balance in the user's wallet
                await CustomerSubscription.increment(
                  { remainingSilverWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
                  {
                    where: {
                      customerId: data.customerId, // Condition to match the user by their customerId
                      isExpired: false,
                      vehicleType: vehicleType,
                    },
                  }
                );
              }

              // Making the transaction History
              await WashWalletTransaction.create({
                washWalletId: washData.washWalletId,
                washBalance: 1,
                type: TransactionType.CREDIT,
                washType: washData.washType,
                bookingId: data.bookingId,
                vehicleType: vehicleType,
              });
            }
          }

          let description =
            'Oops! Our service center is temporarily unavailable due to a technical issue—please reschedule your appointment again!';
          let title = 'Booking Cancel';
          // Creating the notification for customer
          await CustomerNotification.create({
            customerId: data.customerId,
            description: description,
            title: title,
            isCancel: true,
            isMerchantClosure: true,
          });

          // Getting the device token of one customer
          const deviceTokens: any = await this.getCustomerDeviceToken(
            data.customerId
          );

          // Making the notification data
          let notificationData: any = {
            type: 'Booking Cancel',
            id: data.bookingId,
          };

          if (deviceTokens.length) {
            sendFirebaseNotificationWithData(
              deviceTokens,
              title,
              description,
              notificationData
            );
          }

          // Sending the text message to customer
          await this.sendTextMessage(
            data.bookingId,
            data.customerId,
            Status.Cancelled
          );
        }
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async bookingWashPayment(body: any) {
    try {
      const {
        loggedInUser,
        washType,
        bookingId,
        paymentAmount,
        vehicleType,
        customerSubscriptionId,
      } = body;

      // Getting the user wallet data
      const beforeDeductionWallet = await WalletService.getUserWallet(
        loggedInUser.userId
      );

      // Getting the user wash wallet data
      const beforeDeductionWashWallet =
        await WashWalletService.getUserWashWallet(loggedInUser.userId);

      if (washType == WashTypeConstant.GOLD) {
        if (vehicleType == VehicleType.TWO_WHEELER) {
          // Decrementing the balance in the user's wallet
          await UserWashWallet.decrement(
            { goldWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
              },
            }
          );
        } else {
          // Decrementing the balance in the user's wallet
          await UserWashWallet.decrement(
            { goldWashFourWheeler: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
              },
            }
          );
        }

        if (customerSubscriptionId) {
          // Decrementing the balance in the user's wallet
          await CustomerSubscription.decrement(
            { remainingGoldWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
                isExpired: false,
                vehicleType: vehicleType,
                customerSubscriptionId: customerSubscriptionId,
              },
            }
          );
        }
      } else if (washType == WashTypeConstant.PLATINUM) {
        if (vehicleType == VehicleType.TWO_WHEELER) {
          // Decrementing the balance in the user's wallet
          await UserWashWallet.decrement(
            { platinumWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
              },
            }
          );
        } else {
          // Decrementing the balance in the user's wallet
          await UserWashWallet.decrement(
            { platinumWashFourWheeler: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
              },
            }
          );
        }

        if (customerSubscriptionId) {
          // Decrementing the balance in the user's wallet
          await CustomerSubscription.decrement(
            { remainingPlatinumWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
                isExpired: false,
                vehicleType: vehicleType,
                customerSubscriptionId: customerSubscriptionId,
              },
            }
          );
        }
      } else {
        if (beforeDeductionWashWallet.freeWash > 0) {
          // Decrementing the balance in the user's wallet
          await UserWashWallet.decrement(
            { freeWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
            {
              where: {
                customerId: loggedInUser.userId, // Condition to match the user by their customerId
              },
            }
          );
        } else {
          if (vehicleType == VehicleType.TWO_WHEELER) {
            // Decrementing the balance in the user's wallet
            await UserWashWallet.decrement(
              { silverWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
              {
                where: {
                  customerId: loggedInUser.userId, // Condition to match the user by their customerId
                },
              }
            );
          } else {
            // Decrementing the balance in the user's wallet
            await UserWashWallet.decrement(
              { silverWashFourWheeler: 1 }, // `balance` here is the amount to be subtracted from the existing balance
              {
                where: {
                  customerId: loggedInUser.userId, // Condition to match the user by their customerId
                },
              }
            );
          }

          if (customerSubscriptionId) {
            // Decrementing the balance in the user's wallet
            await CustomerSubscription.decrement(
              { remainingSilverWash: 1 }, // `balance` here is the amount to be subtracted from the existing balance
              {
                where: {
                  customerId: loggedInUser.userId, // Condition to match the user by their customerId
                  isExpired: false,
                  vehicleType: vehicleType,
                  customerSubscriptionId: customerSubscriptionId,
                },
              }
            );
          }
        }
      }

      if (paymentAmount && paymentAmount > 0) {
        // Decrementing the balance in the user's wallet
        await UserWallet.decrement(
          { balance: paymentAmount }, // `balance` here is the amount to be subtracted from the existing balance
          {
            where: {
              customerId: loggedInUser.userId, // Condition to match the user by their customerId
            },
          }
        );

        // Getting the user wallet data
        const walletData = await WalletService.getUserWallet(
          loggedInUser.userId
        );

        // Making the transaction History
        await WalletTransaction.create({
          walletId: walletData.walletId,
          amount: paymentAmount,
          type: TransactionType.DEBIT,
          bookingId: bookingId,
          transactionType: TransactionType.BOOKING,
        });
      }

      // Getting the user wash wallet data
      const afterDeductionWashWallet =
        await WashWalletService.getUserWashWallet(loggedInUser.userId);

      // Getting the user wallet data
      const afterDeductionWallet = await WalletService.getUserWallet(
        loggedInUser.userId
      );

      // Making the object to save
      let obj: any = {
        previousBalance: {
          wallet: {
            amount: beforeDeductionWallet.balance,
          },
          washWallet: {
            silver: beforeDeductionWashWallet.silverWash,
            gold: beforeDeductionWashWallet.goldWash,
            platinum: beforeDeductionWashWallet.platinumWash,
            silverWashFourWheeler:
              beforeDeductionWashWallet.silverWashFourWheeler,
            goldWashFourWheeler: beforeDeductionWashWallet.goldWash,
            platinumWashFourWheeler:
              beforeDeductionWashWallet.platinumWashFourWheeler,
          },
        },
        currentBalance: {
          wallet: {
            amount: afterDeductionWallet.balance,
          },
          washWallet: {
            silver: afterDeductionWashWallet.silverWash,
            gold: afterDeductionWashWallet.goldWash,
            platinum: afterDeductionWashWallet.platinumWash,
            silverWashFourWheeler:
              afterDeductionWashWallet.silverWashFourWheeler,
            goldWashFourWheeler: afterDeductionWashWallet.goldWash,
            platinumWashFourWheeler:
              afterDeductionWashWallet.platinumWashFourWheeler,
          },
        },
      };

      // Fetch all transactions for the specified wash wallet
      let washWalletTransactionData: any = await WashWalletTransaction.findAll({
        where: {
          washWalletId: afterDeductionWashWallet.washWalletId,
        },
      });

      // Set default wash type to subscription
      let washByTpe: any = WashBy.Subscription;

      // If this is the first wash transaction and the wash type is SILVER, mark it as a free wash
      if (
        washWalletTransactionData.length == 1 &&
        washType == WashTypeConstant.SILVER
      ) {
        washByTpe = TransactionType.FREE_WASH;
      }

      // Updating the booking details
      await Booking.update(
        {
          paymentStatus: Status.Completed,
          washBy: washByTpe,
          oneTimePassword: fourDigitOtpGenerator(),
          bookingStatus: Status.Confirmed,
          paymentAmount: paymentAmount,
          washWalletBalance: obj,
        },
        {
          where: {
            bookingId: bookingId, // Condition to match the booking by its bookingId
          },
        }
      );

      // Saving the water per wash according to vehicle type
      let waterSaved: any = 0;

      // Getting the vehicle type
      let vehicleDetails: any = await this.getVehicleDetailsOfBooking(
        bookingId
      );

      if (
        vehicleDetails?.washOrder?.vehicle?.vehicleType ==
        VehicleType.FOUR_WHEELER
      ) {
        waterSaved = config.waterSavedPerWashForFourWheeler;
      } else {
        waterSaved = config.waterSavedPerWashForTwoWheeler;
      }

      // Update customer water saved Value   (Will delete in future)
      await Customer.increment(
        {
          totalWaterSaved: waterSaved,
        },
        {
          where: {
            customerId: loggedInUser.userId,
          },
        }
      );

      // Getting the user wash wallet data
      const washWalletData = await WashWalletService.getUserWashWallet(
        loggedInUser.userId
      );

      // Making the transaction History
      await WashWalletTransaction.create({
        washWalletId: washWalletData.washWalletId,
        washBalance: 1,
        type: TransactionType.DEBIT,
        washType: washType,
        transactionType: washByTpe,
        bookingId: bookingId,
        vehicleType: vehicleType,
      });

      let description = 'Your booking has been confirmed';
      let title = 'Booking Confirmed';
      // Creating the notification for customer
      await CustomerNotification.create({
        customerId: loggedInUser.userId,
        description: description,
        title: title,
      });

      // Getting the device token of one customer
      const deviceTokens: any = await this.getCustomerDeviceToken(
        loggedInUser.userId
      );

      // Making the notification data
      let notificationData: any = {
        type: 'Booking Confirmed',
        id: bookingId,
      };

      if (deviceTokens.length) {
        sendFirebaseNotificationWithData(
          deviceTokens,
          title,
          description,
          notificationData
        );
      }

      // Sending the text message to customer
      await this.sendTextMessage(
        bookingId,
        loggedInUser.userId,
        Status.Confirmed
      );

      return;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getCustomeOneTimeUsedCoupons(customerId: string) {
    try {
      // Fetch customer all booking
      const bookings = await Booking.findAll({
        where: {
          customerId: customerId,
          couponId: {
            [Op.ne]: null,
          },
        },
      });
      const couponIds = bookings.map((booking) => booking.dataValues.couponId);
      let oneTimeUsedCoupons = [];
      if (couponIds.length > 0) {
        // Fetch customer all the single time used coupon list
        const coupons = await Coupon.findAll({
          where: {
            allowMultipleTimeUse: false,
            couponId: {
              [Op.in]: couponIds,
            },
            deletedAt: null,
          },
        });
        oneTimeUsedCoupons = coupons.map((coupon: any) => coupon.couponId);
      }
      return oneTimeUsedCoupons;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async cancelWashSubscriptionBooking(body: any, booking: any) {
    try {
      const { bookingId, loggedInUser } = body;

      // Assuming booking has properties: createdAt, amount
      const { createdAt, paymentAmount } = booking;

      const currentTime = new Date();
      const elapsedMinutes = Math.floor(
        (currentTime.getTime() - new Date(createdAt).getTime()) / 60000
      );

      // Calculate the cancellation fee
      const feePercentage = getCancellationFeePercentage(elapsedMinutes);
      const feeAmount = (paymentAmount * feePercentage) / 100;
      const amountToAddToWallet = paymentAmount - feeAmount;

      // Updating the booking details
      await Booking.update(
        {
          bookingStatus: Status.Cancelled,
          cancellationAmount: feeAmount,
        },
        {
          where: {
            bookingId: bookingId, // Condition to match the booking by its bookingId
          },
        }
      );

      // Incrementing the balance in the user's wallet
      await UserWallet.increment(
        { balance: amountToAddToWallet }, // `balance` here is the amount to be added to the existing balance
        {
          where: {
            customerId: loggedInUser.userId, // Condition to match the user by their customerId
          },
        }
      );

      // Getting the user wallet data
      const walletData = await WalletService.getUserWallet(loggedInUser.userId);

      // Making the transaction history
      await WalletTransaction.create({
        walletId: walletData.walletId,
        amount: amountToAddToWallet,
        type: TransactionType.CREDIT,
        bookingId: bookingId,
        transactionType: TransactionType.REFUND,
      });

      return {
        cancelledAmount: feeAmount,
        refundAmount: amountToAddToWallet,
      };
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async getBookingWashCounts() {
    try {
      // Fetch customer all booking
      const counts = await Booking.findAll({
        attributes: [
          [
            db.sequelize.fn('COUNT', db.sequelize.col('booking_id')),
            'totalCount',
          ],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN booking_status = '${Status.Completed}' THEN 1 ELSE 0 END`
              )
            ),
            'completedCount',
          ],
          [
            db.sequelize.fn(
              'SUM',
              db.sequelize.literal(
                `CASE WHEN booking_status = '${Status.Cancelled}' THEN 1 ELSE 0 END`
              )
            ),
            'cancelledCount',
          ],
        ],
      });
      return counts[0];
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async incrementWashWallet(bonus: number, customerId: string) {
    try {
      if (bonus > 0) {
        // Reward the referrer
        await UserWashWallet.increment(
          { silverWash: bonus }, // `balance` here is the amount to be added to the existing balance
          {
            where: {
              customerId: customerId, // Condition to match the user by their customerId
            },
          }
        );

        // Get the referrer's washwallet data
        const washWalletData = await WashWalletService.getUserWashWallet(
          customerId
        );

        // Making the transaction History
        await WashWalletTransaction.create({
          washWalletId: washWalletData.washWalletId,
          washBalance: bonus,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.REFERRAL,
          washType: WashTypeConstant.SILVER,
        });
      }

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async incrementBalanceWallet(amount: number, customerId: string) {
    try {
      if (amount > 0) {
        // Reward the referrer
        await UserWallet.increment(
          { balance: amount }, // `balance` here is the amount to be added to the existing balance
          {
            where: {
              customerId: customerId, // Condition to match the user by their customerId
            },
          }
        );

        // Getting the user wallet data
        const walletData = await WalletService.getUserWallet(customerId);

        // Making the transaction history
        await WalletTransaction.create({
          walletId: walletData.walletId,
          amount: amount,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.REFERRAL,
        });
      }

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // Function to get customer Booking
  async getCustomerBooking(customerId: string) {
    try {
      return Booking.count({
        where: {
          customerId: customerId,
          paymentStatus: Status.Completed,
          bookingStatus: Status.Confirmed,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Function to get customer device token
  async getCustomerDeviceToken(customerId: string) {
    try {
      const tokenData = await CustomerDeviceToken.findAll({
        where: {
          customerId: customerId,
        },
      });
      const deviceTokens = [];

      for (let j in tokenData) {
        const deviceToken = tokenData[j]?.dataValues?.deviceToken;
        if (deviceToken) {
          deviceTokens.push(deviceToken);
        }
      }

      return deviceTokens;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async b2cLedger(data: any) {
    try {
      let {
        search,
        city,
        state,
        vehicleType,
        washType,
        startDate,
        endDate,
        offset,
        limit,
        merchantIds,
      } = data;

      const { _limit, _offset } = paginatorParamFormat(limit, offset);

      let bookingCondition: any = {};

      // If only startDate is provided, filter for bookings on that specific day.
      if (startDate && !endDate) {
        const startDateTime = moment(startDate).startOf('day').toISOString(); // Start of the day for startDate
        console.log(
          '🚀 ~ BookingServices ~ b2cLedger ~ startDateTime:',
          startDateTime
        );
        const endDateTime = moment(startDate).endOf('day').toISOString(); // End of the day for startDate
        console.log(
          '🚀 ~ BookingServices ~ b2cLedger ~ endDateTime:',
          endDateTime
        );

        bookingCondition.createdAt = {
          [Op.gte]: startDateTime, // Greater than or equal to start of the day
          [Op.lte]: endDateTime, // Less than or equal to end of the day
        };
      }

      // If both startDate and endDate are provided, filter for bookings between the two dates (inclusive).
      if (startDate && endDate) {
        const startDateTime = moment(startDate).startOf('day').toISOString(); // Start of the day for startDate
        const endDateTime = moment(endDate).endOf('day').toISOString(); // End of the day for endDate

        bookingCondition.createdAt = {
          [Op.gte]: startDateTime, // Greater than or equal to start of startDate
          [Op.lte]: endDateTime, // Less than or equal to end of endDate
        };
      }

      // Base condition for completed bookings
      let whereCondition: any = {
        ...bookingCondition,
        bookingStatus: Status.Completed,
      };

      let customerCondition: any = {};
      let washTypeCondition: any = {};
      let vehicleCondition: any = { isDeleted: false };
      let merchantCondition: any = {};

      // Optimize splitting and condition merging
      if (washType) {
        washTypeCondition.Name = { [Op.in]: washType.split(',') };
      }

      if (city) {
        customerCondition.city_id = { [Op.in]: city.split(',') };
      }

      if (state) {
        customerCondition.state_id = { [Op.in]: state.split(',') };
      }

      if (merchantIds) {
        merchantCondition.merchantId = { [Op.in]: merchantIds.split(',') };
      }

      if (vehicleType) {
        vehicleCondition.vehicleType = {
          [Op.in]: vehicleType.split(','),
          [Op.ne]: null, // Ensure vehicleType is not null
        };
      }

      if (search) {
        const searchTerms = search.split(' ');
        const [firstNameTerm, lastNameTerm] = searchTerms;

        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              '$washOrder.vehicle.customer.first_name$': {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              '$washOrder.vehicle.customer.last_name$': {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              '$washOrder.vehicle.customer.state$': {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              '$washOrder.vehicle.customer.city$': {
                [Op.iLike]: `%${search}%`,
              },
            },
            { '$washOrder.washType.Name$': { [Op.iLike]: `%${search}%` } },
            {
              '$washOrder.vehicle.hsrp_number$': { [Op.iLike]: `%${search}%` },
            },
            { '$merchant.outletName$': { [Op.iLike]: `%${search}%` } },
            // Handle multi-term search efficiently
            {
              [Op.and]: [
                {
                  [Op.or]: [
                    {
                      '$washOrder.vehicle.customer.first_name$': {
                        [Op.iLike]: `%${firstNameTerm}%`,
                      },
                    },
                    {
                      '$washOrder.vehicle.customer.last_name$': {
                        [Op.iLike]: `%${firstNameTerm}%`,
                      },
                    },
                  ],
                },
                {
                  [Op.or]: [
                    {
                      '$washOrder.vehicle.customer.first_name$': {
                        [Op.iLike]: `%${lastNameTerm || ''}%`,
                      },
                    },
                    {
                      '$washOrder.vehicle.customer.last_name$': {
                        [Op.iLike]: `%${lastNameTerm || ''}%`,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
      }

      // Fetch booking details based on the conditions
      let bookingDetails: any = await Booking.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: WashOrder,
            required: true,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
              {
                model: Vehicle,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: vehicleCondition, // Apply vehicle condition here
                required: true, // Enforce vehicle type strictness
                include: [
                  {
                    model: Customer,
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    where: customerCondition, // Apply customer (city/state) condition here
                    required: !!(city || state), // Enforce customer condition if city or state provided
                    include: [
                      {
                        model: State,
                        include: [
                          {
                            model: Region,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                model: WashType,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: washTypeCondition, // Apply washType condition here
                required: !!washType, // Enforce washType strictness
              },
            ],
          },
          {
            model: Merchant,
            where: merchantCondition,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: _limit,
        offset: _offset,
      });

      // Handle the booking results
      for (let i in bookingDetails.rows) {
        let bookingId = bookingDetails.rows[i].bookingId;

        let addAdditionalServices = await BookingAdditionalService.findAll({
          where: {
            bookingId: bookingId,
          },
          raw: true,
        });
        bookingDetails.rows[i].dataValues.addAdditionalServices =
          addAdditionalServices;
        let addOnAmount: any = 0;

        if (addAdditionalServices.length) {
          for (let i in addAdditionalServices) {
            addOnAmount += Number(addAdditionalServices[i].price);
          }
        }
        bookingDetails.rows[i].dataValues.addOnAmount = addOnAmount;
      }

      // Return the array with all booking details including additional services
      return {
        customer: bookingDetails.rows,
        pagination: paginatorService(
          _limit,
          _offset / _limit + 1,
          bookingDetails.count
        ),
      };
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async findCustomerAndBooking(
    phone: any,
    otp: number,
    errIdentifier: boolean,
    machineId?: string
  ) {
    try {
      // Finding the customer details
      const customerDetails = await Customer.findOne({
        where: {
          isDeleted: false,
          [Op.and]: [
            db.Sequelize.where(
              db.Sequelize.fn('RIGHT', db.Sequelize.col('phone'), 4),
              phone
            ),
          ],
        },
      });

      if (!customerDetails && errIdentifier) {
        return { isError: true };
      }

      let bookingDetails: any = {};
      if (customerDetails) {
        let whereCondition: any = {};
        if (!isNullOrUndefined(machineId)) {
          // Use Op.in to match machineGuid with multiple machineIds
          whereCondition['machineGuid'] = {
            [Op.in]: [machineId], // machineId should be an array of values
          };
        }

        // Find the booking that matches the customer ID and OTP
        bookingDetails = await Booking.findOne({
          where: {
            customerId: customerDetails?.customerId, // Filter by customer ID
            oneTimePassword: otp, // Filter by OTP
            paymentStatus: Status.Completed, // Filter by completed payment status
            bookingStatus: {
              [Op.notIn]: [Status.Cancelled, Status.Completed], // Exclude both 'Cancelled' and 'Completed' booking statuses
            },
          },
          include: [
            {
              model: WashOrder,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
              include: [
                {
                  model: WashType,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  },
                },
              ],
            },
            {
              model: Merchant,
              include: [
                {
                  model: Machine,
                  where: whereCondition,
                  attributes: ['machineGuid'],
                },
              ],
            },
          ],
          raw: true,
        });
      }

      if (!bookingDetails && errIdentifier) {
        return { isError: true };
      }

      return { bookingDetails, customerDetails, isError: false };
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async verifyCustomerBookingOtp(phone: any, otp: number, machineId: string) {
    try {
      // Use the common function to get customer and booking details
      const { bookingDetails, isError } = await this.findCustomerAndBooking(
        phone,
        otp,
        true,
        machineId
      );

      if (isError) {
        return { isError: true };
      }

      // Update the booking status to "Started"
      await Booking.update(
        {
          bookingStatus: Status.Started,
        },
        {
          where: {
            bookingId: bookingDetails.bookingId,
          },
        }
      );

      return { bookingDetails: bookingDetails, isError: false };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateSkuNumber(phone: any, otp: number, skuNumber: any) {
    try {
      // Use the common function to get customer and booking details
      const { bookingDetails, customerDetails } =
        await this.findCustomerAndBooking(phone, otp, false);

      if (bookingDetails) {
        // Update the booking status and SKU number
        await Booking.update(
          {
            bookingStatus: Status.Completed,
            SkuNumber: skuNumber,
          },
          {
            where: {
              bookingId: bookingDetails.bookingId,
            },
          }
        );
      }

      return customerDetails?.customerId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async bookingMemo(bookingId: any) {
    try {
      // Fetch booking details based on the customerId and slot condition
      let bookingDetails = await Booking.findOne({
        where: {
          bookingId: bookingId,
        },
        include: [
          {
            model: Slot,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
          {
            model: WashOrder,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                model: Vehicle,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
                include: [
                  {
                    model: Customer,
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'],
                    },
                  },
                ],
              },

              {
                model: WashType,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
            ],
          },
          {
            model: Merchant,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
      });

      // Retrieve the additional service details for the current booking
      let additionalServiceDetails = await BookingAdditionalService.findAll({
        where: {
          bookingId: bookingId,
        },
        raw: true,
      });

      let total = 0;
      if (additionalServiceDetails.length) {
        for (let i in additionalServiceDetails) {
          total += Number(additionalServiceDetails[i].price);
        }
      }
      let pdfLink: any;

      let data: any;
      if (bookingDetails) {
        data = {
          bookingId: bookingId,
          outletName: bookingDetails.merchant.outletName,
          startDateTime: new Date(bookingDetails.slot.startDateTime)
            .toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: 'Asia/Kolkata',
            })
            .replace(',', ''),
          firstName: bookingDetails.washOrder.vehicle.customer.firstName,
          lastName: bookingDetails.washOrder.vehicle.customer.lastName,
          paymentAmount: bookingDetails.paymentAmount,
          washType: bookingDetails.washOrder.washType.Name,
          washPrice:
            Number(bookingDetails.washOrder.washPrice) +
            Number(bookingDetails.washOrder.manPowerPrice),
          hsrpNumber: bookingDetails.washOrder.vehicle.hsrpNumber,
          vehicleType: bookingDetails.washOrder.vehicle.vehicleType,
          gstAmount: ((totalPrice, taxRate = 0.18) =>
            Number(((totalPrice * taxRate) / (1 + taxRate)).toFixed(2)))(
            bookingDetails.paymentAmount
          ),
          subscription: bookingDetails.washBy == WashBy.Subscription ? 1 : 0,
          totalAdditionalServicePrice: total,
          additionalService: additionalServiceDetails,
          address: bookingDetails.merchant.address,
        };

        pdfLink = await generateAndCustomerMemoPdf(data, true);
      }

      return pdfLink;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getVehicleDetailsOfBooking(BookingId: string) {
    try {
      let whereCondition: any = {
        bookingId: BookingId,
      };

      // Fetch booking details based on the customerId and slot condition
      let bookingDetails = await Booking.findOne({
        where: whereCondition,
        include: [
          {
            model: Slot,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
          {
            model: WashOrder,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                model: Vehicle,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
              {
                model: WashType,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
            ],
          },
          {
            model: Merchant,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Return the array with all booking details including additional services
      return bookingDetails;
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }

  async sendTextMessage(
    bookingId: string,
    customerId: any,
    messageType: string
  ) {
    try {
      // Fetch booking details based on the customerId and slot condition
      let bookingDetails = await this.getVehicleDetailsOfBooking(bookingId);

      let addAdditionalService: string = ''; // Proper type definition

      // Retrieve the additional service details for the booking
      let additionalServiceDetails = await BookingAdditionalService.findAll({
        where: {
          bookingId: bookingId,
        },
      });

      // Check if additional services exist
      if (additionalServiceDetails.length) {
        // Concatenate the additional service names into a single string
        addAdditionalService = additionalServiceDetails
          .map((service) => service.additionalServiceName)
          .join(', '); // You can change the separator if needed (e.g., ", " for comma-separated)
      }

      let customerDetails = await Customer.findOne({
        where: {
          customerId: customerId,
        },
      });

      const dateAndTime = separateDateAndTime(
        bookingDetails.slot.startDateTime
      );

      let message: string;
      if (messageType == Status.Confirmed) {
        message = `Dear ${customerDetails?.firstName} ${customerDetails?.lastName},\nYour booking is confirmed.\nBelow are the details:\nDate: ${dateAndTime?.date}\nService Centre: ${bookingDetails?.merchant?.outletName} ${bookingDetails?.merchant?.address}\nTime: ${dateAndTime?.time}\nWash Type: ${bookingDetails?.washOrder?.washType.Name}\nAdditional Services: ${addAdditionalService}\nHappy Washing!\nTeam Blueverse`;
      } else if (messageType == Status.Cancelled) {
        message = `Dear ${customerDetails?.firstName} ${customerDetails?.lastName},\nYour booking has been cancelled due to a technical issue at the service centre.\nBooking details:\nDate: ${dateAndTime?.date}\nService Centre: ${bookingDetails?.merchant?.outletName} ${bookingDetails?.merchant?.address}\nTime: ${dateAndTime?.time}\nWash Type: ${bookingDetails?.washOrder?.washType.Name}\nAdditional Services: ${addAdditionalService}\n\nWe apologise for the inconvenience and hope to serve you soon.\nTeam Blueverse`;
      }

      sendSMSMessage(message, customerDetails.phone);
    } catch (err) {
      // Return a rejected promise in case of an error
      return Promise.reject(err);
    }
  }
}

// Create an instance of the service class and export it
const BookingService = new BookingServices();
export { BookingService };
