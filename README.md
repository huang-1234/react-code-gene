# AI画布编排系统

基于 React 18 + TypeScript 5 + Vite（前端）、Node.js + Koa + TypeScript（后端）、LangGraph + LangChain（AI编排）技术栈的全栈项目。

## 项目结构

```
react-code-gene/
  ├── apps/                # 前端应用
  │   ├── app-gene/        # React前端应用
  │   └── app-canvas/      # 画布交互应用
  ├── libs/                # 共享库
  │   └── shared-types/    # 共享类型定义
  └── servers/             # 后端服务
      ├── server-gene/     # Koa后端服务
      └── server-orchestration/ # AI编排服务
```

## 技术栈

### 前端
- React 18
- TypeScript 5
- Vite
- Zustand (状态管理)
- Konva (画布交互)
- Socket.io-client (WebSocket通信)
- Axios (HTTP请求)

### 后端
- Node.js
- Koa
- TypeScript
- JWT认证
- LangGraph + LangChain (AI工作流编排)
- Redis (状态持久化)
- Socket.io (WebSocket服务)

## 功能特性

- 交互式画布：支持绘图、批注和指令控制
- AI工作流编排：基于LangGraph实现多工具协同
- 实时通信：WebSocket实现状态同步
- 状态持久化：Redis存储工作流状态
- 错误处理：支持超时重试和回滚机制

## 开发指南

### 安装依赖

```bash
# 安装工作区依赖
pnpm install

# 安装前端依赖
cd apps/app-canvas
pnpm install

# 安装后端依赖
cd ../../servers/server-orchestration
pnpm install
```

### 开发环境运行

```bash
# 运行前端
cd apps/app-canvas
pnpm dev

# 运行后端
cd servers/server-orchestration
pnpm dev
```

## 环境变量配置

### 后端服务环境变量 (.env)

```
# 服务器配置
PORT=3000
NODE_ENV=development

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenAI API配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here
```

## 接口协议

### 指令执行请求

```
POST /api/instructions
{
  "task": "generate_logo",
  "params": { "text": "科技公司LOGO", "style": "极简风" },
  "sessionId": "uuid"
}
```

### 成功响应

```
{
  "taskId": "task_01",
  "previewUrl": "/preview/task_01.html"
}
```

## 错误处理

| 错误码 | 含义 | 处理逻辑 |
|-------|------|---------|
| `429` | 超出AI配额 | 暂停任务并等待30秒重试 |
| `504` | LangGraph执行超时 | 中断工作流并记录检查点 |

## 项目说明

### Redis状态持久化
当前版本已预留Redis接口，但暂不实现Redis功能。后续可以通过完善`utils/redis.js`来添加Redis支持。

### 移动端支持
当前版本不支持移动端显示，仅适配桌面环境。已添加移动端访问警告提示。

### AI模型服务API接入
目前使用OpenAI API接入，后续可根据需求调整为其他AI模型服务。

## 部署

```bash
# 构建前端
cd apps/app-canvas
pnpm build

# 构建后端
cd servers/server-orchestration
pnpm build
```

## 许可证

MIT
