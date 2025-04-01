'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alert_to_municipatilies', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      describe: {
        type: Sequelize.STRING
      },
      typeAlert : {
        type: Sequelize.ENUM('risco', 'surto', 'alerta', 'clima'),
        allowNull: false,
        defaultValue: 'alerta'
      },
      gravity: {
        type: Sequelize.ENUM('down', 'medium', 'up'),
        allowNull: false,
      },
      lat : {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      lon : {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      address : {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('alert_to_municipatilies');
  }
};