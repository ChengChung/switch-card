import { createKysely } from '@vercel/postgres-kysely'
import type { Database, Response, UserCustomInfo } from '~/types'

export async function getGameScreenshotURL(title: string): Promise<string> {
  try {
    const db = createKysely<Database>()
    const findTitle = await db.selectFrom('jp_store_game_title')
      .where('title_name', '=', title)
      .selectAll()
      .executeTakeFirst()
    if (!findTitle)
      return ''

    return findTitle.screenshot_img_url
  }
  catch (error) {
    return ''
  }
}
