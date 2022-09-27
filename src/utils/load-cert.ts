import * as fs from 'fs'

const
  keyPath = process.env.CERT_KEY_PATH as string,
  certPath = process.env.CERT_CERT_PATH as string

function checkCertsEnvironments () {
  if (!keyPath || !certPath) {
    throw new Error('Certificates path is not defined')
  }
}

function getCerts () {
  try {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  } catch {
    throw new Error('Certificates is not found')
  }
}

export default function () {
  process.setModule(module.filename)
  try {
    checkCertsEnvironments()
    return getCerts()
  } catch (err) {
    throw err
  }
}