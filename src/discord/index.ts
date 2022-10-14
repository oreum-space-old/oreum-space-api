import { Router } from 'express'
import { ModuleOptions } from '../utils/app'
import pingUtil from '../utils/ping'
import updateGuildCommands, { InitCommand } from './commands'
import dice from './commands/dice'
import test from './commands/test'
import interactions from './interactions'

const discordEnabled = process.env.DISCORD_ENABLED?.toLowerCase() === 'true'

const commands: Array<InitCommand> = [
  test,
  dice
]

const [interactionsEndpoint, interactionRequestHandler] = interactions(commands)

const router = Router()
  .get(...pingUtil('discord'))
  .post(interactionsEndpoint, interactionRequestHandler)

function checkDiscordEnvironments () {
  if (discordEnabled) {
    if (
      !process.env.DISCORD_APPID ||
      !process.env.DISCORD_GUILD ||
      !process.env.DISCORD_TOKEN ||
      !process.env.DISCORD_PUBLIC_KEY
    ) {
      process.error('DISCORD environments are not defined.')
      process.exit()
    }
  }
}

const discordEndpoint = '/discord'

const discord: ModuleOptions = {
  module: module.filename,
  condition: discordEnabled,
  endpoint: discordEndpoint,
  router,
  beforeCreate () {
    process.setModule(discord.module).info('beforeCreate')
    return discord
  },
  async mount () {
    process.setModule(discord.module).info('Mounting...')
    checkDiscordEnvironments()
    await updateGuildCommands(commands.map(_ => _.command))
    return discord
  }
}

export default discord