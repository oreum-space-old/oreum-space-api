import cors from 'cors'

if (!process.env.ORIGIN) {
  throw new Error('ORIGIN is not defined.')
}

const origins = process.env.ORIGIN.split(' ')

export default cors({
  credentials: true,
  origin: origins.length === 1 ? process.env.ORIGIN : () => {

  }
})