import { Router } from 'express'
import { ModuleOptions } from '../utils/app'
import useUser from './user'

const router = Router()

useUser(router)

const api: ModuleOptions = {
  module: module.filename,
  endpoint: '/api',
  router
}

export default api