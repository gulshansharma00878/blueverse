'use strict'
const usernameStringLimit = 100
const countryCodeLimit = 8
const addressStringLimit = 200
module.exports = {
  up: (queryInterface: any, Sequelize: any) => {
    return queryInterface
      .createTable('user', {
        user_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        username: {
          type: Sequelize.STRING(usernameStringLimit),
        },
        first_name: {
          type: Sequelize.STRING(usernameStringLimit),
          allowNull: false,
        },
        last_name: {
          type: Sequelize.STRING(usernameStringLimit),
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(usernameStringLimit),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.INTEGER,
          unique: true,
          allowNull: false,
        },
        country_code: {
          type: Sequelize.STRING(countryCodeLimit),
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING(addressStringLimit),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
      })
      .then(() => {
        queryInterface.addIndex('user', ['email'])
        queryInterface.addIndex('user', ['phone'])
      })
  },
  down: (queryInterface: any, Sequelize: any) => {
    return queryInterface.dropTable('user')
  },
}
