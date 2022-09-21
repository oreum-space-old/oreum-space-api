import * as fs from 'fs'

export default function () {
  return {
    key: fs.readFileSync('.cert/key.pem'),
    cert: fs.readFileSync('.cert/cert.pem')
  }
}