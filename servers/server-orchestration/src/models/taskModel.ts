/**
 * 任务模型定义
 * 处理任务的数据结构和状态管理
 */

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// 任务类型枚举
export enum TaskType {
  GENERATE_LOGO = 'generate_logo',
  GENERATE_COLOR = 'generate_color',
  GENERATE_IMAGE = 'generate_image',
  GENERATE_AUDIO = 'generate_audio',
  GENERATE_CODE = 'generate_code',
  DEBUG_FLOW = 'debug_flow'
}

// 任务参数接口
export interface TaskParams {
  [key: string]: any;
}

// 任务结果接口
export interface TaskResult {
  [key: string]: any;
}

// 任务检查点接口
export interface TaskCheckpoint {
  step: string;
  timestamp: number;
  data: any;
}

// 任务接口
export interface Task {
  id: string;
  type: TaskType;
  params: TaskParams;
  status: TaskStatus;
  result?: TaskResult;
  error?: string;
  sessionId?: string;
  createdAt: number;
  updatedAt: number;
  checkpoints?: TaskCheckpoint[];
}

// 内存中的任务存储
const tasks: Map<string, Task> = new Map();

/**
 * 创建新任务
 * @param type 任务类型
 * @param params 任务参数
 * @param sessionId 会话ID
 * @returns 创建的任务
 */
export function createTask(type: TaskType, params: TaskParams, sessionId?: string): Task {
  const now = Date.now();
  const id = Math.random().toString(36).substring(2, 12);

  const task: Task = {
    id,
    type,
    params,
    status: TaskStatus.PENDING,
    sessionId,
    createdAt: now,
    updatedAt: now,
    checkpoints: []
  };

  tasks.set(id, task);
  return task;
}

/**
 * 获取任务
 * @param id 任务ID
 * @returns 任务或undefined
 */
export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

/**
 * 更新任务状态
 * @param id 任务ID
 * @param status 新状态
 * @param result 任务结果
 * @param error 错误信息
 * @returns 更新后的任务或undefined
 */
export function updateTaskStatus(
  id: string,
  status: TaskStatus,
  result?: TaskResult,
  error?: string
): Task | undefined {
  const task = tasks.get(id);
  if (!task) return undefined;

  task.status = status;
  task.updatedAt = Date.now();

  if (result !== undefined) {
    task.result = result;
  }

  if (error !== undefined) {
    task.error = error;
  }

  tasks.set(id, task);
  return task;
}

/**
 * 添加任务检查点
 * @param id 任务ID
 * @param step 步骤名称
 * @param data 检查点数据
 * @returns 更新后的任务或undefined
 */
export function addTaskCheckpoint(id: string, step: string, data: any): Task | undefined {
  const task = tasks.get(id);
  if (!task) return undefined;

  const checkpoint: TaskCheckpoint = {
    step,
    timestamp: Date.now(),
    data
  };

  if (!task.checkpoints) {
    task.checkpoints = [];
  }

  task.checkpoints.push(checkpoint);
  task.updatedAt = Date.now();

  tasks.set(id, task);
  return task;
}

/**
 * 获取会话的所有任务
 * @param sessionId 会话ID
 * @returns 任务数组
 */
export function getSessionTasks(sessionId: string): Task[] {
  return Array.from(tasks.values()).filter(task => task.sessionId === sessionId);
}

/**
 * 删除任务
 * @param id 任务ID
 * @returns 是否删除成功
 */
export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}

/**
 * 清理过期任务
 * @param maxAge 最大年龄（毫秒）
 * @returns 删除的任务数量
 */
export function cleanupTasks(maxAge: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let count = 0;

  for (const [id, task] of tasks.entries()) {
    if (now - task.updatedAt > maxAge) {
      tasks.delete(id);
      count++;
    }
  }

  return count;
}
