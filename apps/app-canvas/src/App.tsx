import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CanvasController from './components/CanvasController';
import useCanvasStore from './stores/canvasStore';
import { sendInstruction, checkHealth } from './services/api';
import './App.css';

function App() {
  // 状态
  const [connected, setConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [taskResult, setTaskResult] = useState<any>(null);

  // 从状态库获取会话ID
  const { sessionId, setSessionId } = useCanvasStore();

  // 初始化WebSocket连接
  useEffect(() => {
    const socket = io();

    socket.on('connect', () => {
      console.log('WebSocket已连接');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket已断开');
      setConnected(false);
    });

    socket.on('task:update', (data) => {
      console.log('任务状态更新:', data);
      if (data.taskId && data.status === 'completed') {
        setTaskResult(data.result);
      }
    });

    // 检查服务器状态
    const checkServerStatus = async () => {
      try {
        await checkHealth();
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerStatus();

    // 生成会话ID
    if (!sessionId) {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
    }

    return () => {
      socket.disconnect();
    };
  }, [sessionId, setSessionId]);

  // 处理指令提交
  const handleCommand = async (command: any) => {
    try {
      // 发送指令到服务器
      const response = await sendInstruction(
        command.type,
        command.params,
        sessionId || undefined
      );

      console.log('指令响应:', response);

      if (response.taskId) {
        // 任务创建成功
        console.log('任务ID:', response.taskId);
      } else if (response.error) {
        // 处理错误
        console.error('指令错误:', response.error);
      }
    } catch (error) {
      console.error('指令发送失败:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI画布控制器</h1>
        <div className="status-indicator">
          <span className={`server-status ${serverStatus}`}>
            服务器: {serverStatus === 'online' ? '在线' : serverStatus === 'offline' ? '离线' : '检查中'}
          </span>
          <span className={`socket-status ${connected ? 'online' : 'offline'}`}>
            WebSocket: {connected ? '已连接' : '未连接'}
          </span>
        </div>
      </header>

      <main className="app-content">
        <div className="canvas-section">
          <CanvasController
            width={800}
            height={600}
            onCommand={handleCommand}
          />
        </div>

        <div className="result-section">
          <h2>AI处理结果</h2>
          {taskResult ? (
            <div className="result-content">
              <pre>{JSON.stringify(taskResult, null, 2)}</pre>
            </div>
          ) : (
            <div className="no-result">
              <p>尚无处理结果</p>
              <p>使用左侧画布发送指令</p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>会话ID: {sessionId || '未生成'}</p>
      </footer>
    </div>
  );
}

export default App;
