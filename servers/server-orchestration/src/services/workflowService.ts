/**
 * 工作流服务
 * 处理AI工作流的执行和编排
 */

import { callOpenAI, LogoResult, ColorResult } from '../tools/aiTools';
import {
  Task,
  TaskStatus,
  TaskType,
  TaskParams,
  TaskResult,
  createTask,
  updateTaskStatus,
  addTaskCheckpoint,
  getTask
} from '../models/taskModel';

// 工作流接口
export interface Workflow {
  execute(task: Task): Promise<TaskResult>;
}

// 工作流状态接口
export interface WorkflowState {
  [key: string]: any;
}

// 工作流节点接口
export interface WorkflowNode {
  name: string;
  execute(state: WorkflowState): Promise<WorkflowState>;
}

// 品牌设计工作流
export class BrandDesignWorkflow implements Workflow {
  private nodes: WorkflowNode[] = [
    {
      name: 'generate_logo',
      async execute(state: WorkflowState): Promise<WorkflowState> {
        console.log('执行Logo生成节点');
        const logoResult = await callOpenAI(
          `为${state.brief.text || '未指定'}创建一个${state.brief.style || '现代简约'}风格的Logo`,
          { taskType: 'logo' }
        ) as LogoResult;

        return { ...state, logo: logoResult };
      }
    },
    {
      name: 'apply_colors',
      async execute(state: WorkflowState): Promise<WorkflowState> {
        console.log('执行配色节点');
        const colorResult = await callOpenAI(
          `为以下Logo创建配色方案: ${state.logo.description}`,
          { taskType: 'color' }
        ) as ColorResult;

        return { ...state, colors: colorResult };
      }
    }
  ];

  async execute(task: Task): Promise<TaskResult> {
    // 初始化工作流状态
    let state: WorkflowState = {
      brief: task.params,
      taskId: task.id
    };

    try {
      // 更新任务状态为处理中
      updateTaskStatus(task.id, TaskStatus.PROCESSING);

      // 执行每个节点
      for (const node of this.nodes) {
        console.log(`执行节点: ${node.name}`);

        // 添加检查点
        addTaskCheckpoint(task.id, node.name, { state });

        // 执行节点
        state = await node.execute(state);

        // 更新检查点
        addTaskCheckpoint(task.id, `${node.name}_completed`, { state });
      }

      // 构建最终结果
      const result: TaskResult = {
        logo: state.logo,
        colors: state.colors,
        assets: [
          {
            ...state.logo,
            colors: state.colors
          }
        ]
      };

      // 更新任务状态为完成
      updateTaskStatus(task.id, TaskStatus.COMPLETED, result);

      return result;
    } catch (error: any) {
      // 更新任务状态为失败
      updateTaskStatus(task.id, TaskStatus.FAILED, undefined, error.message || '未知错误');
      throw error;
    }
  }
}

// 调试工作流
export class DebugWorkflow implements Workflow {
  async execute(task: Task): Promise<TaskResult> {
    // 更新任务状态为处理中
    updateTaskStatus(task.id, TaskStatus.PROCESSING);

    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 构建调试结果
    const result: TaskResult = {
      debug: true,
      params: task.params,
      timestamp: new Date().toISOString(),
      message: '调试工作流执行成功'
    };

    // 更新任务状态为完成
    updateTaskStatus(task.id, TaskStatus.COMPLETED, result);

    return result;
  }
}

// 工作流工厂
export class WorkflowFactory {
  static createWorkflow(taskType: TaskType): Workflow {
    switch (taskType) {
      case TaskType.GENERATE_LOGO:
        return new BrandDesignWorkflow();
      case TaskType.DEBUG_FLOW:
        return new DebugWorkflow();
      default:
        throw new Error(`不支持的任务类型: ${taskType}`);
    }
  }
}

/**
 * 执行工作流
 * @param type 任务类型
 * @param params 任务参数
 * @param sessionId 会话ID
 * @returns 任务对象
 */
export async function executeWorkflow(
  type: TaskType,
  params: TaskParams,
  sessionId?: string
): Promise<Task> {
  // 创建任务
  const task = createTask(type, params, sessionId);

  try {
    // 创建工作流
    const workflow = WorkflowFactory.createWorkflow(type);

    // 异步执行工作流
    setTimeout(async () => {
      try {
        await workflow.execute(task);

        // 通过WebSocket发送任务完成通知
        const taskObj = getTask(task.id);
        if (taskObj && global.io) {
          global.io.emit('task:update', {
            taskId: task.id,
            status: taskObj.status,
            result: taskObj.result
          });
        }
      } catch (error: any) {
        console.error(`工作流执行错误: ${error.message}`);

        // 通过WebSocket发送任务失败通知
        if (global.io) {
          global.io.emit('task:update', {
            taskId: task.id,
            status: TaskStatus.FAILED,
            error: error.message || '未知错误'
          });
        }
      }
    }, 100);

    return task;
  } catch (error: any) {
    // 更新任务状态为失败
    updateTaskStatus(task.id, TaskStatus.FAILED, undefined, error.message || '未知错误');
    throw error;
  }
}

// 为WebSocket添加全局类型声明
declare global {
  var io: any;
}
