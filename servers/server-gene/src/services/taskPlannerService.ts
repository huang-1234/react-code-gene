// 任务规划器服务
// 注意：此文件仅包含任务规划的基本结构，实际LangGraph实现需要额外依赖

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[];
}

interface RequirementAnalysisResult {
  requirements: string[];
  priority: Record<string, number>;
}

/**
 * 分析需求并生成结构化文档
 */
export const analyzeRequirements = async (userInput: string): Promise<RequirementAnalysisResult> => {
  // 实际实现中，这里会使用LangChain调用LLM进行需求解析
  // 示例实现
  return {
    requirements: [
      '用户需要能够登录和注册',
      '系统需要展示任务列表',
      '用户可以创建新任务',
      '任务可以标记为完成'
    ],
    priority: {
      '用户需要能够登录和注册': 1,
      '系统需要展示任务列表': 2,
      '用户可以创建新任务': 3,
      '任务可以标记为完成': 4
    }
  };
};

/**
 * 生成任务计划
 */
export const generateTasks = async (requirements: RequirementAnalysisResult): Promise<Task[]> => {
  // 实际实现中，这里会使用LangGraph构建任务DAG
  // 示例实现
  const tasks: Task[] = [];

  // 用户认证相关任务
  if (requirements.priority['用户需要能够登录和注册'] !== undefined) {
    tasks.push({
      id: '1',
      title: '实现JWT认证中间件',
      description: '创建JWT认证中间件，处理token验证和用户身份',
      status: 'pending',
      priority: 'high'
    });

    tasks.push({
      id: '2',
      title: '创建用户模型',
      description: '定义用户数据模型和验证规则',
      status: 'pending',
      priority: 'high'
    });

    tasks.push({
      id: '3',
      title: '实现登录和注册API',
      description: '创建用户登录和注册的API端点',
      status: 'pending',
      priority: 'high',
      dependencies: ['1', '2']
    });

    tasks.push({
      id: '4',
      title: '创建登录和注册页面',
      description: '实现前端登录和注册表单及验证',
      status: 'pending',
      priority: 'high',
      dependencies: ['3']
    });
  }

  // 任务列表相关
  if (requirements.priority['系统需要展示任务列表'] !== undefined) {
    tasks.push({
      id: '5',
      title: '创建任务数据模型',
      description: '定义任务数据结构和关系',
      status: 'pending',
      priority: 'medium'
    });

    tasks.push({
      id: '6',
      title: '实现任务列表API',
      description: '创建获取任务列表的API端点',
      status: 'pending',
      priority: 'medium',
      dependencies: ['5']
    });

    tasks.push({
      id: '7',
      title: '创建任务列表组件',
      description: '实现前端任务列表展示组件',
      status: 'pending',
      priority: 'medium',
      dependencies: ['6']
    });
  }

  return tasks;
};

/**
 * 生成任务验收标准
 */
export const generateAcceptanceCriteria = (task: Task): string[] => {
  // 根据任务生成验收标准
  switch (task.id) {
    case '1': // JWT中间件
      return [
        '中间件能正确验证有效的JWT token',
        '无效token返回401错误',
        '特定路由可以配置为不需要认证'
      ];
    case '3': // 登录API
      return [
        'API返回有效的JWT token',
        '错误的凭证返回适当的错误消息',
        'API遵循RESTful设计原则'
      ];
    default:
      return ['功能按预期工作', '代码遵循项目编码规范', '包含必要的测试'];
  }
};

/**
 * 构建任务依赖图
 */
export const buildTaskDependencyGraph = (tasks: Task[]): Record<string, string[]> => {
  const graph: Record<string, string[]> = {};

  tasks.forEach(task => {
    graph[task.id] = task.dependencies || [];
  });

  return graph;
};

/**
 * 获取下一个应该执行的任务
 */
export const getNextTasks = (tasks: Task[], completedTaskIds: string[]): Task[] => {
  return tasks.filter(task => {
    // 任务未完成
    if (task.status === 'completed' || task.status === 'in_progress') {
      return false;
    }

    // 没有依赖或所有依赖都已完成
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => completedTaskIds.includes(depId));
  });
};