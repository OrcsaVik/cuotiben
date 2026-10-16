# AGENTS.md

## 项目定位

错题本微信小程序。**课程设计 / 毕设答辩演示**项目，评判标准是「主链路能否完整演示」，不是「能否上线运营」。

纯前端实现，**本阶段不接后端**。所有业务数据经 Mock Service 层读写 `wx.setStorageSync`。

**13 页面 / 7 组件 / 8 Service 已全部落地，静态门禁与纯逻辑单测全绿。** 当前唯一的可验证入口是 `docs/verification/2026-10-09-手动走查清单.md`——智能体无法驱动微信开发者工具，**任何视觉或交互断言都不算已验证，不要声称验证过**。

## 动手前必读

| 文档 | 内容 | 约束力 |
|---|---|---|
| `CONTEXT.md` | 规范术语表 | 命名、注释、文案一律用表中的词，不要用同义替代词 |
| `docs/adr/` | 9 条已定决策：mock 架构、只做学生端、导出占位 PDF、WeUI 走扩展库、自研主题切换、共享令牌表、WeUI 浮层不可覆盖则弹层自写、登录态只在本机、插图用单份中性色 SVG | **已拍板，不要重新讨论或悄悄推翻** |
| `docs/specs/2026-10-09-mistake-book-miniprogram.md` | 需求规格：76 条用户故事、双主题设计令牌取值、组件映射表、明确不做 | 实现前查这里，不要凭印象做 |
| `docs/specs/2026-10-10-技术交接规格书.md` | **工程契约**：存储 schema、Service 方法签名、filter 字段、组件 props/events、页面入参、门禁与测试接缝、后续开发改法 | 改任何一层前先对齐它；改动后同步更新 |

这四处是唯一的决策来源。新增不可逆决策时写入 `docs/adr/`（编号递增），新增术语时写入 `CONTEXT.md`。**不要在代码注释或本文件里复述 ADR / spec 内容**——那只会产生第二份会过期的副本。

## 目录约定

`frontend/` 是微信小程序项目根，微信开发者工具直接导入此目录。

```
frontend/
├── app.js  app.json  app.wxss   # app.wxss 引入令牌表，只放页面/卡片/按钮等基础样式
├── styles/tokens.wxss  # 设计令牌的唯一来源（结构 + 双主题色彩 + --weui-* 映射）
├── custom-tab-bar/     # 必须自定义，见下方硬约束 3；自己 @import 令牌表，见硬约束 7
├── pages/              # 13 个页面，路径见下表，不得随意增删改名
├── components/         # 跨页面复用的自定义组件
├── assets/             # 插画 SVG，只准用 <image src> 引用，见 ADR-0009
├── behaviors/          # 仅 theme.js 一个，见下方硬约束 7
├── services/           # Mock Service 层 —— 未来接后端时唯一的改动点
├── mock/               # 预置科目知识点树、种子错题、占位 PDF
├── utils/              # 纯函数：判分、掌握度、待复习判定、主题校验、图片、日期
├── tests/              # Jest 单测 + wx.mock.js 全局桩
├── scripts/            # check-tokens.js 令牌门禁，不参与小程序运行
└── package.json
```

### 路由契约

tabBar 4 个：

| 路径 | 职责 |
|---|---|
| `pages/index/index` | 首页：概览 + 待复习卡片 + 快捷入口 |
| `pages/mistakes/mistakes` | 错题本：列表 + 组合筛选 + 勾选组卷 |
| `pages/capture/capture` | 录入第一步：取图 + 触发 OCR |
| `pages/mine/mine` | 我的：个人中心 + 二级入口 |

非 tab 9 个：

| 路径 | 职责 |
|---|---|
| `pages/mistake-edit/mistake-edit` | 录入第二步：OCR 确认 + 分类 + 答案解析。传 `id` 则为编辑模式 |
| `pages/mistake-detail/mistake-detail` | 错题详情 |
| `pages/practice/practice` | 练习作答，逐题 |
| `pages/practice-result/practice-result` | 练习结果 |
| `pages/pending-review/pending-review` | 待复习列表 |
| `pages/practice-history/practice-history` | 练习记录 |
| `pages/export/export` | 导出（产物为占位 PDF） |
| `pages/settings/settings` | 设置：清空数据 / 重置演示数据 / 模拟 OCR 失败开关 |
| `pages/login/login` | 登录：头像昵称填写 + 已登录身份卡与退出。不门控任何功能，见 ADR-0008 |

