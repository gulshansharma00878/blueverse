'use strict'
const machineGuidStringLimit = 30
const skuNumberStringLimit = 100
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface
      .createTable('transactions', {
        Guid: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        MachineGuid: {
          allowNull: false,
          type: Sequelize.STRING(machineGuidStringLimit),
        },
        PHValue: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        TDSValue: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        ElectricityUsed: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        ElectricityPrice: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        FoamUsed: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        FoamPrice: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        ShampooUsed: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        ShampooPrice: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WaxUsed: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WaxPrice: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WaterUsed: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WaterWastage: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WaterPrice: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        CODValue: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        TSSValue: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        OilAndGreaseValue: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WashTypeGuid: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        WashTypePrice: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WashTime: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        BusinessModeGuid: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        IsWashCompleted: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        AddDate: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        ElectricityTotalUsage: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        Volt_R_N_IOT: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        Volt_Y_N_IOT: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        Volt_B_N_IOT: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        WashCounter: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        SerialNo: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        SkuNumber: {
          allowNull: false,
          type: Sequelize.STRING(skuNumberStringLimit),
        },
        QRGenerated: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      })
      .then(async () => {
        await queryInterface.addIndex('transactions', ['SkuNumber'])
      })
  },
  async down(queryInterface: any, Sequelize: any) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
}
