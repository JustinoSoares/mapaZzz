'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  game.init({
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
      allowNull: false,
      primaryKey: true,
    },
    ask: {
      type: DataTypes.STRING
    },
    answer_right: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answer_wrong_1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answer_wrong_2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answer_wrong_3: {
      type: DataTypes.STRING,
      allowNull: false
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
    modelName: 'game',
  });
  return game;
};