组件：`mistake-card`、`category-picker`、`filter-drawer`、`tag-input`、`mastery-badge`、`answer-panel`、`empty-state`。

Service：`storage`、`mistake`、`category`、`practice`、`ocr`、`export`、`stats`、`auth`。

## 硬性技术约束

以下 8 条**无法从代码推导出来**，是踩了会直接翻车的坑，实现时必须遵守：

1. **Service 方法一律返回 Promise**，即使内部是同步读 storage。这是 ADR-0001「未来只替换 Service 实现、页面层不动」能成立的前提。页面统一 `await`，禁止在页面里直接调 `wx.getStorageSync`。

2. **图片必须转存到用户目录**。`wx.chooseMedia` 返回的 `tempFilePath` 生命周期仅限本次运行，重启即失效。录入时必须用 `FileSystemManager.saveFile` 转存到 `wx.env.USER_DATA_PATH`，错题记录里存转存后的路径。否则答辩第二天所有错题图片全裂。

3. **原生 tabBar 不支持中间凸起按钮**。录入 tab 要做成凸起，必须在 `app.json` 里设 `"tabBar": { "custom": true }` 并实现 `custom-tab-bar/`。两个附带事实：`custom: true` 后 `tabBar.list` **仍然必填**；`wx.setTabBarItem` **失效**，且每个 tab 页持有独立的 tabBar 实例，所以每个 tab 页都要在 `onShow` 里 `this.getTabBar().setData({ selected: N })`，漏了选中态就不更新。

4. **`wx.openDocument` 打不开小程序包内路径**。导出用的占位 PDF 必须先 `FileSystemManager.copyFile` 到 `wx.env.USER_DATA_PATH` 再打开。

5. **不要用 canvas 压缩图片**。`wx.chooseMedia({ sizeType: ['compressed'] })` 已经返回压缩图；canvas 压大图在低端机上慢且易内存溢出。只保留 10MB 大小校验（`wx.getFileInfo`）。

6. **填空题判分必须先归一化**：trim + 全角转半角 + 去空格，否则 `1/2` 与 `1 / 2` 会判错。多选题**全对才算对**，不给部分分。

7. **小程序无法给 `page` 元素加 class**。双主题令牌分别挂在 `.theme-light` / `.theme-dark` 上（唯一来源是 `styles/tokens.wxss`），因此每个页面 WXML 必须有一个绑定主题 class 的根 `view`（`<view class="page-root {{themeClass}}">`），并用 `min-height: 100vh` 自绘背景。`toThemeClass` **浅色下也要返回 `theme-light`，不能返回空串**——空串意味着根节点挂不到任何令牌类。导航栏不属于 CSS，必须每页调 `wx.setNavigationBarColor`，且其 `frontColor` **只接受 `#ffffff` / `#000000`** 两个字面量。`custom-tab-bar` 既在页面 WXML 之外、也不在 `page` 子树内，所以它有两件独立的事要做：由 tab 页在 `onShow` 通过 `getTabBar().setData()` 推送 `themeClass`，以及**自己 `@import '../styles/tokens.wxss'`**（否则 `page {}` 上的令牌继承不过去，凸起按钮和图标会整个消失）。这三件事统一由 `behaviors/theme.js` 处理，**每个页面都要混入**，漏一个就会在切换主题时露出旧主题。但注意 **Behavior 的自定义方法不会合并进页面实例**（实测 `this.applyTheme` 为 undefined），所以该文件同时导出纯函数 `applyTheme(ctx)`，页面切换主题时调 `applyTheme(this)`。Behavior 里定义的 `onShow` **是否合并进页面实例尚未证实**（只证实了方法不合并）；新增页面若要在显示时拿到主题，就在自己的 `onShow` 里显式调一次 `applyTheme(this)`——重复执行无害，`pages/login` 即如此。

8. **不要开启 `app.json` 的 `"darkmode": true`，不要在 WXSS 里写 `@media (prefers-color-scheme: dark)`，并且必须关掉微信开发者工具的「自动补全深色样式」**。官方 darkmode 严格跟随系统、没有应用内切换入口；而该媒体查询**不依赖** `darkmode` 声明、纯按系统能力生效。两者都会和「我的」页的手动开关打架（系统深色 + 用户选浅色时视觉撕裂）。主题只走显式 class 覆盖，见 ADR-0005。

   第三条不是假设：该功能会**往你的 `.wxss` 源文件末尾追加 `@import 'xxx-wxa-auto-dark.wxss'`**（还不带结尾分号）并生成一份把 `page` 与 `.theme-dark` **整体反色**的媒体查询——在系统深色环境下用户选深色反而得到浅色界面。`npm run check` 已把 `prefers-color-scheme` 与 `wxa-auto-dark` 列为硬失败。

   主题过渡只对 `background-color`、`color`、`border-color` 三个属性加 `transition`，**不要写 `transition: all`**——长列表滚动时会明显掉帧。

