import { Context } from 'koa';

/**
 * 健康检查控制器
 * @param ctx Koa上下文
 */
export const handleHealth = async (ctx: Context) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
};
