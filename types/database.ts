import type { Generated } from 'kysely'

interface SwitchCardUserTable {
  id: Generated<number>
  user_id: string
  session_token: string
  nickname: string
  country: string
  nintendo_avatar_url: string
  custom_avatar_url?: string
  sw_friend_code?: string
  created_time?: Date
  updated_time?: Date
}

interface SwitchCardCacheTable {
  id: Generated<number>
  user_id: string
  cache: string
  updated_time?: Date
}

interface JPStoreGameTitleTable {
  id: Generated<number>
  initial_code: string
  title_name: string
  maker_name: string
  maker_kana: string
  price: string
  sales_date: string
  soft_type: string
  platform_id: string
  dl_icon_flg: string
  link_url: string
  screenshot_img_flg: string
  screenshot_img_url: string
}

interface GameTitleImgCacheTable {
  id: Generated<number>
  title_name: string
  img_url: string
  data: string
}

export interface Database {
  switch_card_user: SwitchCardUserTable
  switch_card_cache: SwitchCardCacheTable
  jp_store_game_title: JPStoreGameTitleTable
  game_title_img_cache: GameTitleImgCacheTable
}
