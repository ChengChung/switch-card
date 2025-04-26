import { createKysely } from '@vercel/postgres-kysely'
import type { Database, Response, UserCustomInfo } from '~/types'

export default defineEventHandler(async (event): Promise<Response<UserCustomInfo>> => {
  const query = getQuery(event)
  try {
    const db = createKysely<Database>()
    const findUser = await db.selectFrom('switch_card_user')
      .where('user_id', '=', `${query.userId}`)
      .selectAll()
      .executeTakeFirst()
    if (!findUser)
      throw new Error('找不到用户信息')
    return {
      state: 'ok',
      data: {
        id: findUser.user_id,
        custom_avatar_url: findUser.custom_avatar_url ?? '',
        sw_friend_code: findUser.sw_friend_code ?? '',
      },
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
