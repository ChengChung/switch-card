import { createKysely } from '@vercel/postgres-kysely'
import type { Database, Response } from '~/types'

export default defineEventHandler(async (event): Promise<Response<null>> => {
  try {
    const body = await readBody(event)
    const { userId, custom_avatar_url, sw_friend_code } = body
    const db = createKysely<Database>()
    if (!userId)
      throw new Error('messing params')

    const findOne = await db.selectFrom('switch_card_user')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()
    if (findOne) {
      await db.updateTable('switch_card_user')
        .set({
          custom_avatar_url,
          sw_friend_code,
          updated_time: new Date(),
        })
        .where('user_id', '=', userId)
        .executeTakeFirst()
    }
    else {
      throw new Error('找不到用户信息')
    }

    return {
      state: 'ok',
      data: null,
    }
  }
  catch (error) {
    return {
      state: 'fail',
      data: null,
      message: String(error),
    }
  }
})
