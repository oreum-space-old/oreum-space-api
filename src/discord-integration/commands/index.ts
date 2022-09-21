import { RequestHandler } from 'express'
import DiscordRequest from '../utils/discordRequest'

export interface InitCommand {
  handler: RequestHandler
  command: {
    name: string
    description: string
    options?: Array<{
      type: number
      name: string
      description: string
      required?: boolean
      choices?: any
    }>
    type: number
  }
}

type GuildResult = {
  name: string,
  status: 'registered' | 'connect failed' | 'failed to register' | 'already registered' | 'registering'
}

const guildEndpoint = `applications/${ process.env.DISCORD_APPID }/guilds/${ process.env.DISCORD_GUILD }/commands`

async function registerGuildCommand (command: InitCommand['command']): Promise<GuildResult> {
  const result: GuildResult = {
    name: command.name,
    status: 'registering'
  }

  try {
    const res = await DiscordRequest(guildEndpoint, { method: 'GET' })
    const data = await res.json()

    if (data) {
      const installedNames = data.map((c: InitCommand['command']) => c.name)
      if (!installedNames.includes(command.name)) {
        result.status = await InstallGuildCommand(command);
      } else {
        result.status = 'already registered'
      }
    }
  } catch (e) {
    console.error(e)
    result.status = 'connect failed'
  }

  return result
}

export function registerGuildCommands (commands: Array<InitCommand['command']>) {
  for (const command of commands) {
    registerGuildCommand(command).then(response => console.log(`Command ${response.name} `))
  }
}

export async function InstallGuildCommand(command: InitCommand['command']): Promise<GuildResult['status']> {
  const endpoint = `applications/${ process.env.DISCORD_APPID }/guilds/${ process.env.DISCORD_GUILD }/commands`

  try {
    await DiscordRequest(endpoint, { method: 'POST', body: JSON.stringify(command) })
    return 'registered'
  } catch (err) {
    console.error(err);
    return 'failed to register'
  }
}