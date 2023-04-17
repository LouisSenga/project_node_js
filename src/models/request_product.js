module.exports = (sequelize, DataTypes) => {
    return sequelize.define('RequestProduct', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name_product: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le nom ne peut pas être null!"},
                notNull: { msg:  "The name is required!"}
            }
          },
        quantity_ask: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le quantiter ne peut pas être null!"},
                notNull: { msg:  "The quantity is required!"}
            }
        },
        quantity_left: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le quantiter ne peut pas être null!"},
                notNull: { msg:  "The quantity is required!"}
            }
        },
        date_ask: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        visibility: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: true
        }
    })
}