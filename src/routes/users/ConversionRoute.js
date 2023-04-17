const { Conversion, Unit } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const private_key = require('../../auth/private_key')
const manager = require('../../middlware/manager')

const createConversion = (app) => {
    app.post('/api/conversion', (auth, manager), (req, res) => {
        const authorizationHeader = req.headers.authorization
        
        let mon_id = null
        let _user = null

        if(authorizationHeader) {
            const token = authorizationHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {
                mon_id = decodedToken.userId
                _user = decodedToken._user
            })
        }

        Conversion.create({
            quantity_conv: parseInt(req.body.quantity_conv),
            EntryUnit: req.body.EntryUnit,
            OutUnit: req.body.OutUnit,
            action: mon_id,
        })
        .then(conversion => {
            const user_connecte = _user.code_user
            const message = `Le conversion ${req.body.name_prod} a bien été crée.`
            res.json({ user_connecte, message, data: conversion })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le conversion n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findConversionByPk = (app) => {
    app.get('/api/conversion/:id', (auth, manager), (req, res) => {
        Conversion.findByPk(req.params.id, { 
            include: [
                {
                    model: Unit,
                    as: 'UniterEntrer'
                },
                {
                    model: Unit,
                    as: 'UniterSortie'
                }
            ]
        })
        .then(conversion => {
            if(conversion === null) {
                const message = "Le conversion demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un conversion a bien été trouvé.'
                res.json({ message, data: conversion })
            }
        })
        .catch(error => {
            const message = "Le conversion n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllConversion = (app) => {
    app.get('/api/conversion', (auth, manager), (req, res) => {
        const authorizationHeader = req.headers.authorization

        let mon_id = null
        let _user = null

        if(authorizationHeader) {
            const token = authorizationHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {
                mon_id = decodedToken.userId
                _user = decodedToken._user
            })
        }
        
        if(req.query.name) {
            const name = req.query.name
            const limit = parseInt(req.query.limit) || 5

            if(name.length < 2) {
                const message = "Le terme de recherche doit contenir au moins 2 caractére"
                res.status(400).json({message, data: error})
            } else {
                return Conversion.findAndCountAll(
                    { 
                        where: { 
                            name_prod: {
                                [Op.like]: `%${name}%`
                            },
                            action: mon_id,
                            visibility: true
                        },
                        order: ['id'],
                        limit: limit,
                        include: [
                            {
                                model: Unit,
                                as: 'UniterEntrer'
                            },
                            {
                                model: Unit,
                                as: 'UniterSortie'
                            }
                        ]
                    }
                )
                .then(({count, rows}) => {
                    const message = `Il y a ${count} conversion au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
        } else {

            Conversion.findAll( 
                { 
                    where: {
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    include: [
                        {
                            model: Unit,
                            as: 'UniterEntrer'
                        },
                        {
                            model: Unit,
                            as: 'UniterSortie'
                        }
                    ]
                }
            )
            .then(conversions => {
                const user_connecte = _user.code_user
                const message = 'La liste des conversions a bien été récupérée.'
                res.json({ user_connecte, message, data: conversions })
            })
            .catch(error => {
                const message = "Les listes des conversions n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

const updateConversion = (app) => {
    app.put('/api/conversion/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        Conversion.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return Conversion.findByPk(id).then(conversion => {
                if(conversion === null) {
                    const message = "Le conversion demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `Le conversion ${conversion.id} a bien été modifié.`
                    res.json({message, data: conversion })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le conversion n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteConversion = (app) => {
    app.delete('/api/product/:id', (auth, manager), (req, res) => {
        Conversion.findByPk(req.params.id).then(conversion => {

            if(conversion === null) {
                const message = "Le conversion demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const conversionDeleted = conversion;
                
                Conversion.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: conversion.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le conversion avec l'identifiant n°${conversionDeleted.id} a bien été supprimé.`
                    res.json({message, data: conversionDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le conversion n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createConversion, findConversionByPk, findAllConversion, updateConversion, deleteConversion }