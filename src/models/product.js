module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name_prod: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le nom ne peut pas être null!"},
                notNull: { msg:  "The name is required!"}
            }
        },
        quantity_prod: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                notEmpty: { msg:  "Le quantiter ne peut pas être null!"},
                notNull: { msg:  "The quantity is required!"}
            }
        },
        action: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        visibility: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: true
        }
    })
}