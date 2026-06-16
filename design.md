# Typography Design System — ROLA-IP

> **文件路径** `premium-styles.css`  
> **字体来源** Google Fonts  
> **最后更新** 2026-06-11

---

## 1. 字体家族

```css
--font-sans: 'Inter';
--font-mono: 'Inter';   /* 等宽场景复用 Inter，无单独 mono 字体 */
```

```html
<!-- index.html — 仅加载所需字重，减少请求体积 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

全站通过以下规则强制统一，避免浏览器默认字体干扰：

```css
*, *::before, *::after {
  font-family: var(--font-sans) !important;
}
```

---

## 2. Type Scale（字号档位）

所有字号通过 CSS 变量集中定义，**一处修改，全局生效**。

```css
/* :root */
--text-2xs:   0.625rem;                       /*  10px */
--text-xs:    0.75rem;                        /*  12px */
--text-sm:    0.875rem;                       /*  14px */
--text-base:  1rem;                           /*  16px */
--text-md:    1.125rem;                       /*  18px */
--text-lg:    1.25rem;                        /*  20px */
--text-xl:    1.5rem;                         /*  24px */
--text-2xl:   2rem;                           /*  32px */
--text-3xl:   2.25rem;                        /*  36px */
--text-4xl:   2.75rem;                        /*  44px */
--text-display: clamp(3.25rem, 4.5vw, 4.25rem); /* 52–68px，流式 */
```

### 视觉参考

| 变量 | px | 用途 |
|------|----|------|
| `--text-2xs` | 10 | 徽章内文、超小状态标注（`.cbadge__seal`、`.rating-badge`） |
| `--text-xs` | 12 | 辅助元数据、浮动卡片标签、小状态行（`.hv-live`、`.fcard__tag`、`.tcard__src`） |
| `--text-sm` | 14 | 导航链接、按钮、eyebrow 标签、列表项、代码 Tab、次级说明文字 |
| `--text-base` | 16 | 正文基准（`body`）、主要按钮文字、段落 |
| `--text-md` | 18 | 副标题（`.section-sub`）、强调正文、移动端导航、卡片描述 |
| `--text-lg` | 20 | Logo 文字、小卡片标题、Hero 副标题、部分 `h3` |
| `--text-xl` | 24 | 中型标题（`.integ__info h3`）、大数字、引用计量值 |
| `--text-2xl` | 32 | Featured 引用句（`.tcard--featured .tcard__quote`） |
| `--text-3xl` | 36 | 地理统计大数字 |
| `--text-4xl` | 44 | Section `h2` 最大值、定价价格（`.pcard__price`）、响应式地图 flag 字号 |
| `--text-display` | 52–68 | Hero `h1`（流式，随视口缩放） |

---

## 3. 字重体系

| Weight | 名称 | 典型用途 |
|--------|------|---------|
| `400` | Regular | 正文段落 |
| `500` | Medium | 移动导航链接、辅助说明 |
| `600` | SemiBold | 按钮默认、导航链接、eyebrow 标签、列表项 |
| `700` | Bold | Hero `h1`、卡片标题、引用句、强调文本 |
| `800` | ExtraBold | Section `h2`、价格数字、Logo、CTA 主标题、大数字 |

---

## 4. 流式标题（`clamp()`）

响应式标题使用 `clamp(min, preferred, max)` 在视口变化时平滑缩放，避免硬断点突变。

| 元素 | 表达式 | 对应档位 |
|------|--------|---------|
| Hero `h1` | `clamp(3.25rem, 4.5vw, 4.25rem)` | `--text-display` |
| Section `h2` 通用 | `clamp(2rem, 3.5vw, 2.75rem)` | `--text-4xl` 区间 |
| Features `h2` | `clamp(2.25rem, 4vw, 3.25rem)` | `--text-3xl` ～ `--text-4xl` |
| Geo `h2` | `clamp(2.25rem, 4vw, 3.5rem)` | `--text-3xl` ～ `--text-4xl` |
| Use-Cases `h2` | `clamp(2.25rem, 4vw, 3.5rem)` | `--text-3xl` ～ `--text-4xl` |
| Final CTA `h2` | `clamp(2.25rem, 5vw, 4.5rem)` | `--text-3xl` ～ 超出 `--text-4xl` |
| Bento card `h3` | `clamp(1.25rem, 2vw, 1.75rem)` | `--text-lg` ～ `--text-xl` |
| Stat `.hstat__v` | `clamp(1.25rem, 1.5vw, 1.5rem)` | `--text-lg` ～ `--text-xl` |
| 440px 断点 Hero | `clamp(2.25rem, 12vw, 3rem)` | 覆盖极窄屏 |

---

## 5. 行高 & 字距规律

### 5.0 中英文字高规范

#### 字高差异（同等 font-size 下的视觉高度）

| 指标 | Inter（拉丁） | PingFang SC / 系统中文 |
|------|-------------|----------------------|
| cap-height 占 em | ~72% | — |
| x-height 占 em | ~52% | — |
| 视觉字高占 em | ~72% | ~88–92% |
| 基线位置 | em 底部约 20% | 视觉居中，偏上 |
| 16px 时视觉字高 | ~11.5 px | ~14–15 px |

> **结论**：同一 `font-size` 下，中文字形视觉高度比拉丁大写高出约 **20–25%**；两者基线不重合，中文字形偏上沉，混排时会产生视觉错位。

#### 行高推荐（混排场景）

| 内容类型 | 推荐 `line-height` | 说明 |
|----------|--------------------|------|
| 纯拉丁正文 | `1.5 – 1.65` | Inter 内置间距充足 |
| 纯中文正文 | `1.7 – 1.85` | 中文字面率高，需更多呼吸空间 |
| **中英混排正文** | **`1.75 – 1.9`** | 两种字高叠加，行距必须放大 |
| 纯拉丁标题 | `1.0 – 1.1` | 展示级紧凑排版 |
| 中英混排标题 | `1.2 – 1.35` | 低于此值中文会显得局促 |
| 小号标注（≤ 12px） | `1.6 – 1.7` | 字号越小越需补偿行高 |

#### 视觉对齐补偿

当中英文单行混排（如导航、按钮、标签）出现垂直错位时，优先用以下方式修正，**禁止使用 `position: relative / top`**：

```css
/* 方案 A：vertical-align 微调（适合 inline / inline-block 场景） */
.zh { vertical-align: -0.05em; }

