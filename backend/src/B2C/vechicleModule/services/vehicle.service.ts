import { Vehicle } from '../../models/vehicle';
import { CreateVehicleDTO } from '../dto/vechicle.dto';

class VehicleService {
  async addVehicle(body: CreateVehicleDTO, customerId: string) {
    try {
      // Creating the new vehicle entry in to data base
      return await Vehicle.create({
        hsrpNumber: body.hsrpNumber,
        manufacturer: body.manufacturer,
        vehicleModel: body.vehicleModel,
        vehicleType: body.vehicleType,
        imageUrl: body.imageUrl,
        customerId: customerId,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateVehicle(body: CreateVehicleDTO, vehicleId: string) {
    try {
      // Updating  the existing vehicle data in to database
      return await Vehicle.update(
        {
          hsrpNumber: body.hsrpNumber,
          manufacturer: body.manufacturer,
          vehicleModel: body.vehicleModel,
          vehicleType: body.vehicleType,
          imageUrl: body.imageUrl,
        },
        {
          where: {
            vehicleId: vehicleId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async getVehicle(vehicleId: string) {
    try {
      // Getting the one vehicle details from database
      return await Vehicle.findOne({
        where: {
          vehicleId: vehicleId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getVehicles(customerId: string) {
    try {
      // Getting the All vehicle details for current user
      return await Vehicle.findAll({
        where: {
          customerId: customerId,
          isDeleted:false

        },
        order: [['createdAt', 'DESC']],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async deleteVehicle(vehicleId: string) {
    try {
      // Updating  the existing vehicle data in to database
      return await Vehicle.update(
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          where: {
            vehicleId: vehicleId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const CustomerVehicleService = new VehicleService();
export { CustomerVehicleService };
