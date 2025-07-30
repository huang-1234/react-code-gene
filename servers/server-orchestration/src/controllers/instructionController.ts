import { Context } from 'koa';
import { nanoid } from 'nanoid';
import { brandDesignFlow } from '../graphs/brandDesign';
import { z } from 'zod';
// import { saveWorkflowState } from '../utils/redis'; // Redis功能预留

// 为WebSocket添加全局类型声明
declare global {
  var io: any;
}

// 指令请求验证模式
const instructionSchema = z.object({
  task: z.string(),
  params: z.record(z.unknown()),
  sessionId: z.string().uuid().optional()
});

/**
 * 处理AI指令
 * @param ctx Koa上下文
 */
export const handleInstructions = async (ctx: Context) => {
  try {
    // 验证请求体
    const validatedData = instructionSchema.parse(ctx.request.body);
    const { task, params, sessionId = nanoid() } = validatedData;

    // 根据任务类型选择工作流
    let workflow;
    switch (task) {
      case 'generate_logo':
        workflow = brandDesignFlow;
        break;
      default:
        ctx.status = 400;
        ctx.body = { error: '不支持的任务类型' };
        return;
    }

    // 生成任务ID
    const taskId = nanoid(10);

    // 执行工作流 (异步执行，不阻塞响应)
    setTimeout(async () => {
      try {
        console.log(`开始执行任务 ${taskId}`);

        // 执行工作流
        const result = await workflow.invoke({
          brief: params,
          sessionId
        });

        // 保存工作流状态 (Redis功能预留)
        // await saveWorkflowState(taskId, result);

        // 通过WebSocket发送任务完成通知
        const io = global.io;
        if (io) {
          io.emit('task:update', {
            taskId,
            status: 'completed',
            result: result.assets
          });
        }

        console.log(`任务 ${taskId} 执行完成`);
      } catch (error) {
        console.error(`任务 ${taskId} 执行失败:`, error);

        // 通过WebSocket发送任务失败通知
        const io = global.io;
        if (io) {
          io.emit('task:update', {
            taskId,
            status: 'failed',
            error: error.message
          });
        }
      }
    }, 100);

    // 立即返回任务创建成功响应
    ctx.body = {
      taskId,
      previewUrl: `/preview/${taskId}.html`,
      status: 'processing'
    };

  } catch (error: Error) {
    console.error('指令处理错误:', error);

    // 处理不同类型的错误
    if (error instanceof z.ZodError) {
      ctx.status = 400;
      ctx.body = { error: '请求参数无效', details: error.errors };
    } else if (error.message && error.message.includes('timeout')) {
      ctx.status = 504;
      ctx.body = { error: 'AI处理超时' };
    } else if (error.message && error.message.includes('rate limit')) {
      ctx.status = 429;
      ctx.body = { error: '超出AI配额' };
    } else {
      ctx.status = 500;
      ctx.body = { error: '服务器内部错误' };
    }
  }
};
