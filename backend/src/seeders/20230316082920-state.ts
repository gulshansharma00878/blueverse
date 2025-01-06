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
      'state',
      [
        {
          name: 'UTTAR_PRADESH',
          description: 'Uttar Pradesh',
          region_id: 'region_id',
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
