const { RequestProduct, User, ServiceSupply } = require('../../db/sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const manager = require('../../middlware/manager')
const private_key = require('../../auth/private_key')

const findRequestProductByPk = (app) => {
    app.get('/api/requestproductmanager/:id', (auth, manager), (req, res) => {
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
            const message = "Le demande de produit n'a pas pu être récuperée. Réessayez plus tard 😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllRequestProduct = (app) => {
    app.get('/api/requestproductmanager', (auth, manager), (req, res) => {
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
                            ServiceSupplyId: mon_id,
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
                        ServiceSupplyId: mon_id,
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
                const user_connecte = _user.code_user
                const message = 'La liste des demandes de produit a bien été récupérée.'
                res.json({ message, data: requestproducts })
            })
            .catch(error => {
                const message = "Les listes des demandes de produit n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

module.exports = { findRequestProductByPk, findAllRequestProduct }
