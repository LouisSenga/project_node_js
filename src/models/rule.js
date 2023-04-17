module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Rule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rule: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })
}