## 依赖策略

按优先级往下找，找到就停（完整映射表见 `docs/specs/`）：

1. **小程序原生内置组件** —— `view` `button` `picker` `form` `scroll-view` `switch` `radio` `checkbox` 等。
2. **WeUI 官方扩展库** —— `app.json` 设 `"useExtendedLib": { "weui": true }`，页面按需引用 `"mp-icon": "weui-miniprogram/icon/icon"`。**不装 npm 包**，见 ADR-0004（含一条互斥红线）。
3. **项目自有组件** `components/` —— 承载业务语义。
4. **不引入第三方 npm UI 库**（vant-weapp、TDesign 等）。
5. **不引入图表库**（echarts-for-weixin 体积大）。首页科目分布、掌握度占比、结果页正确率环形图，一律用 `view` + WXSS 宽度 / `conic-gradient` 实现。

能用 `wx.*` API 解决的不要引组件：图片预览用 `wx.previewImage`、确认弹窗用 `wx.showModal`、取图用 `wx.chooseMedia`。`mp-*` 只用于纯视觉与布局。

`frontend/package.json` 的依赖**仅供本地测试**，不会被打包进小程序。新增依赖前先确认是否真的必要。

## 前端基准属性

**设计令牌必须先于任何页面落地。** 取值见 `docs/specs/` 第 3 节。**唯一来源是 `frontend/styles/tokens.wxss`**，`app.wxss` 与 `custom-tab-bar/index.wxss` 各自 `@import` 它。令牌分两层：

- **结构令牌**（间距、字号、圆角、层级、动效、尺寸）主题无关，只定义一次。
- **色彩令牌**双主题：`.theme-light {}` 与 `.theme-dark {}` 各承载一套同名变量。

两组令牌都必须由**类选择器**承载，`styles/tokens.wxss` 里**不准出现 `page {}`**——这张表会被组件 `@import`，而组件 wxss 里的标签/ID/属性选择器会被工具判为非法并整条丢弃。`custom-tab-bar` 不在 `page` 子树内，只挂 `page {}` 的令牌它一个也拿不到；`page` 元素因此不持有任何令牌，可见区背景由 `.page-root` 自绘、下拉回弹区由 `wx.setBackgroundColor` 负责。

UI 方向是 **白色主色场 + 蓝黑墨水强调色**（作业本/订正笔迹的质感），骨架沿用 WeUI，主色通过覆盖 `--weui-BRAND` 生效。

强调色**只用于可交互元素与关键数据**：主按钮、选中态、活动 tab、链接、进度条、统计数字。**禁止**拿它做大面积背景、导航栏底色、卡片底色——单屏内强调色的覆盖面积应明显小于白色。

浅色下页面底与卡片底同为纯白，卡片**只靠描边分层**，不靠色差也不靠投影——`--shadow-1` 浅深两套都是 `none`，层次来自描边与发丝线（`--shadow-2` 只留给录入凸起按钮）。因此卡片样式必须写描边，不能指望阴影。圆角收到接近直角（`--r-sm`/`--r-md`/`--r-lg` = 2/4/8rpx），数字用 `--nums` 等宽对齐。页面**只组合 `app.wxss` 的全局原语**（`.card` `.hairline-*` `.section-title` `.stat-num` `.field-row` `.chip` `.btn*`），不在页面里另起一套。

页面与组件的 WXSS **只准引用 `var(--x)`，禁止硬编码色值、字号、间距、圆角**。组件（含 `custom-tab-bar`）的 WXSS **只准类选择器**——标签、ID、属性选择器会被工具判为非法并整条丢弃，这条也包括组件 `@import` 进来的共享表。组件里同样禁止出现 `.theme-dark` 选择器——主题靠 CSS 变量继承自动生效，组件不该自己判断主题。

