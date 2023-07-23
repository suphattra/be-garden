const CONFIG = require('./../config') // Load config (environment)
const mongoose = require('mongoose') // Load mongoose
// const { logger } = require('./../utils/logger')

// Bootstrap db connection
const db = mongoose.connection
// logger.info(`Connecting to MongoDB`)
// mongodb://${CONFIG.MONGO.USER}:${encodeURIComponent(CONFIG.MONGO.PASS)}@${process.env.CONFIG.MONGO.IP}${process.env.CONFIG.MONGO.PORT}
// /${process.env.MONGO_DB_NAME}${process.env.MONGO_OPTION}`)

const MONGO_OPTION = {
  keepAliveInitialDelay: CONFIG.MONGO.TIMEOUT,
  connectTimeoutMS: CONFIG.MONGO.TIMEOUT,
  useUnifiedTopology: true,
  // useFindAndModify: true,
  // allowEmptyValues: true
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // poolSize: CONFIG.MONGO.POOL_SIZE,
  // reconnectTries: Number.MAX_VALUE,
  // reconnectInterval: CONFIG.MONGO.RECONNECT,
  // autoReconnect: true,
  // auth: {
  //   authSource: CONFIG.MONGO.MONGO_AUTH
  // },
  // user: CONFIG.MONGO.USER,
  // pass: CONFIG.MONGO.PASS
}
mongoose.connect(CONFIG.MONGO.URL, MONGO_OPTION)
// mongoose.set('useNewUrlParser', true)
// mongoose.set('useFindAndModify', false)
// mongoose.set('useCreateIndex', true)

db.on('connecting', () => {
  console.log('connecting to MongoDB...')
  // logger.info('connecting to MongoDB...')
})

db.on('error', error => {
  // logger.info(error.stack)
  // logger.info('MongoDB connection failed!')
  console.log('MongoDB connection failed!',CONFIG.MONGO.URL)
  console.log(error.stack)
  mongoose.connect(CONFIG.MONGO.URL, MONGO_OPTION)
  mongoose.disconnect()
})

db.on('connected', () => {
  // logger.info('MongoDB connected!')
  console.log('MongoDB connected!')
})

db.once('open', () => {
  // logger.info('MongoDB connection opened!')
  // logger.info(`MongoDB connection to database : ${CONFIG.MONGO.DATABASE}`)
  console.log(`MongoDB connection to database : ${CONFIG.MONGO.DATABASE}`)
})

db.on('reconnected', () => {
  // logger.info('MongoDB reconnected!')
})

db.on('disconnected', () => {
  // logger.info('MongoDB disconnected!')
})

process.on('uncaughtException', err => {
  // logger.info('MongoDB connection failed!')
  // logger.info(err)
  process.exit(1)
})
