module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          notEmpty: { msg:  "Le nom ne peut pas être null!"},
          notNull: { msg:  "The name is required!"}
      }
    },
    code_user: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
          msg: 'This code is alredy taken'
      },
      validate: {
          notEmpty: { msg:  "Le code utilisateur ne peut pas être null!"},
          notNull: { msg:  "The code user is required!"}
      }
    },
    name_code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          notEmpty: { msg:  "Le Nom du code ne peut pas être null!"},
          notNull: { msg:  "The name code is required!"}
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          notEmpty: { msg:  "L'adresse ne peut pas être null!"},
          notNull: { msg:  "The address is required!"}
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false
  })
}