写完样式自查：`cd frontend && npm run check`。它做四项判定——`#` 色值与 `rpx`/`px` 字面量只允许出现在 `styles/tokens.wxss`、每个 `var(--x)` 都有声明、`prefers-color-scheme` 与 `wxa-auto-dark` 零命中、组件 wxss 及其 `@import` 依赖里无标签/ID/属性选择器。**不要改用手工全局搜索代替它**：上一轮搜索判定 US-76 通过，正是因为工具生成的反色文件当时还不存在。

门禁只扫 `.wxss` 与 `.json`。`assets/*.svg` 里那唯一的中性色值 `#6E82A0` 是 ADR-0009 认可的**故意例外**（独立文档读不到 CSS 变量，令牌注不进去），不要为了"消掉硬编码色"把它改成内联 base64 或把色值搬进令牌表。

## 开发环境

| 工具 | 用途 | 本机状态 |
|---|---|---|
| **微信开发者工具** | 唯一的小程序运行、预览、真机调试环境。导入 `frontend/` | 需手动安装 |
| **Node.js** | Jest 单测、构建脚本 | v22.17.0（实测），npm 11.6.2 |
| **conda** | Python 环境管理。仅用于辅助脚本：生成科目知识点树、批量造 mock 种子数据。**不参与小程序运行时** | 用 `conda env list` 查看可用环境 |

Python 脚本属于一次性数据加工工具，产物是 `frontend/mock/` 下的 `.js` 文件。脚本本身可随意重写，但生成结果要保留在 `mock/` 下。

## 代码规范

- **默认不写注释**。只在 WHY 非显然时写一行——隐藏约束、反直觉的行为、特定 bug 的 workaround。不要解释代码在做什么，不要写"为 XX 流程添加"这类会腐烂的注释。
- **不为假想需求做抽象**。三处相似代码好过一个错误的抽象。不要加防御性的错误处理去应对不可能发生的情况；只在系统边界（用户输入、设备 API）做校验。
- **UI 片段的复用门槛比逻辑低**：跨页面出现就**必须**抽组件，同页面内出现 2 次就抽。视觉一致性比逻辑抽象更容易腐坏。上一条的"三次"只适用于逻辑抽象。
- **自定义组件只收 `properties`、只抛 `triggerEvent`**。组件内部不改全局状态、不直接调 Service；数据由页面取好后传入。
- **不做向后兼容的壳子**。本阶段没有历史包袱，改结构就直接改，不要留废弃变量、重导出、`// removed` 注释。
- **页面 `data` 只放渲染必需的字段**。派生数据在方法里算，或用 WXS，不要冗余存储导致状态不一致。
- **单个 WXML/JS 文件超过 300 行就拆组件**。
- 命名：术语一律取自 `CONTEXT.md`。文件名与目录名用 kebab-case，变量与函数用 camelCase。

## 测试规则

- **只对纯逻辑写单测**：`utils/`（`judge`、`mastery`、`review-due`、`date`）和 `services/` 中的数据计算、筛选、分页部分。
- **页面与组件不写自动化测试**。小程序页面测试需要 `miniprogram-simulate` 且收益低，一律用微信开发者工具手工验证。
- 测试文件放 `frontend/tests/`，命名 `<被测模块>.test.js`。
- wx API 用 `frontend/tests/wx.mock.js` 的全局桩，**不要引入额外的 mock 库**。需要新的 wx API 时往桩里加，保持极简。
- **一个行为一个 `test()`**。不用快照测试。不为覆盖率凑测试。
- 涉及时间的逻辑（待复习判定、掌握度）用 Jest 的 `jest.setSystemTime` 固定当前时间，不要依赖真实时钟。
- 运行：`cd frontend && npm test`。**改动 `utils/` 或 `services/` 后必须全绿**。

## 需求偏离声明

原始需求书有 4 项、加上走查后确认的 1 项降级，共 5 项在本阶段**有意不实现**，不是遗漏。写代码时不要试图补齐，答辩时需主动说明取舍：

1. 微信订阅消息每日定时推送 → 降级为首页「待复习」卡片（应用内提醒）
2. 云函数 pdfkit/docx 导出 → 降级为内置占位 PDF
3. 腾讯云 OCR 真实调用 → `ocr.service` 返回内置假文字，保留 1~2s 延迟模拟
4. 拍照搜题 / 题库匹配 → 不做，答案与解析由用户录入
5. 「我的」页「分类浏览」独立页（US-60）→ 降级为错题本入口（`wx.switchTab`，不新增页面、不传筛选参数）
