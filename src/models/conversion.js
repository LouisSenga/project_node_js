module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Conversion', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity_conv: {
            type: DataTypes.INTEGER,
            allowNull: false,
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