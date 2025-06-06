import type { PlayHistories } from '~/types/info'
import type { Response } from '~/types/basic'
import { UA } from '~/utils/constance'

export default defineEventHandler(async (event): Promise<Response<PlayHistories>> => {
  const query = getQuery(event)
  try {
    const data = await $fetch<PlayHistories>('https://news-api.entry.nintendo.co.jp/api/v1.2/users/me/play_histories', {
      headers: {
        'Authorization': `Bearer ${query.accessToken}`,
        'User-Agent': UA,
      },
    })

    return {
      state: 'ok',
      data,
    }
  }
  catch (error) {
    return {
      state: 'fail',
      message: String(error),
      data: null,
    }
  }
})
