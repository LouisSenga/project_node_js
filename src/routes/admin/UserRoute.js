const { User } = require('../../db/sequelize')
const jwt = require('jsonwebtoken')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const admin = require('../../middlware/admin')
const private_key = require('../../auth/private_key')

const createUser = (app) => {
    app.post('/api/user', (auth, admin), (req, res) => {
        User.create(req.body)
        .then(user => {
            const message = `L'utilisateur ${req.body.name} a bien été crée.`
            res.json({ message, data: user })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "L'utilisateur n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteUser = (app) => {
    app.delete('/api/user/:id', (auth, admin), (req, res) => {
        User.findByPk(req.params.id).then(user => {

            if(user === null) {
                const message = "L'utilisateur demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const userDeleted = user;
            
                User.destroy({
                    where: { id: user.id }
                })
                .then(_ => {
                    const message = `Le pokémon avec l'identifiant n°${userDeleted.id} a bien été supprimé.`
                    res.json({message, data: userDeleted })
                })
            }
        })
        .catch(error => {
            const message = "L'utilisateur n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllUser = (app) => {
    app.get('/api/user', (auth, admin), (req, res) => {

        const authorizationHeader = req.headers.authorization

        let mon_id = null

        if(authorizationHeader) {
            const token = authorizationHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {
                mon_id = decodedToken.userId
            })
        }

        if(req.query.name) {
            const name = req.query.name
            const limit = parseInt(req.query.limit) || 5

            if(name.length < 2) {
                const message = "Le terme de recherche doit contenir au moins 2 caractére"
                res.status(400).json({message, data: error})
            } else {
                return User.findAndCountAll({ 
                    where: { 
                        name: {
                            [Op.like]: `%${name}%`
                        }
                    },
                    order: ['name'],
                    limit: limit 
                })
                .then(({count, rows}) => {
                    const message = `Il y a ${count} utlisateurs au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
        } else {

            User.findAll( { order: ['id'] } )
                .then(users => {
                    const message = 'La liste des utlisateurs a bien été récupérée.'
                    res.json({ message, data: users, _id: mon_id })
                })
                .catch(error => {
                    const message = "Les listes des utilisateurs n'a pas pu être récuperée. Réessayez plus tard😎"
                    res.status(500).json({message, data: error})
                })

        }
    })
}

const findUserByPk = (app) => {
    app.get('/api/user/:id', (auth, admin), (req, res) => {
        User.findByPk(req.params.id)
        .then(user => {
            if(user === null) {
                const message = "L'utilisateur demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un utilisateur a bien été trouvé.'
                res.json({ message, data: user })
            }
        })
        .catch(error => {
            const message = "L'utilisateur n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const updateUser = (app) => {
    app.put('/api/user/:id', (auth, admin), (req, res) => {

        const id = req.params.id

        User.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return User.findByPk(id).then(user => {
                if(user === null) {
                    const message = "L'utilisateur demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `L'utilisateur ${user.name} a bien été modifié.`
                    res.json({message, data: user })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "L'utilisateur n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

module.exports = {createUser, deleteUser, findAllUser, findUserByPk, updateUser}