import './processLog'
import express, { Express, Router } from 'express'
import https from 'https'
import loadCert from './load-cert'
import checkEnvironments from './checkEnvironments'

const logs = process.env.LOGS?.toLowerCase() === 'true'

type AppCallback = (app: App) => ModuleOptions | Promise<ModuleOptions>

export type ModuleOptions = {
  module: string
  condition?: boolean,
  endpoint?: string,
  beforeCreate?: AppCallback,
  router?: Router,
  create?: AppCallback,
  mount?: AppCallback,
  destroy?: AppCallback
}

export interface App extends Express {
  reg (this: App, options: ModuleOptions): App
  create (this: App, create: AppCallback): App
  mount (this: App, mount: AppCallback): App
  destroy (this: App, destroy: AppCallback): App
  done (this: App): Promise<App>
}

const app = express() as App
const creates: Array<AppCallback> = []
const mounts: Array<AppCallback> = []
const destroys: Array<AppCallback> = []

function reg (this: App, { condition, endpoint, router, beforeCreate, create, destroy, mount }: ModuleOptions): App {
  if (condition === undefined || condition) {
    if (beforeCreate) {
      beforeCreate(this)
    }
    if (endpoint && router) {
      this.use(endpoint, router)
    } else if (router) {
      this.use(router)
    }
    if (create) {
      this.create(create)
    }
    if (mount) {
      this.mount(mount)
    }
    if (destroy) {
      this.destroy(destroy)
    }
  }
  return app
}

function create (this: App, create: AppCallback) {
  creates.push(create.bind(this))
  return app
}

function mount (this: App, mount: AppCallback) {
  mounts.push(mount.bind(this))
  return app
}

function destroy (this: App, destroy: AppCallback) {
  destroys.push(destroy.bind(this))
  return app
}

function infoStart () {
  process
    .setModule(module.filename)
    .info(
      'Server start successful.',
      `https://localhost:${ process.env.PORT }`
    )
}

async function done (this: App) {
  for (const create of creates) {
    const options = await create(app)
    if (logs) {
      process.setModule(options.module).log(`Creating!`)
    }
  }

  try {
    checkEnvironments()
    await https
      .createServer(loadCert(), app)
      .listen(process.env.PORT, infoStart)
  } catch (error) {
    process.error(error)
    process.exit(128)
  }

  for (const mount of mounts) {
    const options = await mount(app)
    if (logs) {
      process.setModule(options.module).info('Successfully mounted!')
    }
  }
  return app
}

app.reg = reg.bind(app)
app.create = create.bind(app)
app.mount = mount.bind(app)
app.destroy = destroy.bind(app)
app.done = done.bind(app)

export default app
