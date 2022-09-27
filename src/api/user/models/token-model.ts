import { model, Schema } from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IToken extends Document {
  user: Types.ObjectId,
  userAgent: string,
  refreshToken: string
}

const TokenSchema = new Schema<IToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userAgent: { type: String, required: true },
  refreshToken: { type: String, required: true }
})

export default model('Token', TokenSchema)