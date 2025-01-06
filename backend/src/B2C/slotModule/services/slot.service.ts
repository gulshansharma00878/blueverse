import { Op } from 'sequelize';
import { Slot } from '../../models/slot';
import { Booking, Status } from '../../models/booking';

class SlotServices {
  async getBookedSlot(date: string, merchantId: string) {
    try {
      // Create a start date with time set to 00:00:00.000
      const startDateTime = new Date(date);
      startDateTime.setHours(0, 0, 0, 0);

      // Create an end date with time set to 23:59:59.999
      const endDateTime = new Date(date);
      endDateTime.setHours(23, 59, 59, 999);

      // Retrieve all slots that fall within the start and end date/time
      let slotData: any = await Slot.findAll({
        where: {
          startDateTime: {
            [Op.gte]: startDateTime,
            [Op.lte]: endDateTime,
          },
          merchantId: merchantId,
        },
      });

      // If there are slots found
      if (slotData.length) {
        let slotDataArray: any[] = [];

        // Loop through each slot to get the booking data
        for (let i in slotData) {
          let slotObject: any;

          // Find all bookings for the current slot
          const bookingData = await Booking.findAll({
            where: {
              slotId: slotData[i].slotId,
              bookingStatus: {
                [Op.ne]: Status.Cancelled,
              },
            },
          });

          // If there are bookings for the current slot
          if (bookingData.length) {
            slotObject = slotData[i].dataValues;
            // Add the number of bookings to the slot object
            slotObject.noOfBooking = bookingData.length;
            // Push the slot object to the result array
            slotDataArray.push(slotObject);
          }
        }

        // Return the array of slots with booking information
        return slotDataArray;
      } else {
        // If no slots are found, return an empty array
        return slotData;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const SlotService = new SlotServices();
export { SlotService };
