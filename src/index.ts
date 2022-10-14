import 'dotenv/config'
import cookieParser from 'cookie-parser'
import { json } from 'express'
import api from './api'
import application from './application'
import discord from './discord'
import verifyDiscordRequest from './discord/utils/verifyDiscordRequest'
import mongoose from './mongoose'
import app from './utils/app'
import appMounted from './utils/app-mounted'
import errorMiddleware from './utils/middlewares/error-middleware'
import ping from './utils/ping'
// import useCors from './utils/useCors'

app
  .use(json())          // JSON
  .use(cookieParser())  // Cookie
  // .use(useCors)         // Cors
  .use(verifyDiscordRequest('/discord/integrations'))
  .get(...ping())       // /path
  .reg(api)             // /api
  .reg(discord)         // /discord
  .reg(application)     // /
  .reg(mongoose)        // connect to mongodb
  .use(errorMiddleware) // errors middleware
  .done()
  .then(appMounted)