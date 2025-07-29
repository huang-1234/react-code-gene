# React代码自动生成

基于React18+TS5+Vite前端和Node.js+Koa后端技术栈的代码自动生成系统。

## 项目结构

```
react-code-gene/
  ├── apps/                # 前端应用
  │   └── app-gene/        # React前端应用
  ├── libs/                # 共享库
  │   └── shared-types/    # 共享类型定义
  └── servers/             # 后端服务
      └── server-gene/     # Koa后端服务
```

## 技术栈

### 前端
- React 18
- TypeScript 5
- Vite
- Zustand (状态管理)
- Axios (HTTP请求)

### 后端
- Node.js
- Koa
- TypeScript
- JWT认证
- LangChain

## 功能特性

- 需求解析引擎：解析用户自然语言需求
- 任务规划器：基于LangGraph实现DAG任务流
- Figma设计解析：通过Figma API提取设计规范
- 代码生成器：基于AST转换生成React组件和Koa路由

## 开发指南

### 安装依赖

```bash
# 安装工作区依赖
pnpm install

# 安装前端依赖
cd apps/app-gene
pnpm install

# 安装后端依赖
cd ../../servers/server-gene
pnpm install

# 安装共享类型库依赖
cd ../../libs/shared-types
pnpm install
```

### 开发环境运行

```bash
# 运行前端
cd apps/app-gene
pnpm dev

# 运行后端
cd servers/server-gene
pnpm dev
```

## 部署

```bash
# 构建前端
cd apps/app-gene
pnpm build

# 构建后端
cd servers/server-gene
pnpm build
```
