import { connect, ConnectOptions } from 'mongoose'
import { ModuleOptions } from '../utils/app'

const mongoDbUrl = process.env.MONGODB_URL

const options: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
} as ConnectOptions

let attempt = 0

async function _connect () {
  if (!mongoDbUrl) {
    throw new Error('MONGODB_URL is not defined')
  }
  try {
    await connect(mongoDbUrl, options)
  } catch (error) {
    process.warn('Failed to connect to MongoDB')
    process.setAction('Reconnecting').info(`attempt ${++attempt}`)
    await _connect()
  }
}

const mongooseModule: ModuleOptions = {
  module: module.filename,
  async create () {
    process.setModule(module.filename).setAction('Connecting').info()
    await _connect()
    return mongooseModule
  }
}

export default mongooseModule