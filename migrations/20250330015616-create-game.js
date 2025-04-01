'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      ask: {
        type: Sequelize.STRING
      },
      answer_right: {
        type: Sequelize.STRING,
        allowNull: false
      },
      answer_wrong_1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      answer_wrong_2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      answer_wrong_3: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('games');
  }
};