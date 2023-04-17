const { RequestProduct, User, ServiceSupply } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const _user = require('../../middlware/user')
const private_key = require('../../auth/private_key')

const createRequestProduct = (app) => {
    app.post('/api/requestproduct', (auth, _user), (req, res) => {
        const authorizationHeader = req.headers.authorization
        
        let mon_id = null

        if(authorizationHeader) {
            const token = authorizationHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {
                mon_id = decodedToken.userId
            })
        }

        RequestProduct.create({
            name_product: req.body.name_product,
            quantity_ask: parseInt(req.body.quantity_ask),
            quantity_left: parseInt(req.body.quantity_left),
            UserId: mon_id, 
            ServiceSupplyId: req.body.ServiceSupplyId,
            date_ask: req.body.date_ask
        })
        .then(requestproduct => {
            const message = `Le demande de produit ${requestproduct.id} a bien été crée.`
            res.json({ message, data: requestproduct })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le demande de produit n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findRequestProductByPk = (app) => {
    app.get('/api/requestproduct/:id', (auth, _user), (req, res) => {
        RequestProduct.findByPk(req.params.id, { 
            include: [
                {
                    model: User,
                },
                {
                    model: ServiceSupply
                }
            ]
        })

        .then(requestproduct => {
            if(requestproduct === null) {
                const message = "Le demande de produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un demande de produit a bien été trouvé.'
                res.json({ message, data: requestproduct })
            }
        })
        .catch(error => {
            const message = "Le demande de produit n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllRequestProduct = (app) => {
    app.get('/api/requestproduct', (auth, _user), (req, res) => {
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
                return RequestProduct.findAndCountAll(
                    { 
                        where: { 
                            name_product: {
                                [Op.like]: `%${name}%`
                            },
                            UserId: mon_id,
                            visibility: true
                        },
                        order: ['id'],
                        limit: limit,
                        include: [
                            {
                                model: User,
                            },
                            {
                                model: ServiceSupply
                            }
                        ]
                    }
                )
                .then(({count, rows}) => {
                    const message = `Il y a ${count} demande de produit au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
        } else {

            RequestProduct.findAll( 
                { 
                    where: {
                        UserId: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    include: [
                        {
                            model: User,
                        },
                        {
                            model: ServiceSupply
                        }
                    ]
                }
            )
            .then(requestproducts => {
                const message = `${_user.code_user} connecté: La liste des demandes de produit a bien été récupérée.`
                res.json({ message, data: requestproducts })
            })
            .catch(error => {
                const message = "Les listes des demandes de produit n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

const updateRequestProduct = (app) => {
    app.put('/api/requestproduct/:id', (auth, _user), (req, res) => {

        const id = req.params.id

        RequestProduct.update(req.body, {
            where: { id: id }
        })
        .then(_ => {
            return RequestProduct.findByPk(id).then(requestproduct => {
                if(requestproduct === null) {
                    const message = "Le demande de produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `Le demande de produit ${requestproduct.name_product} a bien été modifié.`
                    res.json({message, data: requestproduct })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le demande de produit n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteRequestProduct = (app) => {
    app.delete('/api/requestproduct/:id', (auth, _user), (req, res) => {
        RequestProduct.findByPk(req.params.id).then(requestproduct => {

            if(requestproduct === null) {
                const message = "Le demande de produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const requestproductDeleted = requestproduct;
                
                RequestProduct.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: requestproduct.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le demande de produit avec l'identifiant n°${requestproductDeleted.id} a bien été supprimé.`
                    res.json({message, data: requestproductDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le demande de produit n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createRequestProduct, findRequestProductByPk, findAllRequestProduct, updateRequestProduct, deleteRequestProduct }