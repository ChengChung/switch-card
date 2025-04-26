import { env, title } from 'node:process'
import dayjs from 'dayjs'
import { getGameScreenshotURL } from './storeGameInfo'
import { type GameTitle, getOrCreateImageCache, getUnresizedImageUrl } from './imgCache'
import type { Config, History, PlayHistories } from '~/types'
import { imageCoverCropping, imageUrl2Base64 } from '~/server/utils'
import { JPEG_PREFIX, NS_LOGO_BASE64, PNG_PREFIX, SVG_ANIMATION_STYLE, SVG_CARD_FRAME_CSS_STYLE, SVG_PREFIX, test_frame1, test_frame2 } from '~/utils/constance'
import { formatMin, getAvatarUrl, getCountryFlagSVGURL } from '~/utils/tools'

export function renderCard(playData: PlayHistories, config: Config) {
  let recent_history: History[] = []
  let avatar_base64 = ''
  let cflag_base64 = ''
  let card_bg_image_base64 = ''
  let img_cache: Map<string, string> = new Map()

  const gamesTotal = playData.playHistories.length
  let playtimeTotal = 0
  let gamesThisMonth = 0
  let gamesThisYear = 0

  async function handleImgCache() {
    const gameTitles = recent_history.map((game) => {
      return {
        title_name: game.titleName,
        image_url: game.imageUrl,
      }
    })

    let card_bg_url = ''
    if (gameTitles.length > 0) {
      const firstGame = gameTitles[0]
      card_bg_url = await getGameScreenshotURL(firstGame.title_name)
      if (!card_bg_url) {
        card_bg_url = getUnresizedImageUrl(firstGame.image_url)
      }
      const card_bg_index = {
        title_name: firstGame.title_name,
        image_url: card_bg_url,
      }
      gameTitles.push(card_bg_index)
    }

    img_cache = await getOrCreateImageCache(gameTitles)

    card_bg_image_base64 = await imageCoverCropping(
      img_cache.get(card_bg_url),
      622,
      206,
    )

    avatar_base64 = await imageUrl2Base64(
      getAvatarUrl(config.custom_avatar_url, config.nintendo_avatar_url),
    )
    cflag_base64 = await imageUrl2Base64(getCountryFlagSVGURL(config.country))
  }

  function handleStats() {
    const now = new Date()
    const thisMonth = dayjs(new Date(now.getFullYear(), now.getMonth(), 1))
    const thisYear = dayjs(new Date(now.getFullYear(), 0, 1))

    for (const game of playData.playHistories) {
      playtimeTotal += game.totalPlayedMinutes
      const lastPlayedAt = dayjs(game.lastPlayedAt)
      if (lastPlayedAt.isAfter(thisMonth)) {
        gamesThisMonth++
      }
      if (lastPlayedAt.isAfter(thisYear)) {
        gamesThisYear++
      }
    }
  }

  async function prepare_data() {
    recent_history = playData.playHistories.slice(0, 6)
    await handleImgCache()
    handleStats()
  }

  async function renderFrame1() {
    return `
        <div class="card card-bg" xmlns="http://www.w3.org/1999/xhtml">
            <div class="user-header">
                <img class="avatar" height="40" width="40"
                    src="${JPEG_PREFIX + avatar_base64}" />
                <div class="user-info">
                    <div class="normal-row">
                        <img height="30" width="30"
                            src="${SVG_PREFIX + cflag_base64}" />
                        <div class="name">${config.nickname}</div>
                    </div>
                    <div class="normal-row">
                        <div class="name">${config.sw_friend_code}</div>
                        <img height="30" width="30"
                            src="${NS_LOGO_BASE64}" />
                    </div>
                </div>
            </div>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${gamesTotal}</div>
                    <div class="stat-key">Games</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${formatMin(playtimeTotal)}</div>
                    <div class="stat-key">PlayTime</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${gamesThisMonth}</div>
                    <div class="stat-key">GamesMonth</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${gamesThisYear}</div>
                    <div class="stat-key">GamesYear</div>
                </div>
            </div>
        </div>
    `
  }

  async function renderFrame2() {
    let gameDataString = ''
    for (const game of recent_history) {
      const imgBase64 = img_cache.get(game.imageUrl)
      const imgCropBase64 = await imageCoverCropping(imgBase64, 75, 75)
      gameDataString += `
      <div class="game-group">
        <img class="game" height="75" width="75" src="${PNG_PREFIX + imgCropBase64}" />
        <div class="playtime">${formatMin(game.totalPlayedMinutes)}</div>
      </div>
      `
    }
    return `
    <div class="card card-bg" xmlns="http://www.w3.org/1999/xhtml">
        <div class="user-header">
            <img class="avatar" height="40" width="40"
                src="${JPEG_PREFIX + avatar_base64}" />
            <div class="user-info">
                <div class="normal-row">
                    <img height="30" width="30"
                        src="${SVG_PREFIX + cflag_base64}" />
                    <div class="name">${config.nickname}</div>
                </div>
                <div class="normal-row">
                    <div class="name">🎮 ${gamesTotal}</div>
                    <div class="name">⏰ ${formatMin(playtimeTotal)}</div>
                    <img height="30" width="30"
                        src="${NS_LOGO_BASE64}" />
                </div>
            </div>
        </div>
        <div class="games"> ${gameDataString} </div>
    </div>
    `
  }

  async function render() {
    await prepare_data()
    const frame1 = await renderFrame1()
    const frame2 = await renderFrame2()

    return `
    <svg width="622" height="206" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns="http://www.w3.org/2000/svg">
      <style type="text/css">
        ${SVG_ANIMATION_STYLE}
        ${SVG_CARD_FRAME_CSS_STYLE}
        .card-bg {
        background-image: url("${PNG_PREFIX + card_bg_image_base64}")
        }
      </style>
      <foreignObject id="frame1" width="622" height="206"> ${frame1} </foreignObject>
      <foreignObject id="frame2" width="622" height="206"> ${frame2} </foreignObject>
    </svg>
    `
  }

  return {
    render,
  }
}
