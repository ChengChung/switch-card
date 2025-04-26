import { createKysely } from '@vercel/postgres-kysely'
import type { Database, Response, UserCustomInfo } from '~/types'

export async function getOrCreateImageCache(titles: GameTitle[]): Promise<Map<string, string>> {
  const img_urls = titles.map(title => title.image_url)

  const result = new Map<string, string>()

  if (img_urls.length === 0)
    return result

  try {
    const db = createKysely<Database>()
    const cache = await db.selectFrom('game_title_img_cache')
      .where('img_url', 'in', img_urls)
      .selectAll()
      .execute()

    for (const line of cache) {
      result.set(line.img_url, line.data)
    }

    const missing_titles = titles.filter(title => !result.has(title.image_url))
    for (const title of missing_titles) {
      const img_url = title.image_url
      const img_base64 = await imageUrl2Base64(img_url)
      result.set(img_url, img_base64)

      await db.insertInto('game_title_img_cache')
        .values({
          title_name: title.title_name,
          img_url,
          data: img_base64,
        })
        .execute()
    }

    return result
  }
  catch (error) {
    console.error('getOrCreateImageCache error:', error)
    return result
  }
}

export interface GameTitle {
  title_name: string
  image_url: string
}

export function getUnresizedImageUrl(url: string) {
  if (url.endsWith('_256'))
    return url.slice(0, -4)
  else
    return url
}
