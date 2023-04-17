module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Auth', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                min: {
                    args: [4],
                    msg: 'Le taille de votre mot de passe devrais dépasser le 4 caractère'
                }
            }
        }
    })
}