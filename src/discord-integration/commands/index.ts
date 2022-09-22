import { RequestHandler } from 'express'
import DiscordRequest from '../utils/discordRequest'

type Locales = 'ru' | 'hu' | 'en-US'

type LocalesDictionary = Record<Locales, string>

enum ApplicationCommandTypes {
  CHAT_INPUT =	1,
  USER,
  MESSAGE
}

interface ApplicationCommand {
  id?: ApplicationCommandTypes,
  type?: number,
  name: string,
  name_localization?: LocalesDictionary
  description: string,
  description_localization?: LocalesDictionary
  options?: ApplicationCommandOption
}

type ApplicationCommands = Array<ApplicationCommand>

enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP,
  STRING,
  INTEGER,
  BOOLEAN,
  USER,
  CHANNEL,
  ROLE,
  MENTIONABLE,
  NUMBER,
  ATTACHMENT
}

interface ApplicationCommandOption {
  type: ApplicationCommandOptionType,
  name: string,
  name_localizations?: LocalesDictionary,
  description: string,
  description_localizations?: LocalesDictionary,
  required?: boolean,
  choices?: Array<ApplicationCommandOptionChoice>,
  options?: Array<ApplicationCommandOption>
  channel_types?: Array<unknown>,
  min_value?: number,
  max_value?: number,
  min_length?: number,
  max_length?: number,
  autocomplete?: boolean
}

interface ApplicationCommandOptionChoice {
  name: string,
  name_localizations?: LocalesDictionary,
  value: string | number | unknown
}

export interface InitCommand {
  handler: RequestHandler
  command: ApplicationCommand
}

const GUILDS_COMMANDS_ENDPOINT = `applications/${ process.env.DISCORD_APPID }/guilds/${ process.env.DISCORD_GUILD }/commands`

async function registerGuildCommand (command: ApplicationCommand) {
  const body = JSON.stringify(command)
  try {
    await DiscordRequest(GUILDS_COMMANDS_ENDPOINT, { method: 'POST', body })
    process.log(`Command "${command.name}" [${command.id}] was registered!"`)
  } catch (e) {
    process.error(`Failed to register "${command.name}" [${command.id}] command`, `Body: ${body}`, e)
  }
}

async function unregisterGuildCommand (command: ApplicationCommand) {
  try {
    await DiscordRequest(GUILDS_COMMANDS_ENDPOINT + `/${command.id}`, {
      method: 'DELETE'
    })
    process.log(`Command "${command.name} [${command.id}] was unregistered!"`)
  } catch (e) {
    process.error(`Failed to unregister "${command.name}" [${command.id}] command`, e)
  }
}

export default async function updateGuildCommands (commands: Array<InitCommand['command']>) {
  try {
    const
      response = await DiscordRequest(GUILDS_COMMANDS_ENDPOINT, { method: 'GET' }),
      installedCommands: ApplicationCommands = await response.json(),
      toRegisterCommands: ApplicationCommands = commands.filter(command => {
        return !installedCommands.find(_ => _.name === command.name)
      }),
      toUnregisterCommands: ApplicationCommands = installedCommands.filter(command => {
        return !commands.find(_ => _.name === command.name)
      }),
      registeringCommands = new Array<Promise<void>>(toRegisterCommands.length),
      unregisteringCommands = new Array<Promise<void>>(toUnregisterCommands.length)

    process.info(`Registering commands: ${toRegisterCommands.map(_ => _.name).join()}`)
    for (const command of toRegisterCommands) {
      registeringCommands.push(registerGuildCommand(command))
    }
    process.info(`Unregistering commands: ${toUnregisterCommands.map(_ => _.name).join()}`)
    for (const command of toUnregisterCommands) {
      unregisteringCommands.push(unregisterGuildCommand(command))
    }
    await Promise.allSettled(registeringCommands)
    await Promise.allSettled(unregisteringCommands)
    process.info('Guild commands updated!')
  } catch (e) {
    process.error('Failed to update Guild commands', e)
  }
}