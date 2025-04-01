'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class confirmation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  confirmation.init({
    
    dangerZoneId: {
      id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
        allowNull: false,
        primaryKey: true,
      },
      type: DataTypes.STRING,
      references: {
        model: 'danger_zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    userId: {
      type: DataTypes.STRING,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    status: {
      type: DataTypes.ENUM('yes', 'no', 'no_yet'),
      defaultValue: 'yes'
    },
    description: DataTypes.STRING
    , createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
    , updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'confirmation',
  });
  return confirmation;
};