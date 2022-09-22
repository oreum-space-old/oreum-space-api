import { InteractionResponseType } from 'discord-interactions'
import { InitCommand } from './index'

const dice: InitCommand = {
  handler (request, response) {
    response.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${(Math.floor(Math.random() * 6) + 1)}`
      }
    })
  },
  command: {
    name: 'dice',
    description: 'Return random number (1 - 6)',
    type: 1
  }
}

export default dice