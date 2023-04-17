const express = require('express')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const bodyParser = require("body-parser")
const sequelize = require('./src/db/sequelize')

const login = require('./src/routes/login')
const ServiceSupplyRoute = require('./src/routes/admin/ServiceSupplyRouter')
const UserRoute = require('./src/routes/admin/UserRoute')
const ProductRoute = require('./src/routes/users/ProductRoute')
const CategoryRoute = require('./src/routes/users/CategoryRoute')
const RequestProductRoute = require('./src/routes/demande/RequestProducts')
const ConversionRoute = require('./src/routes/users/ConversionRoute')
const DeliverRoute = require('./src/routes/users/Delivers')
const OutProductRoute = require('./src/routes/users/OutProduct')
const ProviderRoute = require('./src/routes/users/ProviderRouter')
const UnitRoute = require('./src/routes/users/UnitRoute')
const pdf = require('./src/pdf/inventory')
const listes_user  = require('./src/pdf/list_user')
const requestProductManager = require('./src/routes/users/requestProduitManager')

const app = express()
const port = 5768

app
    .use(favicon(__dirname + '/favicon.ico'))
    .use(morgan('dev'))
    .use(bodyParser.json())

// sequelize.initDb()
// sequelize.aleterTable()

requestProductManager.findAllRequestProduct(app)

// CRUD USER
UserRoute.createUser(app)
UserRoute.deleteUser(app)
UserRoute.findAllUser(app)
UserRoute.findUserByPk(app)
UserRoute.updateUser(app)

// CRUD CATEGORY
CategoryRoute.createCategory(app)
CategoryRoute.findAllCategory(app)
CategoryRoute.findCategoryByPk(app)
CategoryRoute.updateCategory(app)
CategoryRoute.deleteCategory(app)

//CRUD PRODUCT
ProductRoute.createProduct(app)
ProductRoute.findAllProduct(app)
ProductRoute.findProductByPk(app)
ProductRoute.updateProduct(app)
ProductRoute.deleteProduct(app)

// CRUD PROVIDER
ProviderRoute.createProvider(app)
ProviderRoute.deleteProvider(app)
ProviderRoute.findAllProvider(app)
ProviderRoute.updateProvider(app)
ProviderRoute.findByPkProvider(app)

// CRUD DELIVER
DeliverRoute.createDeliver(app)
DeliverRoute.deleteDeliver(app)
DeliverRoute.findAllDeliver(app)
DeliverRoute.findDeliverByPk(app)
DeliverRoute.updateDeliver(app)

// CRUD CONVERSION
ConversionRoute.createConversion(app)
ConversionRoute.deleteConversion(app)
ConversionRoute.findAllConversion(app)
ConversionRoute.findConversionByPk(app)
ConversionRoute.updateConversion(app)

// CRUD UNIT
UnitRoute.createUnit(app)
UnitRoute.deleteUnit(app)
UnitRoute.findAllUnit(app)
UnitRoute.findUnitByPk(app)
UnitRoute.updateUnit(app)

// CRUD SERVICE SUPPLY
ServiceSupplyRoute.createServiceSupply(app)
ServiceSupplyRoute.deleteServiceSupply(app)
ServiceSupplyRoute.findAllServiceSupply(app)
ServiceSupplyRoute.findByPkServiceSupply(app)
ServiceSupplyRoute.updateServiceSupply(app)

// CRUD OUT PORDUCT
OutProductRoute.createOutProduct(app)
OutProductRoute.deleteOutProduct(app)
OutProductRoute.findAllOutProduct(app)
OutProductRoute.findOutProductByPk(app)
OutProductRoute.updateOutProduct(app)

// CRUD REQUEST PRODUCT
RequestProductRoute.createRequestProduct(app)
RequestProductRoute.deleteRequestProduct(app)
RequestProductRoute.findRequestProductByPk(app)
RequestProductRoute.findAllRequestProduct(app)
RequestProductRoute.updateRequestProduct(app)

//GENERATE PDF
pdf.inventory(app)
listes_user.listes_user(app)

// LOGIN REGISTER
login.login(app)
login.createAuth(app)

login.findAllAuth(app)
login.findOneAuth(app)
login.deleteAuth(app)
login.updateAuth(app)

app.use(({res}) => {
    const message = "Impossible de trouver la ressource demandé ☠️☠️☠️, essayer une autre URL"
    res.status(404).json({message})
})

app.listen(port, () => {
    console.log(`server is running: http://localhost:${port}`)
})