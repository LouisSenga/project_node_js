module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Deliver', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity_deliver: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le quantiter ne peut pas être null!"},
                notNull: { msg:  "The quantity is required!"}
            }
        },
        date_deliver: {
            type: DataTypes.DATEONLY,
            allowNull: false
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