'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class municipatily extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  municipatily.init({
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
      allowNull: false,
      primaryKey: true,
    },
    name: {
     type: DataTypes.STRING,
      allowNull: false,
    } ,
    email: {
     type : DataTypes.STRING,
     unique: true,
     allowNull: false,
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
    modelName: 'municipatily',
  });
  return municipatily;
};