import { createKysely } from '@vercel/postgres-kysely'
import { $fetch } from 'ofetch'
import type { Database, Response } from '~/types'
import { type Item, OptHard, type SearchResult } from '~/types/game'

export default defineEventHandler(async (event): Promise<Response<any>> => {
  try {
    const query = getQuery(event)
    const hard = query.hard as string | undefined
    let hardOpt = OptHard.Switch

    if (hard === 'ns') {
      hardOpt = OptHard.Switch
    }
    else if (hard === 'ns2') {
      hardOpt = OptHard.Switch2
    }
    else {
      return {
        state: 'fail',
        data: null,
        message: 'Invalid or missing hard parameter. Must be "ns" or "ns2".',
      }
    }

    const url = 'https://search.nintendo.jp/nintendo_soft/search.json'
    const link = new URL(url)
    const reqQuery = link.searchParams

    let limit = 400
    let page = 1
    let total_page = 0

    reqQuery.set('opt_hard[]', hardOpt.toString())
    reqQuery.set('sort', 'sodate asc,titlek asc,score')
    reqQuery.set('fq', '!(sform_s:DLC) AND !(sform_s:hard)')

    let items: Item[] = []

    let init = true
    while (true) {
      reqQuery.set('page', `${page}`)
      reqQuery.set('limit', `${limit}`)
      link.search = reqQuery.toString()

      const searchResult: SearchResult = await $fetch(link.toString(), { responseType: 'json' })

      if (searchResult.status !== 0) {
        return {
          state: 'fail',
          data: null,
          message: `Search failed with status: ${searchResult.status}`,
        }
      }

      if (init) {
        init = false
        limit = searchResult.query.limit
        total_page = Math.ceil(searchResult.result.total / limit)
      }

      items = items.concat(searchResult.result.items)
      if (limit !== searchResult.query.limit) {
        return {
          state: 'fail',
          data: null,
          message: `Limit mismatch: expected ${limit}, got ${searchResult.query.limit}, maybe limit changed during pagination`,
        }
      }

      // we allow one more pages to be queryed
      if (page > total_page || searchResult.result.items.length < limit) {
        break
      }

      page++
    }

    const db = createKysely<Database>()
    const dbvalues = items.map(value => ({
      id: value.id,
      title: value.title,
      url: value.url || '',
      titlek: value.titlek || '',
      nsuid: value.nsuid || '',
      hard: value.hard || '',
      iurl: value.iurl || '',
      siurl: value.siurl || '',
    }))

    const batchSize = Math.floor(65535 / 8)
    for (let i = 0; i < dbvalues.length; i += batchSize) {
      const batch = dbvalues.slice(i, i + batchSize)

      await db.insertInto('jp_store_game_title_search')
        .values(batch)
        .onConflict(oc => oc
          .columns(['id'])
          .doUpdateSet(eb => ({
            title: eb.ref('excluded.title'),
            url: eb.ref('excluded.url'),
            titlek: eb.ref('excluded.titlek'),
            nsuid: eb.ref('excluded.nsuid'),
            hard: eb.ref('excluded.hard'),
            iurl: eb.ref('excluded.iurl'),
            siurl: eb.ref('excluded.siurl'),
          })))
        .execute()
    }

    const total_item = dbvalues.length

    return {
      state: 'ok',
      data: null,
      message: `total ${total_item} items inserted or updated.`,
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
