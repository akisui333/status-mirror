# Status Mirror

一个高相似还原 `https://status.ciii.club/status/codex` 风格的状态监控站。

## 特性

- 基于 Next.js 16 + App Router
- 服务端抓取上游状态页数据
- 自动解析 `window.preloadData`
- 自动抓取心跳历史 `api/status-page/heartbeat/:slug`
- 进入页面可展示最近 1 小时每分钟状态
- 支持悬浮查看单分钟状态、时间和延迟
- 深色主题，视觉风格接近目标站
- 支持 Docker / docker-compose 部署
- 内置简单缓存，降低上游请求频率

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量：

```bash
cp .env.example .env.local
```

3. 启动开发环境：

```bash
npm run dev
```

打开 `http://localhost:3000`，会自动跳转到 `/status/codex`。

## 环境变量

```env
SOURCE_STATUS_URL=https://status.ciii.club/status/codex
CACHE_TTL=60
SITE_TITLE=深夜食堂监控站
```

说明：
- `SOURCE_STATUS_URL`：上游状态页地址
- `CACHE_TTL`：服务端缓存秒数
- `SITE_TITLE`：页面显示标题

## Docker 部署

### 构建并启动

```bash
docker compose up -d --build
```

### 停止

```bash
docker compose down
```

默认监听 `3000` 端口。

## 目录结构

- `app/status/codex/page.tsx`：状态页路由
- `lib/status/fetch-source.ts`：上游抓取与解析逻辑
- `types/status.ts`：状态数据类型
- `components/status/*`：页面组件
- `Dockerfile`：镜像构建
- `docker-compose.yml`：容器编排

## 后续可扩展方向

- 增加历史可用率图表
- 增加自定义品牌配置
- 改成对接你自己的监控 API
- 增加多状态页支持