/* 方案 B：line-height 统一（适合 flex 容器，align-items: center） */
.mixed-label { display: flex; align-items: center; line-height: 1; }
```

#### 字体回退与字高影响

当前全站强制 `font-family: Inter !important`。Inter 不含 CJK 字符，中文字符会自动 fallback 到系统字体：

| 平台 | 中文 fallback | 视觉字高偏差 |
|------|--------------|-------------|
| macOS / iOS | PingFang SC | +22% vs Inter cap-height |
| Windows | Microsoft YaHei | +18% vs Inter cap-height |
| Android | Noto Sans SC | +20% vs Inter cap-height |

> **实践影响**：若页面包含中文内容，正文 `line-height` 不得低于 `1.75`；中英混排标题不得低于 `1.25`。

---

### 行高（`line-height`）

| 类型 | 值 | 说明 |
|------|----|------|
| 展示 / 大标题 | `1.0 – 1.1` | 极紧凑，强视觉冲击（纯拉丁） |
| 中英混排标题 | `1.2 – 1.35` | 中文字高补偿 |
| 卡片标题 | `1.05 – 1.15` | 略紧，层次清晰（纯拉丁） |
| 正文 / 副标题 | `1.45 – 1.65` | 舒适阅读间距（纯拉丁） |
| 中英混排正文 | `1.75 – 1.9` | 中文字高 + 系统字体差异补偿 |
| 代码块 | `1.7 – 1.8` | 等宽内容需更大留白 |

### 字距（`letter-spacing`）

| 类型 | 值 | 用途 |
|------|----|------|
| 展示大标题 | `-0.025em ~ -0.045em` | 负字距，标题紧密有力 |
| 正文 | `0` | 不干预默认间距 |
| Logo / 价格 | `-0.01em ~ -0.02em` | 轻微收紧，专业感 |
| 小标签 / 全大写 | `+0.02em ~ +0.06em` | 正字距，提升辨识度 |

---

## 6. 文字颜色语义

### 深色背景区域（Hero、Dark Section）

| CSS 变量 | 值 | 用途 |
|----------|----|------|
| `--heading` | `#F4F8F5` | 主标题、关键文字 |
| `--body` | `#9BA9A3` | 正文、描述文字 |
| `--muted` | `#6B776F` | 辅助、占位、时间戳 |
| `--icon` | `#C5D0CB` | 图标默认色 |

