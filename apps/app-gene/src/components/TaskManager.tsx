import { useState, useEffect } from 'react';
import api from '../services/api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[];
  acceptanceCriteria?: string[];
}

interface TaskManagerProps {
  onTaskComplete?: (taskId: string) => void;
}

export const TaskManager = ({ onTaskComplete }: TaskManagerProps) => {
  const [userInput, setUserInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTasks, setNextTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取下一个要执行的任务
  const fetchNextTasks = async () => {
    try {
      const response = await api.get('/api/tasks/next') as { data: Task[] };
      setNextTasks(response.data);
    } catch (err: any) {
      setError(err.message || '获取任务失败');
    }
  };

  // 获取所有任务
  const fetchAllTasks = async () => {
    try {
      const response = await api.get('/api/tasks') as { data: Task[] };
      setTasks(response.data);
      await fetchNextTasks();
    } catch (err: any) {
      setError(err.message || '获取任务失败');
    }
  };

  // 分析需求并生成任务
  const handleAnalyze = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/api/tasks/analyze', { userInput });
      await fetchAllTasks();
    } catch (err: any) {
      setError(err.message || '分析需求失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新任务状态
  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      await api.put('/api/tasks/status', { taskId, status });
      await fetchAllTasks();

      if (status === 'completed' && onTaskComplete) {
        onTaskComplete(taskId);
      }
    } catch (err: any) {
      setError(err.message || '更新任务状态失败');
    }
  };

  // 任务优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="task-manager">
      <div className="requirement-input">
        <h2>输入需求</h2>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="输入您的需求描述..."
          rows={5}
          style={{ width: '100%', padding: '8px' }}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !userInput.trim()}
          style={{ marginTop: '10px', padding: '8px 16px' }}
        >
          {loading ? '分析中...' : '分析需求'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          错误: {error}
        </div>
      )}

      {nextTasks.length > 0 && (
        <div className="next-tasks">
          <h3>下一步任务</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {nextTasks.map(task => (
              <li key={task.id} style={{
                border: '1px solid #eee',
                padding: '10px',
                margin: '10px 0',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`
              }}>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                    开始任务
                  </button>
                  <button onClick={() => updateTaskStatus(task.id, 'completed')}>
                    标记完成
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="all-tasks">
          <h3>所有任务</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{
                border: '1px solid #eee',
                padding: '10px',
                margin: '10px 0',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                opacity: task.status === 'completed' ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4>{task.title}</h4>
                  <span>状态: {task.status}</span>
                </div>
                <p>{task.description}</p>
                {task.acceptanceCriteria && (
                  <div>
                    <strong>验收标准:</strong>
                    <ul>
                      {task.acceptanceCriteria.map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};