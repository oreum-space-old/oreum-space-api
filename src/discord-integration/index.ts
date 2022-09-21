import express, { Router } from 'express'
import { RegOptions } from '../utils/app'
import pingUtil from '../utils/ping'
import { InitCommand, registerGuildCommands } from './commands'
import test from './commands/test'
import interactions from './interactions'
import verifyDiscordRequest from './utils/verifyDiscordRequest'

const discordEnabled = process.env.DISCORD_ENABLED?.toLowerCase() === 'true'

const commands: Array<InitCommand> = [
  test
]

const router = Router()
  .use(express.json({ verify: verifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY!) }))
  .get(...(pingUtil('/discord-integration')))
  .post(...interactions(commands))

function checkDiscordEnvironments () {
  if (discordEnabled) {
    if (
      !process.env.DISCORD_APPID ||
      !process.env.DISCORD_GUILD ||
      !process.env.DISCORD_TOKEN ||
      !process.env.DISCORD_PUBLIC_KEY
    ) {
      throw Error('DISCORD environments are not defined.')
    }
  }
}

const discordIntegration: RegOptions = {
  condition: discordEnabled,
  endpoint: 'discord-integration',
  router,
  async mount () {
    checkDiscordEnvironments()
    registerGuildCommands(commands.map(_ => _.command))
    return 'discord-integration'
  }
}

export default discordIntegration