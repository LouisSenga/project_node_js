const { Auth, User, ServiceSupply, Rule } = require('../db/sequelize')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const privatekey = require('../auth/private_key')
const auth = require('../auth/auth')
const admin = require('../middlware/admin')

const login = (app) => {
  app.post('/api/login', (req, res) => {
        Auth.findOne({ where: { email: req.body.email } }).then(auth => {
            
            if(!auth) {
                const message = "L'utilisateur demandé n'existe pas "
                return res.status(404).json({ message })
            }

            bcrypt.compare(req.body.password, auth.password).then(isPasswordValid => {
                if(!isPasswordValid) {
                    const message = `Le mot de passe est incorrect`;
                    return res.status(401).json({ message })
                }
                
                User.findOne({ where: { id: auth.UserId } }).then(user => {
                    if(auth.RuleId == 1 || auth.RuleId == 2) {
                        ServiceSupply.findOne({ where: { code_serv: user.code_user } }).then(servicesupply => {

                            const token = jwt.sign(
                                { 
                                    userId: servicesupply.id,
                                    rule: auth.RuleId,
                                    _user: user 
                                },
                                privatekey,
                                { expiresIn: '24h' }
                            )

                            const message = `L'utilisateur est connecté avec succès`;
                            return res.json({ message, data: auth, token })
                        }).catch(error => {
                            return res.status(400).json({ message: error.message})
                        })
                    } else {
                        const token = jwt.sign(
                            { userId: user.id,
                                rule: auth.RuleId,
                                _user: user 
                            },
                            privatekey,
                            { expiresIn: '24h' }
                        )
                        const message = `L'utilisateur est connecté avec succès`;
                        return res.json({ message, data: auth, token })

                    }
                }).catch(error => {
                    return res.status(400).json({ message: error.message, data: error })
                })
            })
        })
        .catch(error => {
            const message = `L'utilisateur n'a pas pu se connecté. Réessayez plus tard!`;
            return res.json({ message, data: error })
        })
  })
}

const createAuth = (app) => {
    app.post('/api/create/auth', (auth, admin), (req, res) => {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {

            Auth.findAndCountAll({ 
                where: { 
                    UserId: req.body.UserId
                }
            }).then(({count, rows}) => {
                if(count > 0) {
                    const message = `L'utilisateur que vous aviez entrer a déjà un compte`
                    return res.status(401).json({ message })
                } else {
                    Auth.create({
                        email: req.body.email,
                        password: hash,
                        UserId : req.body.UserId,
                        RuleId : req.body.RuleId
                    })
                    .then(auth => {
                        const message = `L'utilisateur a été crée avec succès`;
                        return res.json({ message, data: auth })
                    })
                    .catch(error => {
                        return res.status(400).json({ message: error.message, data: error })
                    })
                }
            }).catch(error => {
                return res.status(400).json({ message: error.message, data: error })
            })
        })
        .catch(error => {
            console.log(error)
        })
    })
}

const findAllAuth = (app) => {
    app.get('/api/create/auth', (auth, admin), (req, res) => {
        Auth.findAndCountAll({
            include: [
                { model: User },
                { model: Rule }
            ]
        }).then(({count, rows}) => {
            const message = `Listes des comptes des utilisateurs, contient: ${count} compte`
            // res.json({ message, data: rows.map(item => [item.email])})

            res.json({ message, data: rows})
        }).catch(error => {
            const message = `Impossible de trouver les listes des comptes, Réessayez plus tard!`
            return res.status(500).json({ message, data: error })
        })
    })
}

const findOneAuth = (app) => {
    app.get('/api/create/auth/:id', (auth, admin), (req, res) => {
        Auth.findByPk(req.params.id, {
            include: [
                { model: User },
                { model: Rule }
            ]
        }).then((auth) => {
            const message = `Compte recuperer avec succé`
            res.json({ message, data: auth})
        }).catch(error => {
            const message = `Impossible de trouver les listes des comptes, Réessayez plus tard!`
            return res.status(500).json({ message, data: error })
        })
    })
}

const updateAuth = (app) => {
    app.put('/api/create/auth/:id', (auth, admin), (req, res) => {

        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const id = req.params.id

            Auth.update({
                email: req.body.email,
                password: hash,
                RuleId: req.body.RuleId
            }, {
                where: { id: id }
            })
            .then(_ => {
                return Auth.findByPk(id).then(auth => {
                    if(auth === null) {
                        const message = "Le compte demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                        res.status(404).json({message})
                    } else {
                        const message = `Le compte ${auth.email} a bien été modifié.`
                        res.json({message, data: auth })
                    }
                })
            })
            .catch(error => {
                if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                } else {
                    const message = "Le compte n'a pas pu être modifié. Réessayez plus tard😎"
                    res.status(500).json({message, data: error})
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
    })
}

const deleteAuth = (app) => {
    app.delete('/api/create/auth/:id', (auth, admin), (req, res) => {
        Auth.findByPk(req.params.id).then(auth => {

            if(auth === null) {
                const message = "Le compte demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const authDeleted = auth;
            
                Auth.destroy({
                    where: { id: auth.id }
                })
                .then(_ => {
                    const message = `Le compte avec l'identifiant n°${authDeleted.id} a bien été supprimé.`
                    res.json({message, data: authDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le compte n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { login, createAuth, findAllAuth, findOneAuth, updateAuth, deleteAuth }