### 浅色背景区域（Features、Pricing、Geo 等）

| 颜色值 | 用途 |
|--------|------|
| `#080703` | 主标题（近纯黑） |
| `rgba(8,7,3,.58)` | 正文 |
| `rgba(8,7,3,.48)` | 次级说明、元数据 |
| `#fff` | Dark 卡片（Popular 定价、Final CTA）上的文字 |

### 强调色

| CSS 变量 | 值 | 用途 |
|----------|----|------|
| `--green` | `#1AD79F` | Active 状态、CTA、图标描边 |
| `--green-2` | `#5EE8C0` | Hover 强调、链接 |
| `#008D72` | — | eyebrow 标签文字（配浅绿背景） |

---

## 7. 响应式断点字号调整

| 断点 | 变化 |
|------|------|
| `≤ 1024px` | 网格收窄，字号由 `clamp()` 自动缩小 |
| `≤ 760px` | Hero `h1` 跟随 `clamp()` 缩小；移动导航字号 `--text-md` / `font-weight:500` |
| `≤ 440px` | Hero `h1` 强制覆盖为 `clamp(2.25rem, 12vw, 3rem)`；Hero 副标题降至 `--text-base` |

---

## 8. 等宽场景（Mono）

`--font-mono` 值同为 Inter，以下场景在**语义**上属于等宽排版：

| 元素 | 字号 | 行高 | 用途 |
|------|------|------|------|
| `.codepane pre` | `--text-sm` | 1.8 | 代码示例 |
| `#integration .codepane pre` | `--text-sm` | 1.78 | 集成文档代码 |
| `.hv-code pre` | `--text-2xs` | 1.7 | 浮动代码卡片 |
| `.hv-live` 实时标签 | `--text-2xs` | — | 状态指示 |
| `.geo-row__count` | `--text-sm` | — | IP 数量展示 |
| `.geo-metric__v` | `--text-3xl` / `font-weight:800` | 1 | 地理统计大数字 |

---

## 9. 使用规则

1. **只用变量**：任何新增 `font-size` 必须引用 `--text-*` 变量，禁止硬写小数字号。
2. **字重对应语义**：标题用 `700/800`，正文用 `400`，UI 控件用 `600`，辅助用 `500`。
3. **负字距仅用于大字号**：`letter-spacing` 负值仅在 `--text-xl` 及以上使用。
4. **正字距仅用于小标签**：全大写、元数据标签可用 `0.02–0.06em` 正字距。
5. **新增流式标题**：响应式标题优先使用 `clamp()`，min / max 值须对齐 Type Scale 档位。
6. **`4.6rem` 保留**：`.tcard__quote::before`（大引号装饰符）不纳入 Scale，属纯视觉装饰。

---

## 10. Spacing Scale（间距规范）

### 基准

以 **4px** 为最小步长，所有间距值均为 4 的整数倍。CSS 变量定义于 `:root`，可全局统一修改。

```css
/* :root */
--space-1:   4px;   /*  4px — icon gap、细节微移   */
--space-2:   8px;   /*  8px — 紧凑行内间距         */
--space-3:  12px;   /* 12px — 元素紧凑间距         */
--space-4:  16px;   /* 16px — 默认 gap / 小内边距  */
--space-5:  20px;   /* 20px — 中等间距             */
--space-6:  24px;   /* 24px — 卡片内边距基准       */
--space-7:  28px;   /* 28px — 充裕间距             */
--space-8:  32px;   /* 32px — section 内边距       */
--space-9:  36px;   /* 36px — 较大内边距           */
--space-10: 40px;   /* 40px — 组件垂直间距         */
--space-11: 44px;   /* 44px — 按钮高度 / 导航高度  */
--space-12: 48px;   /* 48px — section-head margin  */
--space-14: 56px;   /* 56px — 中型 section 间距    */
--space-16: 64px;   /* 64px — 大型组件高度         */
--space-20: 80px;   /* 80px — section padding 移动端 */
--space-24: 96px;   /* 96px — section padding 桌面端 */
```

