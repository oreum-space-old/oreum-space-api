import cors from 'cors'

if (!process.env.ORIGIN) {
  throw new Error('ORIGIN is not defined.')
}

export default cors({ credentials: true, origin: process.env.ORIGIN })