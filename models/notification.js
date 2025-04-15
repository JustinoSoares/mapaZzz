'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  notification.init({
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
      allowNull: false,
      primaryKey: true,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    lon: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    typeNotification: {
      type: DataTypes.ENUM('risco', 'surto', 'educação', 'alerta', 'clima'),
      allowNull: false,
      defaultValue: 'low'
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Users', // Nome da tabela referenciada
        key: 'id' // Chave primária da tabela referenciada
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    users: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    describe: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'notification',
  });
  return notification;
};