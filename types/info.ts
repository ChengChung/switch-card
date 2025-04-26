export interface UserInfo {
  id: string
  nickname: string
  country: string
  iconUri: string
}

export interface History {
  titleName: string
  imageUrl: string
  titleId: string
  totalPlayedDays?: number
  totalPlayedMinutes: number
  lastPlayedAt?: string
  firstPlayedAt?: string
}

export interface PlayHistories {
  lastUpdatedAt: string
  playHistories: History[]
  recentPlayHistories: {
    playedDate: string
    dailyPlayHistories: History[]
  }[]
}

export interface UserCustomInfo {
  id: string
  custom_avatar_url: string
  sw_friend_code: string
}
