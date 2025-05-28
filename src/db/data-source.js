const { DataSource } = require('typeorm')
const config = require('../config/index')
const User = require('../entities/User')
const Order = require('../entities/Order')
const Freelancer = require('../entities/Freelancer')
const Service = require('../entities/Service')
// const Service_type = require('../entities/service_type')
const Review = require('../entities/Review')
const Pet = require('../entities/Pet')
const Payment = require('../entities/Payment')



const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  // entities: [User, Order, Freelancer, Service, Service_type, Review, Pet],
  entities: [User, Order, Freelancer, Service, Review, Pet, Payment],
  migrations: ['dist/migrations/*.js'],
  ssl: config.get('db.ssl')
})

module.exports = { dataSource }