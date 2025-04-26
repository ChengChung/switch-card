import { defineStore } from 'pinia'
import type { PlayHistories, UserCustomInfo, UserInfo } from '~/types/info'

export const useInfoStore = defineStore('info', () => {
  const userInfo = ref<null | UserInfo>(null)
  const playHistories = ref<null | PlayHistories>(null)
  const userCustomInfo = ref<null | UserCustomInfo>(null)
  const loading = ref(false)

  function withRefreshAccessToken(cb: () => void) {
    const dayjs = useDayjs()
    const { auth, getAccessToken } = useAuthStore()
    if (dayjs(auth.accessTokenExpiresAt).isBefore(dayjs(new Date())))
      getAccessToken(cb)
    else
      cb()
  }

  async function getUserInfo() {
    const { $toast } = useNuxtApp()
    try {
      loading.value = true
      const { auth } = useAuthStore()
      const { data } = await useFetch('/info/user', {
        params: {
          accessToken: auth.accessToken,
        },
      })

      if (data.value?.state === 'fail')
        throw new Error('获取用户信息错误')

      userInfo.value = data.value?.data || null
      getCustomInfo()
      saveUser()
    }
    catch (error) {
      $toast.error(String(error))
    }
    finally {
      loading.value = false
    }
  }

  async function getPlayHistory() {
    const { $toast } = useNuxtApp()
    try {
      loading.value = true
      const { auth } = useAuthStore()
      const { data } = await useFetch('/info/play_history', {
        params: {
          accessToken: auth.accessToken,
        },
      })

      if (data.value?.state === 'fail')
        throw new Error('获取用户信息错误')

      playHistories.value = data.value?.data || null
    }
    catch (error) {
      $toast.error(String(error))
    }
    finally {
      loading.value = false
    }
  }

  async function getCustomInfo() {
    const { $toast } = useNuxtApp()
    try {
      loading.value = true
      const { data } = await useFetch('/db/custom_setting', {
        params: {
          userId: userInfo.value?.id,
        },
      })

      if (data.value?.state === 'fail')
        throw new Error('获取用户自定义信息错误')

      userCustomInfo.value = data.value?.data || null
    }
    catch (error) {
      $toast.error(String(error))
    }
    finally {
      loading.value = false
    }
  }

  async function saveCustomInfo() {
    const { $toast } = useNuxtApp()
    try {
      if (userInfo.value && userCustomInfo.value) {
        const { id } = userInfo.value!
        const { custom_avatar_url, sw_friend_code } = userCustomInfo.value!

        const { data } = useFetch('/db/custom_setting', {
          method: 'POST',
          body: {
            userId: id,
            custom_avatar_url,
            sw_friend_code,
          },
        })

        if (data.value?.state === 'fail')
          throw new Error('更新用户自定义设置失败')

        $toast.success('更新用户自定义设置成功')
      }
      else {
        throw new Error('用户信息为空')
      }
    }
    catch (error) {
      $toast.error(String(error))
    }
  }

  async function saveUser() {
    const { $toast } = useNuxtApp()
    try {
      if (userInfo.value) {
        const { id, nickname, country, iconUri } = userInfo.value!
        const { auth } = useAuthStore()
        const { sessionToken } = auth

        const { data } = useFetch('/db/user', {
          method: 'POST',
          body: {
            userId: id,
            sessionToken,
            nickname,
            country,
            nintendo_avatar_url: iconUri,
          },
        })

        if (data.value?.state === 'fail')
          throw new Error('更新用户信息失败')
      }
      else {
        throw new Error('用户信息为空')
      }
    }
    catch (error) {
      $toast.error(String(error))
    }
  }

  async function refreshJPStoreGameTitle() {
    const { $toast } = useNuxtApp()

    try {
      const { data } = await useFetch('/db/refresh_jp_store')
      if (data.value?.state === 'fail')
        throw new Error('创建日服游戏信息索引失败')
      $toast.success('创建日服游戏信息索引成功')
    }
    catch (error) {
      $toast.error(String(error))
    }
  }

  function resetData() {
    userInfo.value = null
    playHistories.value = null
    userCustomInfo.value = null
  }

  return {
    getUserInfo,
    userInfo,
    withRefreshAccessToken,
    getPlayHistory,
    playHistories,
    getCustomInfo,
    saveCustomInfo,
    userCustomInfo,
    loading,
    refreshJPStoreGameTitle,
    resetData,
  }
}, {
  persist: true,
})
