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
