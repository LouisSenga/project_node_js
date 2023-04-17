module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Provider', {
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
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le prenom ne peut pas être null!"},
                notNull: { msg:  "The firstname is required!"}
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'This email is alredy taken'
            },
            validate: {
                isEmail: { msg: "L'email n'est pas valide!" },
                notNull: { msg:  "The email is required!"}
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "L'adressse ne peut pas être null!"},
                notNull: { msg:  "The address is required!"}
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg:  "Le phone ne peut pas être null!"},
                notNull: { msg:  "The phone is required!"},
                is: /^(032|034|038|033|\+261)\d+$/
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