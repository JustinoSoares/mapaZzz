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
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users', // Nome da tabela referenciada
          key: 'id' // Chave primária da tabela referenciada
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      users: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
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