import moment from 'moment';
import { Booking, Status } from '../../B2C/models/booking';
import { Op } from 'sequelize';
import db from '../../models/index';
import { BookingAdditionalService } from '../../B2C/models/booking_additional_service';
import { WashOrder } from '../../B2C/models/wash_order';
import {
  WashTypeConstant,
  WashWalletTransaction,
} from '../../B2C/models/wash_wallet_transaction';
import {
  TransactionType,
  WalletTransaction,
} from '../../B2C/models/wallet_transection';
import { UserWashWallet } from '../../B2C/models/user_wash_wallet';
import { Slot } from '../../B2C/models/slot';
import { getCancellationFeePercentage } from '../commonService';
import { UserWallet } from '../../B2C/models/user_wallet';
import { WalletService } from '../../B2C/walletModule/services/wallet.service';
import { CustomerSubscription } from '../../B2C/models/customer_subscription';
import { BookingService } from '../../B2C/bookingModule/services/booking.service';
import { CustomerNotification } from '../../B2C/models/customerNotification';
import { sendFirebaseNotificationWithData } from '../common/firebaseService/firebaseNotification';
import { VehicleType } from '../../B2C/models/vehicle';

export const deleteBooking = async () => {
  try {
    // Calculate the timestamp for four minute ago using moment
    const tenMinutesAgo = moment().subtract(4, 'minutes').toISOString();

    // Find all bookings with payment status 'Pending' and created more than ten minutes ago
    const bookingsToCancel = await Booking.findAll({
      where: {
        paymentStatus: 'Pending',
        createdAt: {
          [Op.lt]: tenMinutesAgo, // Only select bookings created before ten minutes ago
        },
      },
    });

    // Iterate over each booking that needs to be canceled
    for (const booking of bookingsToCancel) {
      // Start a transaction to ensure atomicity
      await db.sequelize.transaction(async (t: any) => {
        // Delete additional services
        await BookingAdditionalService.destroy({
          where: { bookingId: booking.bookingId },
          transaction: t,
        });

        // Find wash order associated with the booking
        const washOrder = await WashOrder.findByPk(booking.washOrderId, {
          transaction: t,
        });

        // Delete the booking
        await Booking.destroy({
          where: { bookingId: booking.bookingId },
          transaction: t,
        });

        // Delete the wash order
        if (washOrder) {
          await WashOrder.destroy({
            where: { washOrderId: washOrder.washOrderId },
            transaction: t,
          });
        }
      });
    }
  } catch (err) {
    // Handle error
    console.error('Error cancelling pending bookings:', err);
  }
};

const formatDateWithTimezone = (date: any) => {
  return date.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
};

export const deductWashFromRecentWallets = async () => {
  try {
    // Get the current date and the date 30 days ago
    const currentDate = moment();
    const pastDate = currentDate.clone().subtract(30, 'days');

    // Calculate the start and end of the target date in 'Asia/Kolkata' timezone
    const startOfTargetDate = pastDate.clone().startOf('day');
    const endOfTargetDate = pastDate.clone().endOf('day');

    const formattedStartOfTargetDate =
      formatDateWithTimezone(startOfTargetDate);
    const formattedEndOfTargetDate = formatDateWithTimezone(endOfTargetDate);

    // Subquery to find wallets with a debit transaction within the last 30 days
    const walletsWithDebit = await WashWalletTransaction.findAll({
      where: {
        type: TransactionType.DEBIT,
        createdAt: {
          [Op.gte]: formattedStartOfTargetDate,
        },
      },
      attributes: ['washWalletId'],
      group: ['washWalletId'],
    });

    const walletIdsWithDebit = walletsWithDebit.map(
      (transaction) => transaction.washWalletId
    );

    // Query for wallets created exactly 30 days ago and without a debit transaction
    const recentWallets = await UserWashWallet.findAll({
      where: {
        createdAt: {
          [Op.between]: [formattedStartOfTargetDate, formattedEndOfTargetDate], // createdAt exactly 30 days ago
        },
        washWalletId: {
          [Op.notIn]: walletIdsWithDebit, // Exclude wallets with debit transactions
        },
      },
    });

    // Deduct one wash from each wallet
    for (const wallet of recentWallets) {
      if (wallet.silverWash > 1) {
        wallet.silverWash -= 1;
        await wallet.save();
        // Making the transaction History
        await WashWalletTransaction.create({
          washWalletId: wallet.washWalletId,
          washBalance: 1,
          type: TransactionType.DEBIT,
          transactionType: TransactionType.FREE_WASH,
          washType: WashTypeConstant.SILVER,
        });
      }
    }

    return recentWallets;
  } catch (err) {
    // Handle error
    console.error('Error deducting wash from wallets:', err);
    throw err;
  }
};

