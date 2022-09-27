import { hash } from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import type { Types } from 'mongoose'
import { v4 } from 'uuid'
import ApiError from '../../utils/api-error'
import mailTransporter from '../../utils/mail-transporter'
import UserDto from './dto/user-dto'
import tokenModel from './models/token-model'
import bcrypt from 'bcrypt'
import UserModel, { IUser } from './models/user-model'

const
  jwtAccessSecret = process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret = process.env.JWT_REFRESH_SECRET,
  origin = process.env.ORIGIN

if (!jwtAccessSecret) {
  throw new Error('JWT_ACCESS_SECRET is not defined!')
}

if (!jwtRefreshSecret) {
  throw new Error('JWT_REFRESH_SECRET is not defined!')
}

if (!origin) {
  throw new Error('ORIGIN is not defined!')
}

export const tokenService = new class TokenService {
  generate (payload: UserDto) {
    const
      accessToken = jsonwebtoken.sign(payload, jwtAccessSecret, { expiresIn: '30m' }),
      refreshToken = jsonwebtoken.sign(payload, jwtRefreshSecret, { expiresIn: '30d' })

    return {
      accessToken,
      refreshToken
    }
  }

  async register (payload: UserDto, userAgent: string) {
    const tokens = tokenService.generate({ ...payload })

    await tokenService.saveToken(payload.id, tokens.refreshToken, userAgent)

    return tokens
  }

  validateAccess (token: string) {
    try {
      return jsonwebtoken.verify(token, jwtAccessSecret) as UserDto
    } catch (error) {
      process.setModule(process.module).error(error)
    }
  }

  validateRefresh (token: string) {
    try {
      return jsonwebtoken.verify(token, jwtRefreshSecret) as UserDto
    } catch (error) {
      process.setModule(process.module).error(error)
    }
  }

  async saveToken (userId: string, refreshToken: string, userAgent: string) {
    const tokenData = await tokenModel.findOne({ user: userId, userAgent })

    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }

    const user = await UserModel.findOne({ _id: userId })

    if (!user) {
      throw ApiError.ServerError('user-not-found')
    }
    if (user.tokens && user.tokens.length >= 8) {
      const oldToken = user.tokens.shift()

      if (oldToken) {
        await this.removeTokenById(oldToken)
      }
    }

    const newTokenData = await tokenModel.create({ user: userId, userAgent, refreshToken })
    user.tokens.push(newTokenData._id)
    await user.save()
    return newTokenData
  }

  async removeTokenById (_id: Types.ObjectId) {
    return (await tokenModel.findOneAndDelete({ _id }))
  }

  async removeToken (refreshToken: string) {
    return (await tokenModel.findOneAndDelete({ refreshToken }))
  }

  async findToken (refreshToken: string) {
    return (await tokenModel.findOne({ refreshToken }))
  }
}

