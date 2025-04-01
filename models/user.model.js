module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4, // Gera UUID automaticamente
            allowNull: false,
            primaryKey: true,
          },
      name: DataTypes.STRING,
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        password: DataTypes.STRING,
        lat: {
            type: DataTypes.DECIMAL(10, 8)
        },
        lon: {
            type: DataTypes.DECIMAL(11, 8)
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Angola',
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
    }, {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'    
    });
    return User;
  };
  