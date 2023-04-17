const { Product, Category, Unit } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const private_key = require('../../auth/private_key')
const jwt = require('jsonwebtoken')
const manager = require('../../middlware/manager')

const createProduct = (app) => {
    app.post('/api/product', (auth, manager), (req, res) => {

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

        Product.create({
            name_prod: req.body.name_prod,
            quantity_prod: parseInt(req.body.quantity_prod),
            CategoryId: req.body.CategoryId, 
            UnitId: req.body.UnitId,
            action: mon_id,
        })
        .then(product => {
            const user_connecte = _user.code_user
            const message = `Le produit ${req.body.name_prod} a bien été crée.`
            res.json({ user_connecte, message, data: product })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le Produit n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findProductByPk = (app) => {
    app.get('/api/product/:id', (auth, manager), (req, res) => {
        Product.findByPk(req.params.id, { 
            include: [
                {
                    model: Category,
                },
                {
                    model: Unit
                }
            ]
        })

        // Product.findOne({
        //     where: {
        //         id: req.params.id
        //     }
        // }, {
        //     include: [{
        //         model: Category,
        //         through: { attributes: [] }
        //     }]
        // })

        .then(product => {
            if(product === null) {
                const message = "Le produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un produit a bien été trouvé.'
                res.json({ message, data: product })
            }
        })
        .catch(error => {
            const message = "Le produit n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const findAllProduct = (app) => {
    app.get('/api/product', (auth, manager), (req, res) => {
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
                return Product.findAndCountAll(
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
                                model: Category,
                            },
                            {
                                model: Unit
                            }
                        ]
                    }
                )
                .then(({count, rows}) => {
                    const message = `Il y a ${count} produits au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
        } else {

            Product.findAll( 
                { 
                    where: {
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    include: [
                        {
                            model: Category,
                        },
                        {
                            model: Unit
                        }
                    ]
                }
            )
            .then(products => {
                const user_connecte = _user.code_user
                const message = 'La liste des produits a bien été récupérée.'
                res.json({ user_connecte, message, data: products })
            })
            .catch(error => {
                const message = "Les listes des produits n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

const updateProduct = (app) => {
    app.put('/api/product/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        Product.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return Product.findByPk(id).then(product => {
                if(product === null) {
                    const message = "Le produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `Le produit ${product.name_catg} a bien été modifié.`
                    res.json({message, data: product })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le produit n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteProduct = (app) => {
    app.delete('/api/product/:id', (auth, manager), (req, res) => {
        Product.findByPk(req.params.id).then(product => {

            if(product === null) {
                const message = "Le produit demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const productDeleted = product;
            
                // Product.destroy({
                //     where: { id: product.id }
                // })
                
                Product.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: product.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le produit avec l'identifiant n°${productDeleted.id} a bien été supprimé.`
                    res.json({message, data: productDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le produit n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createProduct, findProductByPk, findAllProduct, updateProduct, deleteProduct }