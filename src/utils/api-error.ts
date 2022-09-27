export default class ApiError extends Error {
  status: number
  errors: Array<unknown>

  constructor (status: number, message: string, errors: Array<unknown> = []) {
    super(message)
    this.status = status
    this.errors = errors
  }

  static UnauthorizedError () {
    return new ApiError(401, 'user_not_authorized')
  }

  static BadRequest (message: Error['message'], errors?: ApiError['errors']) {
    return new ApiError(400, message, errors)
  }

  static ServerError (message: Error['message'], errors?: ApiError['errors']) {
    return new ApiError(500, message, errors)
  }

  static PermissionError (message: Error['message'], errors?: ApiError['errors']) {
    return new ApiError(400, message, errors)
  }
}