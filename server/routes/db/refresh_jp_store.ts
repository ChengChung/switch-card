import { Buffer } from 'node:buffer'
import { createKysely } from '@vercel/postgres-kysely'
import { parseStringPromise } from 'xml2js'
import { $fetch } from 'ofetch'
import type { Database, Response } from '~/types'
import type { JPGameTitleInfoList } from '~/types/game'

export default defineEventHandler(async (_event): Promise<Response<any>> => {
  try {
    const url = 'https://www.nintendo.co.jp/data/software/xml/switch.xml'
    const data = await $fetch(url, { responseType: 'arrayBuffer' })

    const list: JPGameTitleInfoList = await parseStringPromise(Buffer.from(data), { explicitArray: false, trim: true })

    const db = createKysely<Database>()
    const dbvalues = list.TitleInfoList.TitleInfo.map(value => ({
      initial_code: value.InitialCode,
      title_name: value.TitleName,
      maker_name: value.MakerName,
      maker_kana: value.MakerKana,
      price: value.Price,
      sales_date: value.SalesDate,
      soft_type: value.SoftType,
      platform_id: value.PlatformID,
      dl_icon_flg: value.DlIconFlg,
      link_url: value.LinkURL,
      screenshot_img_flg: value.ScreenshotImgFlg,
      screenshot_img_url: value.ScreenshotImgURL,
    }))

    const batchSize = Math.floor(65535 / 12)
    for (let i = 0; i < dbvalues.length; i += batchSize) {
      const batch = dbvalues.slice(i, i + batchSize)

      await db.insertInto('jp_store_game_title')
        .values(batch)
        .onConflict(oc => oc
          .columns(['initial_code', 'title_name', 'soft_type', 'platform_id'])
          .doUpdateSet(eb => ({
            maker_name: eb.ref('excluded.maker_name'),
            maker_kana: eb.ref('excluded.maker_kana'),
            price: eb.ref('excluded.price'),
            sales_date: eb.ref('excluded.sales_date'),
            dl_icon_flg: eb.ref('excluded.dl_icon_flg'),
            link_url: eb.ref('excluded.link_url'),
            screenshot_img_flg: eb.ref('excluded.screenshot_img_flg'),
            screenshot_img_url: eb.ref('excluded.screenshot_img_url'),
          })))
        .execute()
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
