'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outbreaks', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      describe: {
        type: Sequelize.STRING
      },
      lat : {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      lon : {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,

      },
      dangerZoneId: {
        type: Sequelize.STRING,
        references: {
          model: 'danger_zones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('outbreaks');
  }
};