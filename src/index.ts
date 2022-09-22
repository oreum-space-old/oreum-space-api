import 'dotenv/config'
import express from 'express'
import discordIntegration from './discord-integration'
import verifyDiscordRequest from './discord-integration/utils/verifyDiscordRequest'
import app from './utils/app'
import endpointNotFound from './utils/endpointNotFound'
import ping from './utils/ping'

app
  .use(express.json())
  .use(verifyDiscordRequest).reg(discordIntegration)
  .get(...ping())
  .use(endpointNotFound)
  .done()
  .then()