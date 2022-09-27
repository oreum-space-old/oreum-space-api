import { InteractionResponseType } from 'discord-interactions'
import { InitCommand } from './index'

const test: InitCommand = {
  handler (request, response) {
    response.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: request.body.locale.startsWith('en') ? 'Hello world!' : 'Привет мир!'
      }
    })
  },
  command: {
    name: 'test',
    description: 'Test connection with application',
    type: 1
  }
}

export default test