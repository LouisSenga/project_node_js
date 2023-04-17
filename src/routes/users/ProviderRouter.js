const { Provider } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const jwt = require('jsonwebtoken')
const private_key = require('../../auth/private_key')
const manager = require('../../middlware/manager')

const createProvider = (app) => {
    app.post('/api/provider', (auth, manager), (req, res) => {

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

        Provider.create({
            name: req.body.name, 
            firstname: req.body.firstname, 
            email : req.body.email, 
            address: req.body.address, 
            phone: req.body.phone, 
            action: mon_id
        })
        .then(provider => {
            const user_connecte = _user.code_user
            const message = `Le fournisseur ${req.body.name} a bien été crée.`
            res.json({ user_connecte, message, data: provider })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le fournisseur n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findAllProvider = (app) => {
    app.get('/api/provider', (auth, manager), (req, res) => {
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
                return Provider.findAndCountAll({ 
                    where: { 
                        name: {
                            [Op.like]: `%${name}%`
                        },
                        action: mon_id,
                        visibility: true
                    },
                    order: ['id'],
                    limit: limit 
                })
                .then(({count, rows}) => {
                    const message = `Il y a ${count} fournisseur au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
        } else {

            Provider.findAll( { 
                where: {
                    action: mon_id,
                    visibility: true
                },
                order: ['id'] 
            } )
            .then(providers => {
                const user_connecte = _user.code_user
                const message = 'La liste des fournisseurs a bien été récupérée.'
                res.json({ user_connecte, message, data: providers })
            })
            .catch(error => {
                const message = "Les listes des fournisseurs n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })
        }
    })
}

const findByPkProvider = (app) => {
    app.get('/api/provider/:id', (auth, manager), (req, res) => {
        Provider.findByPk(req.params.id)
        .then(provider => {
            if(provider === null) {
                const message = "Le fournisseurs demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un fournisseurs a bien été trouvé.'
                res.json({ message, data: provider })
            }
        })
        .catch(error => {
            const message = "Le fournisseurs n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const updateProvider = (app) => {
    app.put('/api/provider/:id', (auth, manager), (req, res) => {

        const id = req.params.id

        Provider.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return Provider.findByPk(id).then(provider => {
                if(provider === null) {
                    const message = "Le fournisseurs demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                } else {
                    const message = `Le fournisseurs ${provider.name} a bien été modifié.`
                    res.json({message, data: provider })
                }
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le fournisseurs n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteProvider = (app) => {
    app.delete('/api/provider/:id', (auth, manager), (req, res) => {
        Provider.findByPk(req.params.id).then(provider => {

            if(provider === null) {
                const message = "Le foursnisser demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const providerDeleted = provider;
            
                // Provider.destroy({
                //     where: { id: provider.id }
                // })
    
                Provider.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: provider.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le foursnisser avec l'identifiant n°${providerDeleted.id} a bien été supprimé.`
                    res.json({message, data: providerDeleted })
                })    
            }
        })
        .catch(error => {
            const message = "Le foursnisser n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createProvider, findAllProvider, findByPkProvider, updateProvider, deleteProvider }