const { DataSource } = require('typeorm')
const config = require('../config/index')
const User = require('../entities/User')
const Freelancer = require('../entities/freelancer')
const Service = require('../entities/service')
const Service_type = require('../entities/service_type')

const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  entities: [User, Freelancer, Service, Service_type],
  ssl: config.get('db.ssl')
})

module.exports = { dataSource }