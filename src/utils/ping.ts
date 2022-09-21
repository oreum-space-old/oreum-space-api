import { Request, Response } from 'express'

export default function (module?: string): [string, { (request: Request, response: Response): void }] {
  return ['/ping', function (request: Request, response: Response) {
    return response.json(module ? `${module}/pong` : 'pong')
  }]
}