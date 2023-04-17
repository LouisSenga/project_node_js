module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Unite', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name_unit: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le nom ne peut pas être null!"},
                notNull: { msg:  "The name is required!"}
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