const { OutProduct, User, ServiceSupply, Product } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const private_key = require('../../auth/private_key')
const manager = require('../../middlware/manager')

const createOutProduct = (app) => {
    app.post('/api/outproduct', (auth, manager), (req, res) => {
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

        Product.findByPk(req.body.ProductId)
        .then(product => {
            if(product.quantity_prod < parseInt(req.body.quantity_out)) {
                const message = `Le stock de la produit ${product.name_prod} est epuiser, vous demandiez ${req.body.quantity_out} alors qu'il reste ${product.quantity_prod}`
                res.status(400).json({ message: message, status: false })
            } else {
                OutProduct.create({
                    quantity_out: parseInt(req.body.quantity_out),
                    UserId: req.body.UserId, 
                    ProductId: req.body.ProductId,
                    ServiceSupplyId: mon_id,
                    date_out: req.body.date_out,
                })
                .then(outproduct => {

                    let new_qt_prod = product.quantity_prod - outproduct.quantity_out

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

                    const user_connecte = _user.code_user

                    const message = `Le sortie de la produit ${outproduct.id} a bien été crée.`
                    res.json({ user_connecte, message, data: outproduct })
                })
                .catch(error => {
                    if(error instanceof ValidationError) {
                        return res.status(400).json({ message: error.message, data: error })
                    }
                })
            }
        })
        .catch(error => {
            const message = "Le sortie de la produit n'a pas pu être ajouté. Réessayez plus tard😎"
            res.status(500).json({message, data: error, _qt: parseInt(req.body.quantity_out)})
        })
    })
}

const findOutProductByPk = (app) => {
    app.get('/api/outproduct/:id', (auth, manager), (req, res) => {
        OutProduct.findByPk(req.params.id, { 
            include: [
                {
                    model: User,
                },
                {
                    model: ServiceSupply
                },
                {
                    model: Product
                }
            ]
        })

        .then(outproduct => {
            if(outproduct === null) {
                const message = "Le sortie de la produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un sortie de la produit a bien été trouvé.'
                res.json({ message, data: outproduct })
            }
        })
        .catch(error => {
            const message = "Le sortie de la produit n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllOutProduct = (app) => {
    app.get('/api/outproduct', (auth, manager), (req, res) => {
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

            return OutProduct.findAndCountAll(
                { 
                    where: { 
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
                        },
                        {
                            model: Product
                        }
                    ]
                }
            )
            .then(({count, rows}) => {
                const message = `Il y a ${count} sortie de la produit au terme de recherche ${name}`
                res.json({ message, data: rows })
            })
        } else {

            OutProduct.findAll( 
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
                        },
                        {
                            model: Product
                        }
                    ]
                }
            )
            .then(outproducts => {
                
                const user_connecte = _user.code_user
                const message = 'La liste des sorties de la produit a bien été récupérée.'
                res.json({ user_connecte, message, data: outproducts })
            })
            .catch(error => {
                const message = "Les listes des sorties de la produit n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

const updateOutProduct = (app) => {
    app.put('/api/outproduct/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        OutProduct.update(req.body, {
            where: { id: id }
        })
        .then(_ => {
            return OutProduct.findByPk(id).then(outproduct => {
                if(outproduct === null) {
                    const message = "Le sortie de la produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `Le sortie de la produit ${outproduct.id} a bien été modifié.`
                    res.json({message, data: outproduct })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le sortie de la produit n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteOutProduct = (app) => {
    app.delete('/api/outproduct/:id', (auth, manager), (req, res) => {
        OutProduct.findByPk(req.params.id).then(outproduct => {

            if(outproduct === null) {
                const message = "Le sortie de la produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const outproductDeleted = outproduct;
                
                OutProduct.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: outproduct.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le sortie de la produit avec l'identifiant n°${outproductDeleted.id} a bien été supprimé.`
                    res.json({message, data: outproductDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le sortie de la produit n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createOutProduct, findOutProductByPk, findAllOutProduct, updateOutProduct, deleteOutProduct }