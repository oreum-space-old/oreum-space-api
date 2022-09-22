import { verifyKey } from 'discord-interactions'
import express, { Request, Response } from 'express'

function createVerifyDiscordRequest (clientKey: string, endpoint: string) {
  return function (request: Request, response: Response, buffer: Buffer): void {
    if (request.url.endsWith(endpoint) && request.method === 'POST') {
      console.log(`[${request.method}] ${request.url} - Verifying Discord Request`)

      const signature = request.get('X-Signature-Ed25519')
      const timestamp = request.get('X-Signature-Timestamp')
      console.log('signature:', signature)
      console.log('timestamp:', timestamp)

      const isValidRequest = verifyKey(buffer, signature!, timestamp!, clientKey)
      if (!isValidRequest) {
        response.status(401).send('Bad request signature')
        throw new Error('Bad request signature')
      }
      console.log('Discord request verified!')
    } else {
      console.log(`[${request.method}] ${request.url} - not discord url`)
    }
  }
}

export default function (endpoint: string) {
  return express.json({ verify: createVerifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY!, endpoint) })
}