import { InteractionResponseType } from 'discord-interactions'
import { InitCommand } from './index'

const random: InitCommand = {
  handler (request, response) {
    response.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${Math.random().toFixed(4)}`
      }
    })
  },
  command: {
    name: 'random',
    description: 'Returns random number',
    type: 1
  }
}

export default random