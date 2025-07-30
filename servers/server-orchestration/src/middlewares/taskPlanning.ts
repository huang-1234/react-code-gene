/**
 * 任务规划中间件
 *
 * 1. 根据用户输入的brief，规划任务
 * 2. 根据任务规划，生成任务图
 * 3. 根据任务图，生成任务执行计划
 * 4. 根据任务执行计划，生成任务执行结果
 */

import { Context, Next } from 'koa';
import { callOpenAI } from '../tools/aiTools';
import { Task, TaskType, TaskParams, TaskStatus, addTaskCheckpoint } from '../models/taskModel';

// 任务节点类型
export enum TaskNodeType {
  START = 'start',
  END = 'end',
  PROCESS = 'process',
  DECISION = 'decision',
  PARALLEL = 'parallel'
}

// 任务节点接口
export interface TaskNode {
  id: string;
  type: TaskNodeType;
  name: string;
  description?: string;
  dependencies?: string[];
  params?: Record<string, any>;
}

// 任务图接口
export interface TaskGraph {
  nodes: TaskNode[];
  edges: Array<{ from: string; to: string }>;
}

// 任务执行计划接口
export interface TaskExecutionPlan {
  steps: Array<{
    nodeId: string;
    name: string;
    estimatedDuration?: number;
    retryStrategy?: string;
    fallbackNodeId?: string;
  }>;
  parallelGroups?: Array<{
    groupId: string;
    nodeIds: string[];
  }>;
}

/**
 * 根据用户输入规划任务
 * @param brief 用户输入的简要描述
 * @returns 任务规划结果
 */
export async function planTask(brief: Record<string, any>): Promise<TaskNode[]> {
  console.log('规划任务:', brief);

  // 根据brief类型生成不同的任务规划
  const taskType = brief.taskType || 'default';

  switch (taskType) {
    case 'logo':
      return [
        {
          id: 'start',
          type: TaskNodeType.START,
          name: '开始任务'
        },
        {
          id: 'analyze_brief',
          type: TaskNodeType.PROCESS,
          name: '分析需求',
          dependencies: ['start'],
          description: '分析Logo设计需求'
        },
        {
          id: 'generate_concepts',
          type: TaskNodeType.PROCESS,
          name: '生成概念',
          dependencies: ['analyze_brief'],
          description: '生成Logo概念设计'
        },
        {
          id: 'create_logo',
          type: TaskNodeType.PROCESS,
          name: '创建Logo',
          dependencies: ['generate_concepts'],
          description: '基于概念创建Logo'
        },
        {
          id: 'generate_colors',
          type: TaskNodeType.PROCESS,
          name: '生成配色',
          dependencies: ['create_logo'],
          description: '为Logo生成配色方案'
        },
        {
          id: 'end',
          type: TaskNodeType.END,
          name: '结束任务',
          dependencies: ['generate_colors']
        }
      ];

    case 'code':
      return [
        {
          id: 'start',
          type: TaskNodeType.START,
          name: '开始任务'
        },
        {
          id: 'analyze_requirements',
          type: TaskNodeType.PROCESS,
          name: '分析需求',
          dependencies: ['start'],
          description: '分析代码生成需求'
        },
        {
          id: 'design_architecture',
          type: TaskNodeType.PROCESS,
          name: '设计架构',
          dependencies: ['analyze_requirements'],
          description: '设计代码架构'
        },
        {
          id: 'generate_code',
          type: TaskNodeType.PROCESS,
          name: '生成代码',
          dependencies: ['design_architecture'],
          description: '生成代码实现'
        },
        {
          id: 'test_code',
          type: TaskNodeType.PROCESS,
          name: '测试代码',
          dependencies: ['generate_code'],
          description: '测试生成的代码'
        },
        {
          id: 'end',
          type: TaskNodeType.END,
          name: '结束任务',
          dependencies: ['test_code']
        }
      ];

    default:
      // 默认任务规划
      return [
        {
          id: 'start',
          type: TaskNodeType.START,
          name: '开始任务'
        },
        {
          id: 'process',
          type: TaskNodeType.PROCESS,
          name: '处理任务',
          dependencies: ['start'],
          description: '处理用户请求'
        },
        {
          id: 'end',
          type: TaskNodeType.END,
          name: '结束任务',
          dependencies: ['process']
        }
      ];
  }
}

/**
 * 根据任务节点生成任务图
 * @param nodes 任务节点
 * @returns 任务图
 */
export function generateTaskGraph(nodes: TaskNode[]): TaskGraph {
  const edges: Array<{ from: string; to: string }> = [];

  // 根据依赖关系生成边
  nodes.forEach(node => {
    if (node.dependencies) {
      node.dependencies.forEach(depId => {
        edges.push({
          from: depId,
          to: node.id
        });
      });
    }
  });

  return {
    nodes,
    edges
  };
}

/**
 * 根据任务图生成执行计划
 * @param graph 任务图
 * @returns 执行计划
 */
