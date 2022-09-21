import type { Request, Response } from 'express'

export default function (request: Request, response: Response) {
  return response
    .status(404)
    .json('Can\'t find that endpoint!')
}