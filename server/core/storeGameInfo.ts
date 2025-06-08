import { createKysely } from '@vercel/postgres-kysely'
import type { Database, Response, UserCustomInfo } from '~/types'

function handleSearchImgUrl(iurl: string): string {
  if (iurl.startsWith('/')) {
    return 'https://www.nintendo.com/jp'.concat(iurl)
  }
  else {
    return 'https://img-eshop.cdn.nintendo.net/i/'.concat(iurl).concat('.jpg')
  }
}

export async function getGameScreenshotURL(title: string): Promise<string> {
  try {
    const db = createKysely<Database>()
    const findTitle = await db.selectFrom('jp_store_game_title')
      .where('title_name', '=', title)
      .selectAll()
      .executeTakeFirst()
    if (findTitle)
      return findTitle.screenshot_img_url
    const searchTitle = await db.selectFrom('jp_store_game_title_search')
      .where('title', '=', title)
      .selectAll()
      .executeTakeFirst()
    if (searchTitle && searchTitle.iurl) {
      return handleSearchImgUrl(searchTitle.iurl)
    }

    return ''
  }
  catch (error) {
    return ''
  }
}