### 档位映射

| 变量 | px | 用途示例 |
|------|----|---------|
| `--space-1` | 4 | 图标与文字间距、列表 gap |
| `--space-2` | 8 | badge 内边距、紧凑按钮间距 |
| `--space-3` | 12 | 卡片内小元素间距、tab 间距 |
| `--space-4` | 16 | 默认 gap、导航链接间距 |
| `--space-5` | 20 | 卡片网格 gap、水平按钮间距 |
| `--space-6` | 24 | 卡片主内边距、CTA 水平内边距 |
| `--space-7` | 28 | hero stats 间距、段落间距 |
| `--space-8` | 32 | 页面水平内边距 `--px` |
| `--space-9` | 36 | 大卡片内边距 |
| `--space-10` | 40 | 较大组件间距 |
| `--space-11` | 44 | 按钮最小高度、geo CTA |
| `--space-12` | 48 | section-head margin-bottom |
| `--space-14` | 56 | 大卡片 grid gap |
| `--space-16` | 64 | hero visual、代码面板 grid |
| `--space-20` | 80 | section padding（移动端） |
| `--space-24` | 96 | section padding（桌面端） |

### 保留值（语义组件尺寸，不纳入间距 Scale）

| 值 | 说明 |
|----|------|
| `1 / 2 / 3px` | 边框、分隔线、精细偏移 |
| `72px` | 导航栏高度 |
| `92px` | 代码面板 Tab 最小高度 |
| `150px` | Hero visual 高度（移动端） |
| `172px` | 浮动卡片宽度 |
| `280px` | feature card 占位图高度 |
| `720px` | section-head 最大宽度 |
| `1280px` | 全局最大宽度 `--max-w` |
| `999px` | `border-radius` 胶囊技巧 |

### 使用规则

1. **所有新增 margin / padding / gap 必须使用 `--space-*` 变量或 4px 整数倍值。**
2. 禁止出现 `5 / 6 / 7 / 9 / 10 / 13 / 14 / 17 / 18 / 22 / 26px` 等非标准值。
3. 边框（`border-width`）和阴影偏移（`box-shadow`）不受此约束，可用 1/2/3px。
4. `border-radius` 使用已有变量（`--radius: 12px`、`--radius-lg: 16px`、`--radius-sm: 8px`）或 `999px`（胶囊）。

---

## 11. Button Design System（按钮规范）

### 11.1 设计原则

- **高度驱动**：用 `height` 定义尺寸，不用 `padding-top / padding-bottom`
- **无投影**：所有按钮 `box-shadow: none`，包括 hover 状态
- **无图标**：按钮仅文字，不含 SVG icon
- **统一圆角**：`border-radius: 8px`（pill 变体除外）
- **统一过渡**：`background / color / border-color` 各 `0.15s`

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 16px;
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background .15s var(--ease), color .15s var(--ease), border-color .15s var(--ease);
  white-space: nowrap;
  cursor: pointer;
}

---

### 11.2 三权重体系

| 权重 | 类名 | 视觉 | 使用场景 |
|------|------|------|---------|
| **1st** | `.btn--primary` | 绿色实心 | 最重要 CTA，浅色背景下的主操作 |
| **2nd** | `.btn--secondary` | 黑色实心 | 深色背景下的主操作 |
| **3rd** | `.btn--ghost` | 白色实心 | 辅助操作，与主操作并排使用 |
| — | `.btn--link` | 纯文字 | 内联跳转，无背景无边框，不计入权重 |

---

### 11.3 尺寸规格

