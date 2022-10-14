import { verifyKey } from 'discord-interactions'
import { Request, Response } from 'express'

export function createVerifyDiscordRequest (clientKey: string, endpoint: string) {
  return function (request: Request, response: Response, buffer: Buffer): void {
    process.setModule('discord').info('verifyDiscordRequest', endpoint, request.url)
    if (request.url.includes(endpoint)) {
      process.setModule('discord').log(`[${request.method}] ${request.url} - Verifying Discord Request`)

      const signature = request.get('X-Signature-Ed25519')
      const timestamp = request.get('X-Signature-Timestamp')
      process.log('\nsignature:', signature, '\ntimestamp:', timestamp)

      const isValidRequest = verifyKey(buffer, signature!, timestamp!, clientKey)
      if (!isValidRequest) {
        response.status(401).send('Bad request signature')
        throw new Error('Bad request signature')
      }
      process.log('Discord request verified!')
    } else {
      process.setModule('discord').log(`[${request.method}] ${request.url} - not discord url`)
    }
  }
}