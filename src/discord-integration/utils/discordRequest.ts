const BASE_URL = 'https://discord.com/api/v10/'

export default async function (endpoint: string, options: RequestInit) {
  const url = BASE_URL + endpoint

  if (options.body) {
    options.body = JSON.stringify(options.body)
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/oreum-space-api, 1.0.0)',
    },
    ...options
  })

  if (!res.ok) {
    const data = await res.json()
    console.log(endpoint, res.status)
    console.log(options.body)
    throw new Error(JSON.stringify(data))
  }

  return res
}