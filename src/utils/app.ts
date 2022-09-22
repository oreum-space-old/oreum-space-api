import express, { Express, Router } from 'express'
import https from 'https'
import certs from './certs'
import checkEnvironments from './checkEnvironments'

const logs = process.env.LOGS?.toLowerCase() === 'true'

type AppCallback = (app: App) => string | Promise<string>

export type RegOptions = {
  condition: boolean,
  endpoint?: string,
  router?: Router,
  create?: AppCallback,
  mount?: AppCallback,
  destroy?: AppCallback
}

export interface App extends Express {
  reg (this: App, options: RegOptions): App
  create (this: App, create: AppCallback): App
  mount (this: App, mount: AppCallback): App
  destroy (this: App, destroy: AppCallback): App
  done (this: App): Promise<App>
}

const app = express() as App
const creates: Array<AppCallback> = []
const mounts: Array<AppCallback> = []
const destroys: Array<AppCallback> = []

function reg (this: App, { condition, endpoint, router, create, destroy, mount }: RegOptions): App {
  if (condition) {
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

async function done (this: App) {
  for (const create of creates) {
    const name = await create(app)
    if (logs) {
      console.log(`[Created] <${name}>`)
    }
  }
  try {
    checkEnvironments()
    https
      .createServer(certs(), app)
      .listen(
        process.env.PORT, () => console.log(`Server start successful.\n` + `https://localhost:${ process.env.PORT }`))
  } catch (error) {
    console.error(error)
  }

  for (const mount of mounts) {
    const name = await mount(app)
    if (logs) {
      console.log(`[Mounted] <${name}>`)
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
