const { ServiceSupply } = require('../../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const auth = require('../../auth/auth')
const admin = require('../../middlware/admin')

const createServiceSupply = (app) => {
    app.post('/api/servicesupply', (auth, admin), (req, res) => {
        ServiceSupply.create({
            name_serv: req.body.name_serv, 
            code_serv: req.body.code_serv
        })
        .then(servicesupply => {
            const message = `Le service d'approvisionnement ${req.body.name_serv} a bien été crée.`
            res.json({ message, data: servicesupply })
        })
        .catch(error => {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le service d'approvisionnement n'a pas pu être ajouté. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const findAllServiceSupply = (app) => {
    app.get('/api/servicesupply', (auth, admin), (req, res) => {
        if(req.query.name) {
            const name = req.query.name
            const limit = parseInt(req.query.limit) || 5

            if(name.length < 2) {
                const message = "Le terme de recherche doit contenir au moins 2 caractére"
                res.status(400).json({message, data: error})
            } else {
                return ServiceSupply.findAndCountAll({ 
                    where: { 
                        name_serv: {
                            [Op.like]: `%${name}%`
                        },
                        visibility: true
                    },
                    order: ['id'],
                    limit: limit 
                })
                .then(({count, rows}) => {
                    const message = `Il y a ${count} service d'approvisionnement au terme de recherche ${name}`
                    res.json({ message, data: rows })
                })
            }
        } else {

            ServiceSupply.findAll( { 
                where: {
                    visibility: true
                },
                order: ['id'] 
            } )
            .then(servicesupplys => {
                const message = 'La liste des services d\'approvisionnement a bien été récupérée.'
                res.json({ message, data: servicesupplys })
            })
            .catch(error => {
                const message = "Les listes des service d'approvisionnement n'a pas pu être récuperée. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            })

        }
    })
}

const findByPkServiceSupply = (app) => {
    app.get('/api/servicesupply/:id', (auth, admin), (req, res) => {
        ServiceSupply.findByPk(req.params.id)
        .then(servicesupply => {
            if(servicesupply === null) {
                const message = "Le service d'approvisionnement demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const message = 'Un service d\'approvisionnement a bien été trouvé.'
                res.json({ message, data: servicesupply })
            }
        })
        .catch(error => {
            const message = "Le service d'approvisionnement n'a pas pu être récuperée. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

const updateServiceSupply = (app) => {
    app.put('/api/servicesupply/:id', (auth, admin), (req, res) => {

        const id = req.params.id

        ServiceSupply.update(req.body, {
        where: { id: id }
        })
        .then(_ => {
            return ServiceSupply.findByPk(id).then(servicesupply => {
                if(servicesupply === null) {
                    const message = "Le service d'approvisionnement demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                    res.status(404).json({message})
                }
                const message = `Le service d'approvisionnement ${servicesupply.name_catg} a bien été modifié.`
                res.json({message, data: servicesupply })
            })
        })
        .catch(error => {
            if(error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            } else {
                const message = "Le service d'approvisionnement n'a pas pu être modifié. Réessayez plus tard😎"
                res.status(500).json({message, data: error})
            }
        })
    })
}

const deleteServiceSupply = (app) => {
    app.delete('/api/servicesupply/:id', (auth, admin), (req, res) => {
        ServiceSupply.findByPk(req.params.id).then(servicesupply => {

            if(servicesupply === null) {
                const message = "Le service d'approvisionnement demandé n'existe pas. Réessayez avec une autre identifiant !!!"
                res.status(404).json({message})
            } else {
                const servicesupplyDeleted = servicesupply;
            
                // ServiceSupply.destroy({
                //     where: { id: servicesupply.id }
                // })

                ServiceSupply.update(
                    {
                        visibility: false
                    }, 
                    {
                        where: {
                            id: servicesupply.id
                        }
                    }
                )
                .then(_ => {
                    const message = `Le service d'approvisionnement avec l'identifiant n°${servicesupplyDeleted.id} a bien été supprimé.`
                    res.json({message, data: servicesupplyDeleted })
                })
            }
        })
        .catch(error => {
            const message = "Le service d'approvisionnement n'a pas pu être supprimé. Réessayez plus tard😎"
            res.status(500).json({message, data: error})
        })
    })
}

module.exports = { createServiceSupply, findAllServiceSupply, findByPkServiceSupply, updateServiceSupply, deleteServiceSupply }