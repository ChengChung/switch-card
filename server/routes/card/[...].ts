import { env } from 'node:process'
import { createKysely } from '@vercel/postgres-kysely'
import type { AccessTokenRes, Config, Database, PlayHistories } from '~/types'
import { CLIENT_ID, GRANT_TYPE, UA } from '~/utils/constance'
import { renderCard } from '~/server/core/renderCard'
import { getCardCache } from '~/server/core/imgCache'

const IS_DEV = env.NODE_ENV === 'development'

export default defineEventHandler(async (event) => {
  try {
    setHeader(event, 'Content-Type', 'image/svg+xml')
    setHeader(event, 'Cache-Control', `public, max-age=${IS_DEV ? '0' : '86400'}`)
    const { _: params } = event.context.params as { _: string }
    const splits = params.split('/')
    const userId = splits[0]

    const cache_svg = await getCardCache(userId)
    if (cache_svg) {
      return cache_svg
    }

    const db = createKysely<Database>()
    const findUser = await db.selectFrom('switch_card_user')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()
    if (!findUser)
      throw new Error('找不到用户信息')

    const { session_token, nickname } = findUser
    const { access_token } = await $fetch<AccessTokenRes>('https://accounts.nintendo.com/connect/1.0.0/api/token', {
      method: 'post',
      body: {
        client_id: CLIENT_ID,
        grant_type: GRANT_TYPE,
        session_token,
      },
    })

    const playData = await $fetch<PlayHistories>('https://news-api.entry.nintendo.co.jp/api/v1.2/users/me/play_histories', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': UA,
      },
    })

    const configs: Config = {
      user_id: userId,
      nickname,
      custom_avatar_url: findUser.custom_avatar_url ?? '',
      nintendo_avatar_url: findUser.nintendo_avatar_url,
      country: findUser.country,
      sw_friend_code: findUser.sw_friend_code,
    }

    const { render } = renderCard(playData, configs)
    return await render()
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.log({ error })
    return {
      error,
    }
  }
})
