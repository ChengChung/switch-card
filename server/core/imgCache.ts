import { createKysely } from '@vercel/postgres-kysely'
import dayjs from 'dayjs'
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

export async function saveCardCache(userId: string, cache: string) {
  try {
    const db = createKysely<Database>()
    await db.insertInto('switch_card_cache')
      .values({
        user_id: userId,
        cache,
        updated_time: new Date(),
      })
      .onConflict(oc => oc
        .columns(['user_id'])
        .doUpdateSet(eb => ({
          cache: eb.ref('excluded.cache'),
          updated_time: eb.ref('excluded.updated_time'),
        })))
      .execute()
  }
  catch (error) {
    console.error('saveCardCache error:', error)
  }
}

export async function getCardCache(userId: string): Promise<string | null> {
  try {
    const db = createKysely<Database>()
    const cache = await db.selectFrom('switch_card_cache')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst()

    if (cache?.updated_time) {
      const now = dayjs(new Date())
      const updated_time = dayjs(cache.updated_time)
      if (now.isAfter(updated_time.add(2, 'hour'))) {
        return null
      }
      return cache.cache
    }

    return cache?.cache ?? null
  }
  catch (error) {
    console.error('getCardCache error:', error)
    return null
  }
}
