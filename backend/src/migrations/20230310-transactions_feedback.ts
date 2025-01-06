'use strict'
const nameStringLimit = 100
const skuNumberLimit = 300
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
      .createTable('transactions_feedback', {
        transaction_feedback_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        transaction_guid: {
          allowNull: false,
          unique: true,
          references: { model: 'transactions', key: 'Guid' },
          type: Sequelize.UUID,
        },
        name: {
          type: Sequelize.STRING(nameStringLimit),
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING(nameStringLimit),
          allowNull: true,
        },
        email_id: {
          type: Sequelize.STRING(nameStringLimit),
          allowNull: true,
        },
        hsrp_number: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        manufacturer: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        bike_model: {
          type: Sequelize.STRING(nameStringLimit),
          allowNull: true,
        },
        sku_number: {
          type: Sequelize.STRING(skuNumberLimit),
          allowNull: false,
          unique: true,
        },
        is_completed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        },
        transaction_type: {
          type: Sequelize.STRING(nameStringLimit),
          allowNull: false,
        },
        is_profile_completed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        completed_at: {
          allowNull: true,
          type: Sequelize.DATE,
        },
      })
      .then(() => {
        queryInterface.addIndex('transactions_feedback', ['email_id'])
        queryInterface.addIndex('transactions_feedback', ['phone'])
        queryInterface.addIndex('transactions_feedback', ['hsrp_number'])
        queryInterface.addIndex('transactions_feedback', ['transaction_type'])
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