export const cancelBooking = async () => {
  try {
    // Get the current date and time
    const currentTime = moment().toDate();

    // Calculate the date and time that is four hours before the current time
    const fourHoursBefore = moment(currentTime).subtract(4, 'hours').toDate();

    let bookingDetails = await Booking.findAll({
      where: {
        paymentStatus: Status.Completed,
        bookingStatus: Status.Confirmed,
      },
      include: [
        {
          model: Slot,
          where: {
            startDateTime: {
              [Op.lte]: fourHoursBefore,
            },
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      ],
    });

    for (const booking of bookingDetails) {
      const currentTime = new Date();
      const elapsedMinutes = Math.floor(
        (currentTime.getTime() - new Date(booking.createdAt).getTime()) / 60000
      );

      // Calculate the cancellation fee
      const feePercentage = getCancellationFeePercentage(elapsedMinutes);
      const feeAmount = (booking.paymentAmount * feePercentage) / 100;
      const amountToAddToWallet = booking.paymentAmount - feeAmount;

      (booking.bookingStatus = Status.Cancelled),
        (booking.cancellationAmount = feeAmount),
        await booking.save();

      // Incrementing the balance in the user's wallet
      await UserWallet.increment(
        { balance: amountToAddToWallet }, // `balance` here is the amount to be added to the existing balance
        {
          where: {
            customerId: booking.customerId, // Condition to match the user by their customerId
          },
        }
      );

      // Getting the user wallet data
      const walletData = await WalletService.getUserWallet(booking.customerId);

      // Making the transaction history
      await WalletTransaction.create({
        walletId: walletData.walletId,
        amount: amountToAddToWallet,
        type: TransactionType.CREDIT,
        bookingId: booking.bookingId,
        transactionType: TransactionType.REFUND,
      });
    }
  } catch (err) {
    // Handle error
    console.error('Error in cancel booking:', err);
    throw err;
  }
};

// Define the function to update expired subscriptions
export const updateExpiredSubscriptions = async () => {
  try {
    // Get the current date and time
    const now = new Date();
    // Calculate yesterday's date and time
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // Calculate the start of yesterday's day (midnight)
    const startOfDayYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    // Update the CustomerSubscription model to mark expired subscriptions
    await CustomerSubscription.update(
      { isExpired: true },
      {
        where: {
          expiryDate: {
            // Find subscriptions where the expiry date is greater than or equal to yesterday's start of day
            // and less than yesterday's date (i.e., expired yesterday)
            [Op.gte]: startOfDayYesterday,
            [Op.lt]: yesterday,
          },
        },
      }
    );

    // Find all expired subscriptions
    const expiredSubscriptions = await CustomerSubscription.findAll({
      where: {
        expiryDate: {
          [Op.gte]: startOfDayYesterday,
          [Op.lt]: yesterday,
        },
      },
    });

    let twoWheelerCustomerIds: any[] = [];

    let fourWheelerCustomerIds: any[] = [];

    // Categorize customer IDs based on vehicleType
    expiredSubscriptions.forEach((subscription) => {
      if (subscription.vehicleType === VehicleType.TWO_WHEELER) {
        twoWheelerCustomerIds.push(subscription.customerId);
      } else if (subscription.vehicleType === VehicleType.FOUR_WHEELER) {
        fourWheelerCustomerIds.push(subscription.customerId);
      }
    });

    // Update the UserWashWallet model to set all wash types to 0 for each customer
    await UserWashWallet.update(
      {
        silverWash: 0,
        goldWash: 0,
        platinumWash: 0,
      },
      {
        where: {
          customerId: {
            [Op.in]: twoWheelerCustomerIds,
          },
        },
      }
    );

    // Update the UserWashWallet model to set all wash types to 0 for each customer
    await UserWashWallet.update(
      {
        silverWashFourWheeler: 0,
        goldWashFourWheeler: 0,
        platinumWashFourWheeler: 0,
      },
      {
        where: {
          customerId: {
            [Op.in]: fourWheelerCustomerIds,
          },
        },
      }
    );

    const tokens: any = [];
    let description = 'Your subscription has expired';
    let title = 'Subscription Expired';

    // Send notifications to customers
    for (const subscription of expiredSubscriptions) {
      const customerId = subscription.customerId;

      // Creating the notification for customer
      await CustomerNotification.create({
        customerId: customerId,
        description: description,
        title: title,
      });

      // Getting the device token of one customer
      const deviceTokens: any = await BookingService.getCustomerDeviceToken(
        customerId
      );

      tokens.push(...deviceTokens);
    }

    // Making the notification data
    let notificationData: any = {
      type: 'Subscription Expired',
      id: '', // Set to an empty string instead of null
    };

    // If the customer has a device token, send a Firebase notification
    if (tokens.length) {
      sendFirebaseNotificationWithData(
        tokens,
        title,
        description,
        notificationData
      );
    }

    // Log a success message to the console
    // console.log(`Updated expired subscriptions successfully!`);
  } catch (error) {
    // Log an error message to the console if an error occurs
    console.error(`Error updating expired subscriptions`);
  }
};