export default new class UserService {
  async registration (username: string, email: string, password: string) {
    if (await UserModel.findOne({ username })) {
      throw ApiError.BadRequest(`already_exists`, [
        {
          field: 'username',
          error: 'username_already_in_use'
        }
      ])
    }

    if (await UserModel.findOne({ email })) {
      throw ApiError.BadRequest(`already_exists`, [
        {
          field: 'email',
          error: 'email_already_in_use'
        }
      ])
    }

    const
      uuid = v4(),
      hashPassword = await hash(password, 3),
      activation = {
        link: uuid,
        code: parseInt(uuid, 16).toString().slice(-6).padStart(6, '0'),
        hash: v4(),
        attempts: 5
      }

    try {
      await mailTransporter.sendActivationMail(
        email,
        username,
        activation.code,
        `${ origin }/api/activate/${ activation.link }`
      )
    } catch (error) {
      throw ApiError.BadRequest('failed_to_send_message', [
        error,
        {
          type: 'field',
          field: 'email',
          text: 'failed_to_send_message'
        }
      ])
    }

    const date = Date.now()

    try {
      await UserModel.create({
        username,
        email,
        password: hashPassword,
        activation,
        created: date
      })
    } catch {
      ApiError.ServerError('failed_to_save_user')
    }

    return { username, email, activation }
  }

  async resend (email: string, hash: string, root = false) {
    const user = await UserModel.findOne({ email })

    if (!user) {
      throw ApiError.BadRequest('user_not_found', [
        {
          type: 'field',
          field: 'email',
          value: email,
          text: 'failed_to_find_user'
        }
      ])
    }

    if (!user.activation || (user.activation?.hash !== hash && !root)) {
      throw ApiError.BadRequest('activation', [{
        type: 'field',
        field: 'activation.hash',
        value: hash,
        text: 'failed_to_find_user'
      }])
    }
    try {
      await mailTransporter.sendActivationMail(
        email,
        user.username,
        user.activation.hash,
        `${ origin }/api/activate/${ user.activation.link }`
      )
    } catch (error) {
      throw ApiError.BadRequest('failed_to_send_message', [error, {
        type: 'field',
        field: 'email',
        value: email,
        text: 'failed_to_send_message'
      }])
    }
    return
  }

  async validateUsername (username: string) {
    return {
      username,
      taken: !!(await UserModel.findOne({
        username: {
          $regex: new RegExp('^' + username.toLowerCase() + '$', 'i')
        }
      }))
    }
  }

  async validateEmail (email: string) {
    return { email, taken: !!(await UserModel.findOne({ email })) }
  }

  async activate (user: IUser & { _id: string }) {
    if (user.permissions & 1) {
      throw ApiError.BadRequest('user_already_activated')
    }
    user.activation = undefined
    await user.save()
  }

  async activateLink (activationLink: string, userAgent: string) {
    const user = await UserModel.findOne({ activation: { link: activationLink } })

    if (!user) {
      throw ApiError.BadRequest('not_correct_link')
    }

    await this.activate(user)
    const userDto: UserDto = new UserDto(user)
    const tokens = await tokenService.register(userDto, userAgent)
    return { ...tokens, user: userDto }
  }

  async activateCode (hash: string, code: string, userAgent: string) {
    const user = await UserModel.findOne({ activation: { hash } })

    if (!user) {
      throw ApiError.BadRequest('incorrect_link')
    } else if (!user.activation) {
      throw ApiError.BadRequest('user_already_activated')
    } else if (!user.activation.attempts) {
      throw ApiError.BadRequest('attempts_left')
    } else if (user.activation.code !== code) {
      user.activation.attempts--
      await user.save()
      throw ApiError.BadRequest('incorrect_code', [
        {
          type: 'field',
          field: 'code',
          value: code,
          text: 'incorrect_code'
        }
      ])
    }

    await this.activate(user)
    const userDto: UserDto = new UserDto(user)
    const tokens = await tokenService.register(userDto, userAgent)
    return { ...tokens, user: userDto }
  }

  async login (email: string, password: string, userAgent: string) {
    const user = await UserModel.findOne({ email })

    if (!user) {
      throw ApiError.BadRequest('user_with_this_email_not_found')
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      throw ApiError.BadRequest('password_is_incorrect')
    }

    if (user.activation) {
      throw ApiError.BadRequest('user_is_not_activated', [{
        type: 'field',
        field: 'activation.hash',
        value: user.activation.hash
      }])
    }

    const userDto = new UserDto(user)
    const tokens = await tokenService.register(userDto, userAgent)
    return { ...tokens, user: userDto }
  }

  async logout (refreshToken: string) {
    const removedToken = await tokenService.removeToken(refreshToken)
    if (removedToken) {
      const user = await UserModel.findOne({ _id: removedToken.user })

      if (!user) {
        throw ApiError.ServerError('user_not_found')
      }

      user.tokens = user.tokens.filter((token) => !token.equals(removedToken._id))
      user.save()
    }
    return removedToken
  }

  async refresh (refreshToken: string, userAgent: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userDtoFromToken = tokenService.validateRefresh(refreshToken)
    const tokenFromDatabase = await tokenService.findToken(refreshToken)
    if (!userDtoFromToken || !tokenFromDatabase) {
      throw ApiError.UnauthorizedError()
    }

    const user = await UserModel.findById(userDtoFromToken.id)
    if (!user) {
      throw ApiError.ServerError('user_not_found')
    }

    const userDto = new UserDto(user)
    const tokens = await tokenService.register(userDto, userAgent)
    return { ...tokens, user: userDto }
  }

  async getUserByUsername (username?: string) {
    if (username) {
      throw ApiError.BadRequest('username_required', [{
        type: 'field',
        field: 'username',
        value: username,
        text: 'username_required'
      }])
    }

    const user = await UserModel.findOne({ username })

    if (!user) {
      throw ApiError.BadRequest('user_not_found')
    }

    return new UserDto(user)
  }
}