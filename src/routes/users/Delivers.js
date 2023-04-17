const { Deliver, Provider, Product, Conversion } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const private_key = require('../../auth/private_key')
const manager = require('../../middlware/manager')

const createDeliver = (app) => {
    app.post('/api/deliver', (auth, manager), (req, res) => {
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

        Deliver.create({
            quantity_deliver: parseInt(req.body.quantity_deliver),
            ProviderId: req.body.ProviderId, 
            ProductId: req.body.ProductId,
            ConversionId: req.body.ConversionId,
            date_deliver: req.body.date_deliver,
            action: mon_id,
        })
        .then(deliver => {

            Promise.all([
                Conversion.findByPk(deliver.ConversionId),
                Product.findByPk(req.body.ProductId)
            ]).then(([conversion, product]) => {
                
                let new_qt_prod = product.quantity_prod + (parseInt(req.body.quantity_deliver) * conversion.quantity_conv)

                Product.update(
                    {
                        quantity_prod: new_qt_prod
                    },
                    {
                        where: {
                            id: req.body.ProductId
                        }
                    }
                )
            })

            const user_connecte = _user.code_user

            const message = `Le saisie de livraison ${deliver.id} a bien été crée.`
            res.json({ user_connecte, message, data: deliver })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le ssaisie de livraison n'a pas pu être ajouté. Réessayez plus tard 😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findDeliverByPk = (app) => {
    app.get('/api/deliver/:id', (auth, manager), (req, res) => {
        Deliver.findByPk(req.params.id, { 
            include: [
                {
                    model: Provider,
                },
                {
                    model: Conversion
                },
                {
                    model: Product
                }
            ]
        })

        .then(deliver => {
            if(deliver === null) {
                const message = "Le saisie de livraison demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un saisie de livraison a bien été trouvé.'
                res.json({ message, data: deliver })
            }
        })
        .catch(error => {
            const message = "Le saisie de livraison n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllDeliver = (app) => {
    app.get('/api/deliver', (auth, manager), (req, res) => {
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
            const limit = parseInt(req.query.limit) || 5

            return Deliver.findAndCountAll(
                { 
                    where: { 
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    limit: limit,
                    include: [
                        {
                            model: Provider,
                        },
                        {
                            model: Conversion
                        },
                        {
                            model: Product
                        }
                    ]
                }
            )
            .then(({count, rows}) => {
                const message = `Il y a ${count} saisie de livraison au terme de recherche ${name}`
                res.json({ message, data: rows })
            })
        } else {

            Deliver.findAll( 
                { 
                    where: {
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    include: [
                        {
                            model: Provider,
                        },
                        {
                            model: Product
                        },
                        {
                            model: Conversion
                        }
                    ]
                }
            )
            .then(delivers => {
                const user_connecte = _user.code_user
                const message = 'La liste des saisies de livraison a bien été récupérée.'
                res.json({ user_connecte, message, data: delivers })
            })
            .catch(error => {
                const message = "Les listes des saisies de livraison n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error, _id: mon_id})
            })

        }
    })
}

const updateDeliver = (app) => {
    app.put('/api/deliver/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        Deliver.update(req.body, {
            where: { id: id }
        })
        .then(_ => {
            return Deliver.findByPk(id).then(deliver => {
                if(deliver === null) {
                    const message = "Le saisie de livraison demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `Le saisie de livraison ${deliver.id} a bien été modifié.`
                    res.json({message, data: deliver })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le saisie de livraison n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteDeliver = (app) => {
    app.delete('/api/deliver/:id', (auth, manager), (req, res) => {
        Deliver.findByPk(req.params.id).then(deliver => {

            if(deliver === null) {
                const message = "Le saisie de livraison demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const deliverDeleted = deliver;
                
                Deliver.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: deliver.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le saisie de livraison avec l'identifiant n°${deliverDeleted.id} a bien été supprimé.`
                    res.json({message, data: deliverDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le saisie de livraison n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createDeliver, findDeliverByPk, findAllDeliver, updateDeliver, deleteDeliver }