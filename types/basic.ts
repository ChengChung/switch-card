export interface Response<T> {
  state: 'ok' | 'fail'
  message?: string
  data: T | null
}

export interface Config {
  user_id: string
  nickname: string
  custom_avatar_url: string
  nintendo_avatar_url: string
  country: string
  sw_friend_code?: string
}
