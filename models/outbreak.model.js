'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class outbreak extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  outbreak.init({
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
    }
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
    modelName: 'outbreak',
  });
  return outbreak;
};