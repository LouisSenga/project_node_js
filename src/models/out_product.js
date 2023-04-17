module.exports = (sequelize, DataTypes) => {
    return sequelize.define('OutProduct', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity_out: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le quantiter ne peut pas être null!"},
                notNull: { msg:  "The quantity is required!"}
            }
        },
        date_out: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        visibility: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: true
        }
    })
}