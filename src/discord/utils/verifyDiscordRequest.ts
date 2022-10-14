import { verifyKey } from 'discord-interactions'
import { Request, Response } from 'express'

export function createVerifyDiscordRequest (clientKey: string, endpoint: string) {
  return function (request: Request, response: Response, buffer: Buffer): void {
    process.setModule('discord').info(`from verifyDiscordRequest: { request.url: ${request.url}, verifiableEndpoints: ${endpoint} }`)
    if (request.url.includes(endpoint)) {
      process.log(`[${request.method}] ${request.url} - Verifying Discord Request`)

      const signature = request.get('X-Signature-Ed25519')
      const timestamp = request.get('X-Signature-Timestamp')
      process.info(`verifying Discord Request with data: \n  ${signature}\n  ${timestamp}`)

      const isValidRequest = verifyKey(buffer, signature!, timestamp!, clientKey)
      if (!isValidRequest) {
        process.error('Discord request invalid!')
        response.status(401).send('Bad request signature')
        throw new Error('Bad request signature')
      }
      process.info('Discord request verified!')
    } else {
      process.setModule('discord').log(`[${request.method}] ${request.url} - not discord url`)
    }
  }
}