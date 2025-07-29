import { useState } from 'react'
import './App.css'
import { TaskManager } from './components/TaskManager'

function App() {
  const [count, setCount] = useState(0)

  const handleTaskComplete = (taskId: string) => {
    console.log(`任务 ${taskId} 已完成`);
    // 这里可以添加任务完成后的逻辑
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>React代码自动生成</h1>
        <p>基于React18+TS5+Vite的前端应用</p>
      </header>
      <main>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            点击计数: {count}
          </button>
          <p>
            编辑 <code>src/App.tsx</code> 并保存以测试HMR
          </p>
        </div>

        <div className="task-manager-container" style={{ marginTop: '2rem' }}>
          <h2>需求解析与任务规划</h2>
          <TaskManager onTaskComplete={handleTaskComplete} />
        </div>
      </main>
    </div>
  )
}

export default App