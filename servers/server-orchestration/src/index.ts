import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from 'koa-cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 导入路由
import apiRouter from './routes/api.js';

// 创建Koa应用
const app = new Koa();
const router = new Router();

// 创建HTTP服务器
const httpServer = createServer(app.callback());

// 创建WebSocket服务器
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(logger());
app.use(cors());
app.use(bodyParser());

// 路由
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // 任务状态更新
  socket.on('task:status', (data) => {
    console.log('Task status update:', data);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
