import type { Router } from 'express'
import authMiddleware from '../../utils/middlewares/auth-middleware'
import controller from './controller'

function u (path: TemplateStringsArray) {
  return '/user' + path[0]
}

export default function useUser (router: Router) {
  router
    .post(u`/registration`, controller.registration)
    .post(u`/validate/username`, controller.validateUsername)
    .post(u`/validate/email`, controller.validateEmail)
    .post(u`/login`, controller.login)
    .post(u`/logout`, controller.logout)
    .post(u`/activate/:link`, controller.activate)
    .post(u`/resend`, controller.resend)
    .post(u`/refresh`, controller.refresh)
    .post(u`/auth`, authMiddleware, controller.auth)
}