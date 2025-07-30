import { Context } from 'koa';
import { nanoid } from 'nanoid';
import { brandDesignFlow } from '../graphs/brandDesign';
import { z } from 'zod';

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

    // 执行工作流
    const result = await workflow.invoke({
      brief: params,
      sessionId
    });

    // 生成任务ID
    const taskId = nanoid(10);

    // 返回结果
    ctx.body = {
      taskId,
      previewUrl: `/preview/${taskId}.html`,
      assets: result.assets
    };

  } catch (error) {
    console.error('指令处理错误:', error);

    // 处理不同类型的错误
    if (error instanceof z.ZodError) {
      ctx.status = 400;
      ctx.body = { error: '请求参数无效', details: error.errors };
    } else if (error.message.includes('timeout')) {
      ctx.status = 504;
      ctx.body = { error: 'AI处理超时' };
    } else if (error.message.includes('rate limit')) {
      ctx.status = 429;
      ctx.body = { error: '超出AI配额' };
    } else {
      ctx.status = 500;
      ctx.body = { error: '服务器内部错误' };
    }
  }
};
