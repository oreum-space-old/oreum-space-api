import type { Response, Request, NextFunction } from 'express'
import ApiError from '../api-error'

export default function (error: ApiError | Error, request: Request, response: Response, next: NextFunction) {
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
  process.error(error.message)
  return response
    .status(500)
    .json({
      message: 'unexpected_error'
    })
}