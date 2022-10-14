import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { InitCommand } from './commands'

const commands: Array<InitCommand> = []

async function _interactions (request: Request, response: Response, next: NextFunction) {

  const { type, data } = request.body

  process.setModule('discord').info('_interactions', request.body)

  // Handle verification requests
  if (type === InteractionType.PING) {
    return response.send({ type: InteractionResponseType.PONG })
  }

  // Handle slash command requests
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data

    for (const command of commands) {
      if (command.command.name === name) {
        command.handler(request, response, next)
      }
    }
  }
}

export default function (_commands: Array<InitCommand>): [string, RequestHandler] {
  commands.push(..._commands)
  return ['/interactions', _interactions]
}