export function generateExecutionPlan(graph: TaskGraph): TaskExecutionPlan {
  const steps: TaskExecutionPlan['steps'] = [];
  const parallelGroups: TaskExecutionPlan['parallelGroups'] = [];

  // 拓扑排序
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: string[] = [];

  function visit(nodeId: string) {
    if (temp.has(nodeId)) {
      throw new Error(`任务图中存在循环依赖: ${nodeId}`);
    }

    if (!visited.has(nodeId)) {
      temp.add(nodeId);

      const node = graph.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const outgoingEdges = graph.edges.filter(e => e.from === nodeId);
      for (const edge of outgoingEdges) {
        visit(edge.to);
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      order.unshift(nodeId);
    }
  }

  // 对每个节点执行拓扑排序
  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  }

  // 根据排序结果生成执行步骤
  for (const nodeId of order) {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) continue;

    steps.push({
      nodeId: node.id,
      name: node.name,
      estimatedDuration: node.type === TaskNodeType.PROCESS ? 1000 : 0
    });
  }

  // 检测并标记可并行执行的任务组
  const nodeToLevel = new Map<string, number>();

    // 计算每个节点的层级
  function calculateLevels() {
    // 初始化所有节点的层级为-1
    graph.nodes.forEach(node => nodeToLevel.set(node.id, -1));

    // 设置起始节点的层级为0
    const startNodes = graph.nodes.filter(node => node.type === TaskNodeType.START);
    startNodes.forEach(node => nodeToLevel.set(node.id, 0));

    // 广度优先搜索计算层级
    let changed = true;
    while (changed) {
      changed = false;

      for (const edge of graph.edges) {
        const fromLevel = nodeToLevel.get(edge.from) ?? -1;
        const toLevel = nodeToLevel.get(edge.to) ?? -1;

        if (fromLevel !== -1 && (toLevel === -1 || toLevel < fromLevel + 1)) {
          nodeToLevel.set(edge.to, fromLevel + 1);
          changed = true;
        }
      }
    }
  }

  calculateLevels();

  // 根据层级分组
  const levelToNodes = new Map<number, string[]>();

  nodeToLevel.forEach((level, nodeId) => {
    if (level > 0) { // 跳过开始节点
      if (!levelToNodes.has(level)) {
        levelToNodes.set(level, []);
      }
      levelToNodes.get(level)?.push(nodeId);
    }
  });

  // 创建并行组
  levelToNodes.forEach((nodeIds, level) => {
    if (nodeIds.length > 1) {
      parallelGroups.push({
        groupId: `parallel_group_${level}`,
        nodeIds
      });
    }
  });

  return {
    steps,
    parallelGroups: parallelGroups.length > 0 ? parallelGroups : undefined
  };
}

/**
 * 任务规划中间件
 * @param ctx Koa上下文
 * @param next 下一个中间件
 */
export async function taskPlanningMiddleware(ctx: Context, next: Next): Promise<void> {
  // 检查是否需要任务规划
  if (ctx.path !== '/api/instructions' || ctx.method !== 'POST') {
    return next();
  }

  try {
    const body = ctx.request.body as { task: string; params: Record<string, any>; taskId?: string };
    const { task, params, taskId } = body;

    // 如果已经有taskId，说明任务已经创建，跳过规划
    if (taskId) {
      return next();
    }

    // 1. 规划任务
    const taskNodes = await planTask(params);

    // 2. 生成任务图
    const taskGraph = generateTaskGraph(taskNodes);

    // 3. 生成执行计划
    const executionPlan = generateExecutionPlan(taskGraph);

    // 将规划结果添加到请求体
    (ctx.request.body as any).taskPlan = {
      nodes: taskNodes,
      graph: taskGraph,
      executionPlan
    };

    // 记录任务规划结果
    const stateTask = ctx.state.task as Task | undefined;
    if (stateTask) {
      addTaskCheckpoint(stateTask.id, 'task_planning', {
        nodes: taskNodes,
        graph: taskGraph,
        executionPlan
      });
    }

    // 继续处理请求
    await next();
  } catch (error: any) {
    console.error('任务规划错误:', error);
    ctx.status = 500;
    ctx.body = { error: '任务规划失败', message: error.message };
  }
}

/**
 * 生成任务规划的可视化表示（Mermaid图表）
 * @param graph 任务图
 * @returns Mermaid图表代码
 */
export function generateTaskGraphVisualization(graph: TaskGraph): string {
  let mermaidCode = 'graph TD;\n';

  // 添加节点
  graph.nodes.forEach(node => {
    let shape = '';
    switch (node.type) {
      case TaskNodeType.START:
        shape = '(([开始]))';
        break;
      case TaskNodeType.END:
        shape = '(([结束]))';
        break;
      case TaskNodeType.PROCESS:
        shape = '[处理]';
        break;
      case TaskNodeType.DECISION:
        shape = '{决策}';
        break;
      case TaskNodeType.PARALLEL:
        shape = '{{并行}}';
        break;
      default:
        shape = '([节点])';
    }

    mermaidCode += `  ${node.id}${shape}["${node.name}"];\n`;
  });

  // 添加边
  graph.edges.forEach(edge => {
    mermaidCode += `  ${edge.from} --> ${edge.to};\n`;
  });

  return mermaidCode;
}
