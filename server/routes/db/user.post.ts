import { createKysely } from '@vercel/postgres-kysely'
import type { Database, Response } from '~/types'

export default defineEventHandler(async (event): Promise<Response<null>> => {
  try {
    const body = await readBody(event)
    const { userId, sessionToken, nickname, country, nintendo_avatar_url } = body
    const db = createKysely<Database>()
    if (!userId || !sessionToken)
      throw new Error('messing params')

    const findOne = await db.selectFrom('switch_card_user')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()
    if (findOne) {
      await db.updateTable('switch_card_user')
        .set({
          session_token: sessionToken,
          nickname,
          country,
          nintendo_avatar_url,
          updated_time: new Date(),
        })
        .where('user_id', '=', userId)
        .executeTakeFirst()
    }
    else {
      await db.insertInto('switch_card_user')
        .values({
          user_id: userId,
          nickname,
          session_token: sessionToken,
          country,
          nintendo_avatar_url,
        }).execute()
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
