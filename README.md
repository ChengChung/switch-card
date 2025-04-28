<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/yuyinws/static@master/2023/06/upgit_20230620_1687238510.png">
</p>
<p align="center">
  <a href="https://ns.yuy1n.io">在线地址</a>
</p>

## 📷 截图
<p align="center">
  <img height="400" src="https://cdn.jsdelivr.net/gh/yuyinws/static@master/2023/06/upgit_20230620_1687238840.png">
  <img height="400" src="https://cdn.jsdelivr.net/gh/yuyinws/static@master/2023/06/upgit_20230620_1687238857.png">
</p>

## 🔥 特性
- 查询最近游玩记录
- 查询历史游玩记录
- 资料卡片生成
- 支持深色模式
- 支持PWA

## 已知问题
- 港区账号无法查询到游戏记录
- 游戏记录会存在一定的误差和延迟

## TODO
- 自定义头像
- i18n

## 风险提示&免责声明

本系统中获取会话令牌的方法主要基于 https://github.com/ZekeSnider/NintendoSwitchRESTAPI 提供的源代码。无法保证它完全安全且没有任何风险。

用户应该知道，使用任何第三方工具来获取会话标记可能违反任天堂的用户协议，账户可能会被终止或暂停。因此，用户应该自担风险使用此类工具，并了解潜在的后果。

在此声明，本人不对使用此方法获取会话令牌而导致的任何问题或损害承担任何责任。用户承担使用此方法的所有责任和风险。

继续使用本系统和此处提供的方法，即表示您已知悉并同意此免责声明。

## 本分支修改内容
- 增加了部分结果的缓存以尝试加快渲染（但仍存在击穿的可能性）
- 增加了部分可自定义的内容：如头像、NS Friend Code。默认情况下，头像会使用Nintendo Account的头像（如果头像是Mii则会使用Mii）。
- 背景默认使用最近一条游玩记录的日服同名游戏的官方截图，找不到则使用该游戏的原始大小游戏封面（未测）
- 会输出玩家所在区服的旗帜（只测了JP）
- 模仿PSNProfile的风格调整了输出
![image](https://github.com/user-attachments/assets/94a54eed-259e-4ef2-95a8-2581cb6a04ff)

## 部署提示
- 出于API安全性考虑，建议不对外暴露`/card/`路径以外的地址
