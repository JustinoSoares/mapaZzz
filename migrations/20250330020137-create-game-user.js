'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_users', {
      id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      status: {
           type: Sequelize.ENUM('right',  'wrong'),
          defaultValue: 'wrong'
      },
      gameId: {
        type: Sequelize.STRING,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('game_users');
  }
};