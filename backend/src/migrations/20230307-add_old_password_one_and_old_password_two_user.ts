'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface:any, Sequelize:any) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn(
        'user',
        'old_password_one',
        {
          type: Sequelize.STRING,
        }
      ),
      queryInterface.addColumn(
        'user',
        'old_password_two',
        {
          type: Sequelize.STRING,
        }
      )
    ]);
  },

  async down (queryInterface:any, Sequelize:any) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
