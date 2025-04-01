'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class alert_to_municipatily extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  alert_to_municipatily.init({
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
      allowNull: false,
      primaryKey: true,
    },
    describe: DataTypes.STRING,
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    typeAlert: {  
      type: DataTypes.ENUM('risco', 'surto',  'alerta', 'clima'),
      allowNull: false,
    },

    gravity: {
      type: DataTypes.ENUM('down', 'medium', 'up'),
      allowNull: false,
    },

    lon: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    dangerZoneId: {
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
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
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
    modelName: 'alert_to_municipatily',
  });
  return alert_to_municipatily;
};