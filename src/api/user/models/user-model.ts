import { model, Schema } from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IUser extends Document {
  username: string, usernames: string[]
  email: string,
  password: string, passwords: string[]
  activation?: {
    link: string,
    code: string,
    hash: string,
    attempts: number
  },
  permissions: number,
  money: number,

  avatar?: string, avatars: string[]
  skin?: string, skins: string[]
  badge?: string, badges: string[]

  created: Date,
  online: Date

  tokens: Array<Types.ObjectId>
  discord?: string
}

const
  required = true,
  unique = true

const UserSchema = new Schema<IUser>({
  username: { type: String, unique, required }, usernames: { type: [String], default: [] },
  email: { type: String, unique, required },
  password: { type: String, unique, required }, passwords: { type: [String], default: [] },
  activation: {
    type: {
      link: { type: String, required },
      code: { type: String, required },
      hash: { type: String, required },
      attempts: { type: String, default: 0 }
    }
  },
  permissions: { type: Number, default: 0 },
  money: { type: Number, default: 0 },
  created: { type: Date, default: () => new Date() },
  online: { type: Date, default: new Date(0) },
  tokens: { type: [Schema.Types.ObjectId], ref: 'Token', default: [] },
  discord: { type: String }
})

export default model<IUser>('User', UserSchema)