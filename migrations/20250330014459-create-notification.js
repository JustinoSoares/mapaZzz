'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      lon: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      typeNotification: {
        type: Sequelize.ENUM('risco', 'surto', 'educação', 'alerta', 'clima'),
        allowNull: false,
        defaultValue: 'alerta'
      },
      describe: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('notifications');
  }
};