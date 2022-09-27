import type { Response, Request } from 'express'
import ApiError from '../api-error'

export default function (error: ApiError | Error, request: Request, response: Response) {
  if (error instanceof ApiError) {
    process.module = 'api-error'
    process.request(error)
    return response
      .status(error.status)
      .json({
        message: error.message,
        errors: error.errors
      })
  }

  process.module = 'error-middleware'
  process.error(error)
  return response
    .status(500)
    .json({
      message: 'unexpected_error'
    })
}