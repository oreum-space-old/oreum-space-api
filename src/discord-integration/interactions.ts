import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { NextFunction, Request, Response } from 'express'
import { InitCommand } from './commands'

const commands: Array<InitCommand> = []

async function _interactions (request: Request, response: Response, next: NextFunction) {
  const { type, data } = request.body

  console.log(request.body)

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

    if (name === 'ping') {
      return response.send({
        type:  InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'pong'
        }
      })
    }
  }
}

export default function (_commands: Array<InitCommand>): [string, { (request: Request, response: Response, next: NextFunction): Promise<any> }] {
  commands.push(..._commands)
  return ['/interactions', _interactions]
}
