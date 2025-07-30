// 模拟依赖
const nanoid = {
  nanoid: () => Math.random().toString(36).substring(2, 12)
};

// 模拟Express框架
const express = function() {
  const app = {
    routes: {
      get: {},
      post: {}
    },
    use: function() { return app; },
    get: function(path, handler) {
      this.routes.get[path] = handler;
      return app;
    },
    post: function(path, handler) {
      this.routes.post[path] = handler;
      return app;
    },
    json: function() { return function() {}; }
  };
  return app;
};
express.json = function() { return function() {}; };

// 模拟HTTP服务器
const http = {
  createServer: function() {
    return {
      listen: function(port, callback) {
        console.log(`服务器模拟启动在端口 ${port}`);
        if (callback) callback();
        return this;
      }
    };
  }
};

// 模拟Socket.io
const Server = function() {
  return {
    on: function(event, handler) {
      console.log(`注册Socket.io事件: ${event}`);
      if (event === 'connection') {
        // 模拟连接
        handler({
          id: 'mock-socket-id',
          on: function(event) {
            console.log(`注册socket事件: ${event}`);
          }
        });
      }
      return this;
    },
    emit: function(event, data) {
      console.log(`发送Socket.io事件: ${event}`, data);
      return this;
    }
  };
};

// 模拟CORS中间件
const cors = function() {
  return function() {};
};

// 创建Express应用
const app = express();

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 全局变量
global.io = io;

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// AI指令处理接口
app.post('/api/instructions', (req, res) => {
  try {
    const { task, params, sessionId = nanoid() } = req.body;

    // 验证任务类型
    if (task !== 'generate_logo' && task !== 'debug_flow') {
      return res.status(400).json({ error: '不支持的任务类型' });
    }

    // 生成任务ID
    const taskId = nanoid(10);

    // 立即返回任务创建成功响应
    res.json({
      taskId,
      previewUrl: `/preview/${taskId}.html`,
      status: 'processing'
    });

    // 异步执行任务
    setTimeout(() => {
      console.log(`开始执行任务 ${taskId}`);

      // 模拟任务执行
      setTimeout(() => {
        // 生成模拟结果
        const result = {
          description: "一个现代简约风格的科技公司LOGO",
          elements: ["圆形", "三角形", "文字"],
          shape: "几何组合",
          symbolism: "代表创新与稳定",
          colors: {
            primary: "#3498db",
            secondary: "#2ecc71",
            accent: "#e74c3c",
            palette: ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f"]
          }
        };

        // 通过WebSocket发送任务完成通知
        io.emit('task:update', {
          taskId,
          status: 'completed',
          result
        });

        console.log(`任务 ${taskId} 执行完成`);
      }, 3000);

    }, 100);

  } catch (error) {
    console.error('指令处理错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
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
