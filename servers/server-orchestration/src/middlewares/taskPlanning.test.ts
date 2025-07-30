import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  planTask,
  generateTaskGraph,
  generateExecutionPlan,
  taskPlanningMiddleware,
  generateTaskGraphVisualization,
  TaskNodeType
} from './taskPlanning';
import { addTaskCheckpoint } from '../models/taskModel';

// 模拟taskModel中的addTaskCheckpoint函数
vi.mock('../models/taskModel', () => ({
  addTaskCheckpoint: vi.fn(),
  TaskStatus: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  TaskType: {
    GENERATE_LOGO: 'generate_logo',
    GENERATE_COLOR: 'generate_color',
    GENERATE_IMAGE: 'generate_image',
    GENERATE_AUDIO: 'generate_audio',
    GENERATE_CODE: 'generate_code',
    DEBUG_FLOW: 'debug_flow'
  }
}));

describe('任务规划中间件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('planTask 函数测试', () => {
    it('应该为logo任务生成正确的任务规划', async () => {
      const brief = { taskType: 'logo', text: '测试Logo', style: '现代简约' };
      const result = await planTask(brief);

      expect(result).toHaveLength(6); // 开始、分析需求、生成概念、创建Logo、生成配色、结束
      expect(result[0].type).toBe(TaskNodeType.START);
      expect(result[5].type).toBe(TaskNodeType.END);

      // 验证任务节点名称
      const nodeNames = result.map(node => node.name);
      expect(nodeNames).toContain('分析需求');
      expect(nodeNames).toContain('生成概念');
      expect(nodeNames).toContain('创建Logo');
      expect(nodeNames).toContain('生成配色');
    });

    it('应该为code任务生成正确的任务规划', async () => {
      const brief = { taskType: 'code', language: 'javascript' };
      const result = await planTask(brief);

      expect(result).toHaveLength(6); // 开始、分析需求、设计架构、生成代码、测试代码、结束
      expect(result[0].type).toBe(TaskNodeType.START);
      expect(result[5].type).toBe(TaskNodeType.END);

      // 验证任务节点名称
      const nodeNames = result.map(node => node.name);
      expect(nodeNames).toContain('分析需求');
      expect(nodeNames).toContain('设计架构');
      expect(nodeNames).toContain('生成代码');
      expect(nodeNames).toContain('测试代码');
    });

    it('应该为未知任务类型生成默认任务规划', async () => {
      const brief = { taskType: 'unknown' };
      const result = await planTask(brief);

      expect(result).toHaveLength(3); // 开始、处理任务、结束
      expect(result[0].type).toBe(TaskNodeType.START);
      expect(result[1].type).toBe(TaskNodeType.PROCESS);
      expect(result[2].type).toBe(TaskNodeType.END);
    });
  });

  describe('generateTaskGraph 函数测试', () => {
    it('应该根据任务节点正确生成任务图', () => {
      const nodes = [
        {
          id: 'start',
          type: TaskNodeType.START,
          name: '开始任务'
        },
        {
          id: 'process',
          type: TaskNodeType.PROCESS,
          name: '处理任务',
          dependencies: ['start']
        },
        {
          id: 'end',
          type: TaskNodeType.END,
          name: '结束任务',
          dependencies: ['process']
        }
      ];

      const graph = generateTaskGraph(nodes);

      expect(graph.nodes).toEqual(nodes);
      expect(graph.edges).toHaveLength(2);
      expect(graph.edges[0]).toEqual({ from: 'start', to: 'process' });
      expect(graph.edges[1]).toEqual({ from: 'process', to: 'end' });
    });

    it('应该处理没有依赖关系的节点', () => {
      const nodes = [
        {
          id: 'node1',
          type: TaskNodeType.PROCESS,
          name: '节点1'
        },
        {
          id: 'node2',
          type: TaskNodeType.PROCESS,
          name: '节点2'
        }
      ];

      const graph = generateTaskGraph(nodes);

      expect(graph.nodes).toEqual(nodes);
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe('generateExecutionPlan 函数测试', () => {
    it('应该根据任务图正确生成执行计划', () => {
      const graph = {
        nodes: [
          {
            id: 'start',
            type: TaskNodeType.START,
            name: '开始任务'
          },
          {
            id: 'process1',
            type: TaskNodeType.PROCESS,
            name: '处理任务1'
          },
          {
            id: 'process2',
            type: TaskNodeType.PROCESS,
            name: '处理任务2'
          },
          {
            id: 'end',
            type: TaskNodeType.END,
            name: '结束任务'
          }
        ],
        edges: [
          { from: 'start', to: 'process1' },
          { from: 'start', to: 'process2' },
          { from: 'process1', to: 'end' },
          { from: 'process2', to: 'end' }
        ]
      };

      const plan = generateExecutionPlan(graph);

      expect(plan.steps).toHaveLength(4);
      expect(plan.parallelGroups).toBeDefined();
      expect(plan.parallelGroups?.length).toBeGreaterThan(0);

      // 验证并行组
      const parallelGroup = plan.parallelGroups?.[0];
      expect(parallelGroup?.nodeIds).toContain('process1');
      expect(parallelGroup?.nodeIds).toContain('process2');
    });

    it('应该检测到循环依赖并抛出错误', () => {
      const graph = {
        nodes: [
          { id: 'node1', type: TaskNodeType.PROCESS, name: '节点1' },
          { id: 'node2', type: TaskNodeType.PROCESS, name: '节点2' },
          { id: 'node3', type: TaskNodeType.PROCESS, name: '节点3' }
        ],
        edges: [
          { from: 'node1', to: 'node2' },
          { from: 'node2', to: 'node3' },
          { from: 'node3', to: 'node1' } // 循环依赖
        ]
      };

      expect(() => generateExecutionPlan(graph)).toThrow(/循环依赖/);
    });
  });

  describe('taskPlanningMiddleware 函数测试', () => {
    it('应该为API请求添加任务规划', async () => {
      // 模拟Koa上下文
      const ctx = {
        path: '/api/instructions',
        method: 'POST',
        request: {
          body: {
            task: 'generate_logo',
            params: { text: '测试Logo', style: '现代简约' },
            taskId: 'test-task-id',
            taskPlan: {
              nodes: [],
              graph: {
                nodes: [],
                edges: []
              },
              executionPlan: {
                steps: [],
                parallelGroups: []
              }
            }
          }
        },
        state: {
          task: { id: 'test-task-id' }
        }
      };

      const next = vi.fn();

      await taskPlanningMiddleware(ctx as any, next);

      // 验证next被调用
      expect(next).toHaveBeenCalled();

      // 验证请求体中添加了任务规划
      expect(ctx.request.body.taskPlan).toBeDefined();
      expect(ctx.request.body.taskPlan.nodes).toBeDefined();
      expect(ctx.request.body.taskPlan.graph).toBeDefined();
      expect(ctx.request.body.taskPlan.executionPlan).toBeDefined();

      // 验证添加了任务检查点
      expect(addTaskCheckpoint).toHaveBeenCalledWith(
        'test-task-id',
        'task_planning',
        expect.objectContaining({
          nodes: expect.any(Array),
          graph: expect.objectContaining({
            nodes: expect.any(Array),
            edges: expect.any(Array)
          }),
          executionPlan: expect.objectContaining({
            steps: expect.any(Array)
          })
        })
      );
    });

    it('应该跳过非指令API请求', async () => {
      // 模拟Koa上下文
      const ctx = {
        path: '/api/other',
        method: 'GET'
      };

      const next = vi.fn();

      await taskPlanningMiddleware(ctx as any, next);

      // 验证next被调用
      expect(next).toHaveBeenCalled();

      // 验证没有添加任务检查点
      expect(addTaskCheckpoint).not.toHaveBeenCalled();
    });

    it('应该跳过已有taskId的请求', async () => {
      // 模拟Koa上下文
      const ctx = {
        path: '/api/instructions',
        method: 'POST',
        request: {
          body: {
            task: 'generate_logo',
            params: { text: '测试Logo' },
            taskId: 'existing-task-id',
            taskPlan: {
              nodes: [],
              graph: {
                nodes: [],
                edges: []
              },
              executionPlan: {
                steps: [],
                parallelGroups: []
              }
            }
          }
        },
        state: {
          task: { id: 'existing-task-id' }
        }
      };

      const next = vi.fn();

      await taskPlanningMiddleware(ctx as any, next);

      // 验证next被调用
      expect(next).toHaveBeenCalled();

      // 验证没有添加任务规划
      expect(ctx.request.body.taskPlan).toBeUndefined();

      // 验证没有添加任务检查点
      expect(addTaskCheckpoint).not.toHaveBeenCalled();
    });

    it('应该处理错误并设置适当的响应', async () => {
      // 模拟Koa上下文
      const ctx = {
        path: '/api/instructions',
        method: 'POST',
        request: {
          body: null // 故意设置为null以触发错误
        },
        status: 200,
        body: { error: '任务规划失败' }
      };

      const next = vi.fn();

      await taskPlanningMiddleware(ctx as any, next);

      // 验证next没有被调用
      expect(next).not.toHaveBeenCalled();

      // 验证错误响应
      expect(ctx.status).toBe(500);
      expect(ctx.body.error).toBe('任务规划失败');
    });
  });

  describe('generateTaskGraphVisualization 函数测试', () => {
    it('应该生成正确的Mermaid图表代码', () => {
      const graph = {
        nodes: [
          { id: 'start', type: TaskNodeType.START, name: '开始任务' },
          { id: 'process', type: TaskNodeType.PROCESS, name: '处理任务' },
          { id: 'end', type: TaskNodeType.END, name: '结束任务' }
        ],
        edges: [
          { from: 'start', to: 'process' },
          { from: 'process', to: 'end' }
        ]
      };

      const mermaidCode = generateTaskGraphVisualization(graph);

      expect(mermaidCode).toContain('graph TD;');
      expect(mermaidCode).toContain('start(([');
      expect(mermaidCode).toContain('process[');
      expect(mermaidCode).toContain('end(([');
      expect(mermaidCode).toContain('start --> process');
      expect(mermaidCode).toContain('process --> end');
    });

    it('应该为不同类型的节点使用不同的形状', () => {
      const graph = {
        nodes: [
          { id: 'start', type: TaskNodeType.START, name: '开始' },
          { id: 'process', type: TaskNodeType.PROCESS, name: '处理' },
          { id: 'decision', type: TaskNodeType.DECISION, name: '决策' },
          { id: 'parallel', type: TaskNodeType.PARALLEL, name: '并行' },
          { id: 'end', type: TaskNodeType.END, name: '结束' }
        ],
        edges: []
      };

      const mermaidCode = generateTaskGraphVisualization(graph);

      expect(mermaidCode).toContain('start(([');
      expect(mermaidCode).toContain('process[');
      expect(mermaidCode).toContain('decision{');
      expect(mermaidCode).toContain('parallel{{');
      expect(mermaidCode).toContain('end(([');
    });
  });
});
