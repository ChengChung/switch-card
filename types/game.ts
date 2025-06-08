export interface TitleInfo {
  InitialCode: string
  TitleName: string
  MakerName: string
  MakerKana: string
  Price: string
  SalesDate: string
  SoftType: string
  PlatformID: string
  DlIconFlg: string
  LinkURL: string
  ScreenshotImgFlg: string
  ScreenshotImgURL: string
}

export interface JPGameTitleInfoList {
  TitleInfoList: {
    TitleInfo: TitleInfo[]
  }
}

export interface SearchResult {
  status: number
  query: {
    limit: number
    page: number
  }
  result: {
    total: number
    items: Item[]
  }
}

export enum OptHard {
  Switch = '1_HAC',
  N3DS = '2_CTR',
  Other = '9_other',
  WiiU = '4_WUP',
  Amiibo = '9_amiibo',
  Switch2 = '05_BEE',
  Smartphone = '3_smartphone',
}

export interface Item {
  id: string
  title: string
  url: string
  titlek: string
  nsuid: string
  hard: string
  iurl: string
  siurl: string
}
