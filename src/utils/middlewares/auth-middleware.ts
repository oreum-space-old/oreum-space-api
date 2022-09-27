import { NextFunction, Response, Request } from 'express'
import tokenModel from '../../api/user/models/token-model'
import type { IUser } from '../../api/user/models/user-model'
import { tokenService } from '../../api/user/service'
import ApiError from '../api-error'

export interface UserRequest extends Request {
  user?: IUser
}

export default async function (request: UserRequest, response: Response, next: NextFunction) {
  try {
    const authorizationHeader = request.headers.authorization
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError())
    }

    const accessToken = authorizationHeader.split(' ')[1]
    if (!accessToken) {
      return next(ApiError.UnauthorizedError())
    }

    const userData = tokenService.validateAccess(accessToken)
    if (!userData) {
      return next(ApiError.UnauthorizedError())
    }

    const { refreshToken } = request.cookies
    if (!refreshToken) {
      return next(ApiError.UnauthorizedError())
    }

    const refreshFromBD = await tokenModel.findOne({ refreshToken })
    if (!refreshFromBD) {
      return next(ApiError.UnauthorizedError())
    }

    request.user = userData as IUser
    next()
  } catch (e) {
    return next(ApiError.UnauthorizedError())
  }
}