'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('danger_zones', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      level : {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        defaultValue: 'low'
      },
      description : {
        type: Sequelize.STRING
      },
      address : {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lat : {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      lon : {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING
      },
      confirmations: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      objectsFinds: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      how_to_help: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      userId: {
        type: Sequelize.STRING,
        references: {
          model: 'Users',
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
    await queryInterface.dropTable('danger_zones');
  }
};