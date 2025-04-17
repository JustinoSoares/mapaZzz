
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class help extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  help.init({
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('waiting', 'answered'),
      defaultValue: 'waiting'
    },
    kind : {
      type: DataTypes.ENUM('help', 'helpOrganization'),
      defaultValue: 'help'
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

  }, {
    sequelize,
    modelName: 'help',
  });
  return help;
};