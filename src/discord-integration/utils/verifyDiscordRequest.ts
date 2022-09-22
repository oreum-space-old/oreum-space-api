import { verifyKey } from 'discord-interactions'
import express, { Request, Response } from 'express'

function createVerifyDiscordRequest (clientKey: string) {
  return function (request: Request, response: Response, buffer: Buffer): void {
    console.log(request.url)
    const signature = request.get('X-Signature-Ed25519')
    const timestamp = request.get('X-Signature-Timestamp')

    const isValidRequest = verifyKey(buffer, signature!, timestamp!, clientKey)
    console.log('verifying discord:', isValidRequest)
    if (!isValidRequest) {
      response.status(401).send('Bad request signature')
      throw new Error('Bad request signature')
    }
  }
}

export default function () {
  return express.json({ verify: createVerifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY!) })
}