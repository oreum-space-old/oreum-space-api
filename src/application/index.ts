import express from 'express'
import { ModuleOptions } from '../utils/app'

const APPLICATION_ENDPOINT = '/'
const APPLICATION_DIST_PATH = process.env.APPLICATION_DIST_PATH
const SKINS_PATH = process.env.SKINS_PATH

if (!APPLICATION_DIST_PATH || !SKINS_PATH) {
  throw new Error('Application path is not defined!')
}

const application: ModuleOptions = {
  module: module.filename,
  endpoint: APPLICATION_ENDPOINT,
  beforeCreate (app) {
    app.get('skins', express.static(SKINS_PATH))
    app.use(express.static(APPLICATION_DIST_PATH))
    app.get('/*', (request, response) => {
      response.sendFile(APPLICATION_DIST_PATH + '/index.html')
    })
    return application
  }
}

export default application