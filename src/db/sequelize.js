const { Sequelize, DataTypes } = require('sequelize')

const AuthModel = require('../models/auth')
const UserModel = require('../models/user')
const RuleModel = require('../models/rule')
const CategoryModel = require('../models/category')
const ProviderModel = require('../models/provider')
const ServiceSupplyModel = require('../models/service_supply')
const ConversionModel = require('../models/conversion')
const DeliverModel = require('../models/deliver')
const OutProductModel = require('../models/out_product')
const ProductModel = require('../models/product')
const RequestProductModel = require('../models/request_product')
const UniteModel = require('../models/unite')

const sequelize = new Sequelize('gestionstock', 'root', '', {
  host: 'localhost',
  dialect: 'mariadb',
  logging: false
})

sequelize.authenticate()
    .then(_ => console.log("Connection to DB oke !(❁´◡`❁)! 😘"))
    .catch(error => console.log(`Connection impossible 🤬🤬😡 ${error}`))

const Auth = AuthModel(sequelize, DataTypes)
const User = UserModel(sequelize, DataTypes)
const Rule = RuleModel(sequelize, DataTypes)
const Category = CategoryModel(sequelize, DataTypes)
const Provider = ProviderModel(sequelize, DataTypes)
const ServiceSupply = ServiceSupplyModel(sequelize, DataTypes)
const Conversion = ConversionModel(sequelize, DataTypes)
const Deliver = DeliverModel(sequelize, DataTypes)
const OutProduct = OutProductModel(sequelize, DataTypes)
const Product = ProductModel(sequelize, DataTypes)
const RequestProduct = RequestProductModel(sequelize, DataTypes)
const Unit = UniteModel(sequelize, DataTypes)

//User et authentification

User.hasOne(Auth, {
  foreignKey: 'UserId',
  as: 'users',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Auth.belongsTo(User, {
  foreignKey: 'UserId',
})

//Rule et User

Rule.hasMany(Auth, {
  foreignKey: 'RuleId',
  as: 'rules',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Auth.belongsTo(Rule, {
  foreignKey: 'RuleId',
})

//Categorie Produit

Category.hasMany(Product, {
  foreignKey: 'CategoryId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Product.belongsTo(Category, {
  foreignKey: 'CategoryId',
})

// Demander

// User.belongsToMany(ServiceSupply, {
//   through: RequestProduct,
// })

// ServiceSupply.belongsToMany(User, {
//   through: RequestProduct,
// })

User.hasMany(RequestProduct, {
  foreignKey: 'UserId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

RequestProduct.belongsTo(User, {
  foreignKey: 'UserId',
})

ServiceSupply.hasMany(RequestProduct, {
  foreignKey: 'ServiceSupplyId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

RequestProduct.belongsTo(ServiceSupply, {
  foreignKey: 'ServiceSupplyId',
})

//Sortie Produit

// User.belongsToMany(ServiceSupply, { through: OutProduct })

// ServiceSupply.belongsToMany(User, { through: OutProduct })

User.hasMany(OutProduct, {
  foreignKey: 'UserId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

OutProduct.belongsTo(User, {
  foreignKey: 'UserId',
})

ServiceSupply.hasMany(OutProduct, {
  foreignKey: 'ServiceSupplyId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

OutProduct.belongsTo(ServiceSupply, {
  foreignKey: 'ServiceSupplyId',
})

Product.hasMany(OutProduct, {
  foreignKey: 'ProductId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

OutProduct.belongsTo(Product, {
  foreignKey: 'ProductId',
})

//Conversion et Uniter

Unit.hasMany(Conversion, {
  foreignKey: 'EntryUnit',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Conversion.belongsTo(Unit, {
  as: 'UniterEntrer',
  foreignKey: 'EntryUnit',
})

Unit.hasMany(Conversion, {
  foreignKey: 'OutUnit',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Conversion.belongsTo(Unit, {
  as: 'UniterSortie',
  foreignKey: 'OutUnit',
})

// Entrer produit

// Provider.belongsToMany(Product, { through: Deliver })

// Product.belongsToMany(Provider, { through: Deliver })

Provider.hasMany(Deliver, {
  foreignKey: 'ProviderId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Deliver.belongsTo(Provider, {
  foreignKey: 'ProviderId',
})

Product.hasMany(Deliver, {
  foreignKey: 'ProductId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Deliver.belongsTo(Product, {
  foreignKey: 'ProductId',
})

Conversion.hasMany(Deliver, {
  foreignKey: 'ConversionId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Deliver.belongsTo(Conversion, {
  foreignKey: 'ConversionId',
})

// Produit et Uniter

Unit.hasMany(Product, {
  foreignKey: 'UnitId',
  onDelete: 'cascade',
  onUpdate: 'cascade'
})

Product.belongsTo(Unit, {
  foreignKey: 'UnitId',
})

const initDb = () => {
  return sequelize.sync({force: true}).then(_ => {
    console.log("Base de donnée bien été synchronisée")
  }).catch(error => {
    console.log(error)
  })
}

const aleterTable = () => {
  return sequelize.sync({ alter: true }).then(_ => {
    console.log('Modèles synchronisés avec la base de données');
  }).catch(error => {
    console.log(error)
  })
}

module.exports = { 
  initDb, aleterTable, User, Auth, Rule, Category, Provider, ServiceSupply, Conversion, Deliver, OutProduct, Product, RequestProduct, Unit
}