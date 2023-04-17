module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ServiceSupply', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name_serv: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le nom de la service ne peut pas être null!"},
                notNull: { msg:  "The name of service is required!"}
            }
        },
        code_serv: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le code de la service ne peut pas être null!"},
                notNull: { msg:  "The code of service is required!"}
            }
        },
        visibility: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: true
        }
    })
}