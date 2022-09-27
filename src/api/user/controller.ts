import type { NextFunction, Request, Response } from 'express'
import { UserRequest } from '../../utils/middlewares/auth-middleware'
import service from './service'

const
  SECOND = 1000,
  MINUTE = SECOND * 60,
  HOUR = MINUTE * 60,
  DAY = HOUR * 24,
  MONTH = DAY * 30

export default new class UserController {
  static setCookieToken (response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      maxAge: MONTH
    })
    return Response
  }

  static getUserAgent (request: Request): string {
    return request.headers['user-agent'] || 'Unknown'
  }

  async registration (request: Request, response: Response, next: NextFunction) {
    try {
      const { username, email, password } = request.body
      return response.json(await service.registration(username, email, password))
    } catch (error) {
      next(error)
    }
  }

  async validateUsername (request: Request, response: Response, next: NextFunction) {
    try {
      const { username } = request.body
      return response.json(await service.validateUsername(username))
    } catch (error) {
      next(error)
    }
  }

  async validateEmail (request: Request, response: Response, next: NextFunction) {
    try {
      const { email } = request.body
      return response.json(await service.validateEmail(email))
    } catch (error) {
      next(error)
    }
  }

  async login (request: Request, response: Response, next: NextFunction) {
    try {
      const { email, password } = request.body
      const userAgent = UserController.getUserAgent(request)
      const { refreshToken, accessToken, user } = await service.login(email, password, userAgent)
      UserController.setCookieToken(response, refreshToken)
      return response.json({ token: accessToken, user: user })
    } catch (error) {
      next(error)
    }
  }

  async logout (request: Request, response: Response, next: NextFunction) {
    try {
      const { refreshToken } = request.cookies
      if (refreshToken) {
        await service.logout(refreshToken)
        response.clearCookie('refreshToken')
      }
      return response.json()
    } catch (error) {
      next(error)
    }
  }

  async resend (request: Request, response: Response, next: NextFunction) {
    try {
      const { email, hash } = request.body
      return response.json(await service.resend(email, hash))
    } catch (error) {
      next(error)
    }
  }

  async refresh (request: Request, response: Response, next: NextFunction) {
    try {
      const { refreshToken } = request.cookies
      const userAgent = UserController.getUserAgent(request)
      const data = await service.refresh(refreshToken, userAgent)
      UserController.setCookieToken(response, data.refreshToken)
      return response.json({ token: data.accessToken, user: data.user })
    } catch (error) {
      next(error)
    }
  }

  async activate (request: Request, response: Response, next: NextFunction) {
    try {
      const { link } = request.params
      const { code } = request.body
      const userAgent = UserController.getUserAgent(request)
      const { refreshToken, accessToken, user } = code
        ? await service.activateCode(link, code, userAgent)
        : await service.activateLink(link, userAgent)

      UserController.setCookieToken(response, refreshToken)
      return response.json({
        token: accessToken,
        user: user
      })
    } catch (error) {
      next(error)
    }
  }

  async auth (request: UserRequest, response: Response, next: NextFunction) {
    try {
      const { username } = request.params
      response.json({ user: await service.getUserByUsername(username) })
    } catch (error) {
      next(error)
    }
  }
}