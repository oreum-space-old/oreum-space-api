import { IUser } from '../models/user-model'

export default class UserDto {
  id: string
  username: string
  online: Date
  avatar?: string

  constructor (model: IUser) {
    this.id = model._id
    this.username = model.username
    if (model.avatar) {
      this.avatar = model.avatar
    }
    this.online = model.online
  }
}