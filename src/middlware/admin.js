const jwt = require('jsonwebtoken')
const private_key = require('../auth/private_key')

module.exports = (req, res, next) => {
    const authorizationHeader = req.headers.authorization
    
    if(!authorizationHeader) {
        const message = `Vous n'avez pas fourni de jeton d'authentification. Ajoutez-en un dans l'en-tête de la requête.`
        return res.status(401).json({ message })
    }
    
    const token = authorizationHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {

        if(error) {
            const message = `L'utilisateur n'est pas autorisé à accèder à cette ressource.`
            return res.status(401).json({ message, data: error })
        }

        const rule = decodedToken.rule

        if (rule == 1) {
            next()
        } else {
            const message = `Accée Refuser`
            res.status(403).json({ message })
        }
    })
}