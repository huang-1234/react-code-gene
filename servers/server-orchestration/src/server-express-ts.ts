/**
 * Express服务器 - TypeScript版本
 * 集成工作流服务和AI工具
 */

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

// 导入服务和模型
import { executeWorkflow } from './services/workflowService';
import { TaskType, TaskStatus } from './models/taskModel';
import { optionalAuthMiddleware, UserRole, roleMiddleware } from './middlewares/authMiddleware';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 设置全局io变量
(global as any).io = io;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 健康检查接口
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// AI指令处理接口
app.post('/api/instructions', async (req: Request, res: Response) => {
  try {
    const { task, params, sessionId = nanoid() } = req.body;

    // 验证任务类型
    let taskType: TaskType;
    switch (task) {
      case 'generate_logo':
        taskType = TaskType.GENERATE_LOGO;
        break;
      case 'debug_flow':
        taskType = TaskType.DEBUG_FLOW;
        break;
      default:
        return res.status(400).json({ error: '不支持的任务类型' });
    }

    // 执行工作流
    const taskObj = await executeWorkflow(taskType, params, sessionId);

    // 返回任务创建成功响应
    res.json({
      taskId: taskObj.id,
      previewUrl: `/preview/${taskObj.id}.html`,
      status: taskObj.status
    });

  } catch (error: any) {
    console.error('指令处理错误:', error);
    res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
});

// 获取任务状态接口
app.get('/api/tasks/:taskId', (req: Request, res: Response) => {
  // 此接口预留，实际实现需要从任务存储中获取任务
  res.json({
    taskId: req.params.taskId,
    status: TaskStatus.PROCESSING,
    message: '任务正在处理中'
  });
});

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // 任务状态更新
  socket.on('task:status', (data) => {
    console.log('Task status update:', data);

    // 广播任务状态更新给所有客户端
    io.emit('task:update', {
      taskId: data.taskId,
      status: data.status,
      result: data.result
    });
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`💡 注意: Redis功能已预留接口但暂未实现`);
  console.log(`💻 注意: 当前版本不支持移动端显示`);
});