| 尺寸 | 高度 | 横向内边距 | 字号 | 字重 | 类名 |
|------|------|-----------|------|------|------|
| Small | 32px | 12px | `--text-xs` (12px) | 500 | `.btn--sm` |
| **Default** | **40px** | **16px** | **`--text-sm` (14px)** | **500** | `.btn` |
| Large | 48px | 20px | `--text-base` (16px) | 600 | `.btn--lg` |

```css
.btn     { height: 40px; padding: 0 16px; font-size: var(--text-sm);   font-weight: 500; }
.btn--sm { height: 32px; padding: 0 12px; font-size: var(--text-xs);   }
.btn--lg { height: 48px; padding: 0 20px; font-size: var(--text-base); font-weight: 600; }
```

---

### 11.4 变体样式

#### 1st — Primary `.btn--primary`

绿色，用于浅色背景下的最高优先级操作。

| 状态 | Background | 文字色 | Border |
|------|-----------|-------|--------|
| Default | `var(--green)` `#19D69F` | `#04130B` | `var(--green)` |
| Hover | `var(--green-2)` `#1DEBAB` | `#04130B` | `var(--green-2)` |

```css
.btn--primary       { background: var(--green);   color: #04130B; border-color: var(--green);   font-weight: 600; }
.btn--primary:hover { background: var(--green-2); color: #04130B; border-color: var(--green-2); }
```

#### 2nd — Secondary `.btn--secondary`

黑色，用于深色背景（Hero、Mobile Nav）下的最高优先级操作。

| 状态 | Background | 文字色 | Border |
|------|-----------|-------|--------|
| Default | `#080703` | `#fff` | `#080703` |
| Hover | `#1B180B` | `#fff` | `#1B180B` |

```css
.btn--secondary       { background: #080703; color: #fff; border-color: #080703; font-weight: 600; }
.btn--secondary:hover { background: #1B180B; color: #fff; border-color: #1B180B; }
```

#### 3rd — Ghost `.btn--ghost`

白色实心，用于辅助操作，与主按钮并排使用。

| 状态 | Background | 文字色 | Border |
|------|-----------|-------|--------|
| Default | `#fff` | `#080703` | `#fff` |
| Hover | `rgba(255,255,255,.88)` | `#080703` | `rgba(255,255,255,.88)` |

```css
.btn--ghost       { background: #fff;                  color: #080703; border-color: #fff;                  font-weight: 500; }
.btn--ghost:hover { background: rgba(255,255,255,.88); color: #080703; border-color: rgba(255,255,255,.88); }
```

#### Link `.btn--link`

纯文字链接，无高度约束、无背景、无边框。不计入三权重体系。

```css
.btn--link { height: auto; padding: 0; border-radius: 0; border-color: transparent;
             background: transparent; color: var(--green-2); font-weight: 500; }
```

---

### 11.5 布局修饰

| 修饰类 | 效果 |
|--------|------|
| `.btn--block` | `width: 100%`，撑满父容器 |

---

### 11.6 各区域使用规则

| 区域 | 主操作 | 辅助操作 |
|------|-------|---------|
| Nav | `.btn--primary` 绿 | — |
| Hero | `.btn--secondary` 黑 | `.btn--ghost` 白 |
| Mobile Nav | `.btn--secondary` 黑 | — |
| Pricing Free / Pro / Enterprise | `.btn--ghost`（卡片内覆盖为黑色实心 `#050505`，白色文字） | — |
| Pricing Popular | `.btn--primary` 渐变橙黄（卡片内覆盖） | — |
| Geo CTA | `.btn--primary` 绿，pill 圆角 | — |
| Integration | `.btn--primary` 绿 | `.btn--ghost`（透明背景纯文字链接样式） |
| Final CTA | `.btn--primary` 绿 | `.btn--ghost` 白 |

---

### 11.7 上下文尺寸覆盖

