'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class danger_zone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  danger_zone.init({
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
      allowNull: false,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'low'
    }, 
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    lat: DataTypes.DECIMAL(10, 8), 
    lon: DataTypes.DECIMAL(11, 8), 
    confirmations: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }, 
    objectsFinds: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    how_to_help: {
      type: DataTypes.STRING,
      defaultValue: ''
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
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'danger_zone',
  });
  return danger_zone;
};