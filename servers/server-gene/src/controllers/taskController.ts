import { Context } from 'koa';
import {
  analyzeRequirements,
  generateTasks,
  generateAcceptanceCriteria,
  getNextTasks
} from '../services/taskPlannerService.js';

// 内存存储（实际应用中应使用数据库）
let tasks: any[] = [];
const completedTaskIds: string[] = [];

interface RequestBody {
  userInput?: string;
  taskId?: string;
  status?: string;
}

/**
 * 分析用户需求并生成任务
 */
export const analyzeAndGenerateTasks = async (ctx: Context) => {
  try {
    const { userInput } = ctx.request.body as RequestBody;

    if (!userInput) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: '需要提供用户需求输入'
      };
      return;
    }

    // 分析需求
    const requirementAnalysis = await analyzeRequirements(userInput);

    // 生成任务
    tasks = await generateTasks(requirementAnalysis);

    // 为每个任务添加验收标准
    const tasksWithCriteria = tasks.map(task => ({
      ...task,
      acceptanceCriteria: generateAcceptanceCriteria(task)
    }));

    ctx.body = {
      status: 'success',
      data: {
        requirements: requirementAnalysis.requirements,
        tasks: tasksWithCriteria
      }
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message || '生成任务时出错'
    };
  }
};

/**
 * 获取所有任务
 */
export const getAllTasks = (ctx: Context) => {
  ctx.body = {
    status: 'success',
    data: tasks
  };
};

/**
 * 获取下一个要执行的任务
 */
export const getNextTasksToExecute = (ctx: Context) => {
  const nextTasks = getNextTasks(tasks, completedTaskIds);

  ctx.body = {
    status: 'success',
    data: nextTasks
  };
};

/**
 * 更新任务状态
 */
export const updateTaskStatus = (ctx: Context) => {
  const { taskId, status } = ctx.request.body as RequestBody;

  if (!taskId || !status) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: '需要提供任务ID和状态'
    };
    return;
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      status: 'error',
      message: '任务未找到'
    };
    return;
  }

  // 更新任务状态
  tasks[taskIndex].status = status;

  // 如果任务已完成，添加到已完成列表
  if (status === 'completed' && !completedTaskIds.includes(taskId)) {
    completedTaskIds.push(taskId);
  }

  ctx.body = {
    status: 'success',
    data: tasks[taskIndex]
  };
};