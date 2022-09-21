export default function () {
  if (!process.env.PORT) {
    throw Error('PORT is not defined.')
  }
}