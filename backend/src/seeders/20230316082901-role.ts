'use strict'

import { QueryInterface, Sequelize } from 'sequelize'

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert(
      'role',
      [
        {
          name: 'SUPER_ADMIN',
          description: 'Admin',
        },
        {
          name: 'ADMIN',
          description: 'Admin',
        },
        {
          name: 'FEEDBACK_AGENT',
          description: 'Feedback Agent',
        },
        {
          name: 'AREA_MANAGER',
          description: 'Area Manager',
        },
        {
          name: 'OEM',
          description: 'OEM',
        },
        {
          name: 'DEALER',
          description: 'Dealer',
        },
        {
          name: 'EMPLOYEE',
          description: 'Employee',
        },
      ],
      {}
    )
  },

  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  },
}
