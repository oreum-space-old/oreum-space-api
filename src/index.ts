import 'dotenv/config'
import cookieParser from 'cookie-parser'
import express, { json } from 'express'
import api from './api'
import application from './application'
import discord from './discord'
import { createVerifyDiscordRequest } from './discord/utils/verifyDiscordRequest'
import mongoose from './mongoose'
import app from './utils/app'
import appMounted from './utils/app-mounted'
import errorMiddleware from './utils/middlewares/error-middleware'
import ping from './utils/ping'
// import useCors from './utils/useCors'

app
  .use(express.json({ verify: createVerifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY!, '/discord/interactions') }))
  .use(json())          // JSON
  .use(cookieParser())  // Cookie
  // .use(useCors)         // Cors
  .get(...ping())       // /path
  .reg(api)             // /api
  .reg(discord)         // /discord
  .reg(application)     // /
  .reg(mongoose)        // connect to mongodb
  .use(errorMiddleware) // errors middleware
  .done()
  .then(appMounted)