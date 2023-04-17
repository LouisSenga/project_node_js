const { Category } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const manager = require('../../middlware/manager')
const jwt = require('jsonwebtoken')
const private_key = require('../../auth/private_key')

const createCategory = (app) => {
    app.post('/api/category', (auth, manager), (req, res) => {
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

        Category.create({
            name_catg: req.body.name_catg, 
            action: mon_id
        })
        .then(category => {
            const user_connecte = _user.code_user
            const message = `Le categorie ${req.body.name_catg} a bien été crée.`
            res.json({ user_connecte, message, data: category })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le categorie n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findAllCategory = (app) => {
    app.get('/api/category', (auth, manager), (req, res) => {
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
                return Category.findAndCountAll({ 
                    where: { 
                        name_catg: {
                            [Op.like]: `%${name}%`
                        },
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    limit: limit 
                })
                .then(({count, rows}) => {
                    const message = `Il y a ${count} categories au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
 
        } else {

            Category.findAll( { 
                where: {
                    action: mon_id,
                    visibility: true
                },
                order: ['id'] 
            } )
            .then(categorys => {
                const user_connecte = _user.code_user
                const message = 'La liste des categories a bien été récupérée.'
                res.json({ user_connecte, message, data: categorys })
            })
            .catch(error => {
                const message = "Les listes des categories n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

const findCategoryByPk = (app) => {
    app.get('/api/category/:id', (auth, manager), (req, res) => {
        Category.findByPk(req.params.id)
        .then(category => {
            if(category === null) {
                const message = "La categorie demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Une categorie a bien été trouvé.'
                res.json({ message, data: category })
            }
        })
        .catch(error => {
            const message = "La categorie n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const updateCategory = (app) => {
    app.put('/api/category/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        Category.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return Category.findByPk(id).then(category => {
                if(category === null) {
                    const message = "La categorie demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `La categorie ${category.name_catg} a bien été modifié.`
                    res.json({message, data: category })
                } 
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "La categorie n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteCategory = (app) => {
    app.delete('/api/category/:id', (auth, manager), (req, res) => {
        Category.findByPk(req.params.id).then(category => {

            if(category === null) {
                const message = "La categorie demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const categoryDeleted = category;
            
                // Category.destroy({
                //     where: { id: category.id }
                // })

                Category.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: category.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le categorie avec l'identifiant n°${categoryDeleted.id} a bien été supprimé.`
                    res.json({message, data: categoryDeleted })
                })
            }
        })
        .catch(error => {
            const message = "La categorie n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createCategory, deleteCategory, findAllCategory, findCategoryByPk, updateCategory }