const { Unit } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const private_key = require('../../auth/private_key')
const manager = require('../../middlware/manager')

const createUnit = (app) => {
    app.post('/api/unit', (auth, manager), (req, res) => {
        const authorizationHeader = req.headers.authorization
        
        let mon_id = null

        if(authorizationHeader) {
            const token = authorizationHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {
                mon_id = decodedToken.userId
            })
        }

        Unit.create({
            name_unit: req.body.name_unit, 
            action: mon_id
        })
        .then(unit => {
            const message = `L'unité ${req.body.name_unit} a bien été crée.`
            res.json({ message, data: unit })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "L'unité n'a pas pu être ajouté. Réessayez plus tard 😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findAllUnit = (app) => {
    app.get('/api/unit', (auth, manager), (req, res) => {
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
                return Unit.findAndCountAll({ 
                    where: { 
                        name_unit: {
                            [Op.like]: `%${name}%`
                        },
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    limit: limit 
                })
                .then(({count, rows}) => {
                    const message = `Il y a ${count} unité au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
 
        } else {

            Unit.findAll( { 
                where: {
                    action: mon_id,
                    visibility: true
                },
                order: ['id'] 
            } )
            .then(unit => {
                const message = 'La liste des unitées a bien été récupérée.'
                res.json({ message, data: unit })
            })
            .catch(error => {
                const message = "Les listes des unitées n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })
        }
    })
}

const findUnitByPk = (app) => {
    app.get('/api/unit/:id', (auth, manager), (req, res) => {
        Unit.findByPk(req.params.id)
        .then(unit => {
            if(unit === null) {
                const message = "L'unité demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un unité a bien été trouvé.'
                res.json({ message, data: unit })
            }
        })
        .catch(error => {
            const message = "L'unité n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const updateUnit = (app) => {
    app.put('/api/unit/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        Unit.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return Unit.findByPk(id).then(unit => {
                if(unit === null) {
                    const message = "L'unité demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `La categorie ${unit.name_unit} a bien été modifié.`
                    res.json({message, data: unit })
                } 
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "L'unité n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteUnit = (app) => {
    app.delete('/api/unit/:id', (auth, manager), (req, res) => {
        Unit.findByPk(req.params.id).then(unit => {

            if(unit === null) {
                const message = "L'unité demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const unitDeleted = unit;
            
                // Unit.destroy({
                //     where: { id: unit.id }
                // })

                Unit.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: unit.id
                        }
                    }
                )
                .then(_ => {
                    const message = `L'unité avec l'identifiant n°${unitDeleted.id} a bien été supprimé.`
                    res.json({message, data: categoryDeleted })
                })
            }
        })
        .catch(error => {
            const message = "L'unité n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createUnit, deleteUnit, findAllUnit, findUnitByPk, updateUnit }