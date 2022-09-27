export default function () {
  if (!process.env.PORT) {
    throw Error('PORT is not defined.')
  }
  if (!process.env.APPLICATION_DIST_PATH) {
    throw Error('APPLICATION_DIST_PATH is not defined.')
  }
}