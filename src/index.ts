import 'dotenv/config'
import express from 'express'
import discordIntegration from './discord-integration'
import app from './utils/app'
import endpointNotFound from './utils/endpointNotFound'
import ping from './utils/ping'

app
  .use((req, res, next) => {
    console.log(req.rawHeaders)
    next()
  })
  .reg(discordIntegration)
  .use(express.json())
  .get(...ping())
  .use(endpointNotFound)
  .done()
  .then(() => {
    console.log('done')
  })