| 区域 | 选择器 | 高度 | 备注 |
|------|-------|------|------|
| Hero CTA | `.hero__ctas .btn` | 48px | padding `0 24px`，字号 `--text-base`；secondary 字重 600 |
| Pricing 卡片 | `.pcard .btn` | 48px | 字号 `--text-base`，字重 600 |
| Geo CTA | `#geo .geo__cta .btn` | 48px | `border-radius: 999px`（pill），`min-width: 280px` |
| Integration | `#integration .integ__quick .btn--primary` | 48px | `min-width: 192px` |
| Final CTA | `.finalcta__ctas .btn` | 48px | padding `0 24px`，字号 `--text-base`，字重 600 |

---

### 11.8 禁止项

1. 不使用 `padding-top / padding-bottom` 控制按钮高度
2. 不给按钮加 `box-shadow`（包括 hover）
3. 不给按钮加 `transform: translateY`（抬起效果）
4. 不在按钮内放 SVG icon
5. 不硬编码字号数值，统一使用 `--text-*` 变量
6. 不用上下文覆盖改变按钮颜色语义（改颜色请新建变体，不要覆盖 primary）
7. 不在同一区域并排放置两个相同权重的按钮

---

## 12. Border Radius（圆角规范）

### 12.1 CSS 变量定义

```css
/* :root */
--radius-sm: 8px;   /* 小组件、按钮、输入框 */
--radius:    12px;  /* 卡片默认、浮动面板 */
--radius-lg: 16px;  /* 大卡片、媒体容器 */
```

### 12.2 档位体系

| 值 | 用途 |
|----|------|
| `2px` | 细节装饰（hamburger 线条、进度条端头） |
| `4px` | Logo 内嵌图形、极小标签 |
| `6px` | Hero signup 内嵌按钮（紧贴容器内壁） |
| **`8px`** `--radius-sm` | **按钮、输入框、小卡片、代码 Tab** |
| `12px` `--radius` | 浮动面板、内嵌小卡片、ASN 网格、invoice 行 |
| `14px` | 占位符图片（feature card placeholder） |
| **`16px`** `--radius-lg` | **媒体容器（`fcard__media`）、浮动卡片** |
| `18px` | Pricing 卡片 |
| `24px` | Feature 大卡片（`fcard`） |
| `50%` | 圆形头像、状态点、圆形图标 |
| **`999px`** | **Pill 胶囊（eyebrow 标签、Geo CTA 按钮、进度条、sparkline）** |

### 12.3 按组件分类

#### 按钮
| 场景 | 圆角 |
|------|------|
| 默认按钮（所有变体） | `8px` |
| Geo CTA 按钮 | `999px`（pill） |
| Hero signup 内嵌按钮 | `6px` |

#### 卡片
| 组件 | 圆角 |
|------|------|
| Feature 大卡片 `.fcard` | `24px` |
| Feature 媒体容器 `.fcard__media` | `16px` |
| Pricing 卡片 `.pcard` | `18px` |
| Geo 地图卡片 `.geo__mapcard` | `16px` `--radius-lg` |
| Geo 列表行 `.geo-row` | `8px` `--radius-sm` |
| 浮动面板 `.hv-float` | `16px` |
| 浮动小卡片 `.hv-panel` | `12px` `--radius` |
| 内嵌小卡片（session、sparkline） | `12px` |

#### 标签 / Badge
| 组件 | 圆角 |
|------|------|
| Eyebrow 标签 | `999px` |
| 状态标签（`.hv-live`） | `100px` |
| ASN badge | `999px` |
| 功能 tag | `999px` |

#### 图形装饰
| 组件 | 圆角 |
|------|------|
| Logo mark | `8px` |
| Logo mark 内嵌图形 | `4px` |
| 进度条、bar | `3px` / `999px` |
| 圆形元素（头像、状态点） | `50%` |

### 12.4 使用规则

1. **新增按钮统一用 `8px`**，pill 变体用 `999px`，不得使用其他值
2. **新增卡片优先选 `24px`（大卡）或 `16px`（媒体/子卡）**，与已有组件保持一致
3. **标签/badge 统一用 `999px`**（胶囊）
4. `--radius-sm / --radius / --radius-lg` 三个变量优先于硬编码值
5. 禁止出现 `9px / 10px / 13px / 14px / 15px / 20px` 等不在体系内的圆角值（现有 `14px` 为历史值，不新增）
