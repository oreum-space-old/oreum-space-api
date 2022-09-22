import { Router } from 'express'
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

const [interactionsEndpoint, interactionRequestHandler] = interactions(commands)

const router = Router()
  .get(...pingUtil('discord-integration'))
  .post(interactionsEndpoint, interactionRequestHandler)

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

const discordIntegrationEndpoint = '/discord-integration'

const discordIntegration: RegOptions = {
  condition: discordEnabled,
  endpoint: discordIntegrationEndpoint,
  router,
  beforeCreate (app) {
    app.use(verifyDiscordRequest(interactionsEndpoint))
    return discordIntegrationEndpoint
  },
  async mount () {
    checkDiscordEnvironments()
    registerGuildCommands(commands.map(_ => _.command))
    return discordIntegrationEndpoint
  }
}

export default discordIntegration