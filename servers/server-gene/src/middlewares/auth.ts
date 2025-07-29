import jwt from 'koa-jwt';
import { Context, Next } from 'koa';

// JWT认证中间件
export const auth = () =>
  jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    key: 'user' // 注入ctx.state.user
  }).unless({
    path: [/^\/login/, /^\/public/, /^\/$/, /^\/api\/public/]
  });

// 权限检查中间件
export const checkPermission = (requiredRole: string) =>
  async (ctx: Context, next: Next) => {
    if (ctx.state.user?.role !== requiredRole) {
      ctx.status = 403;
      ctx.body = {
        status: 'error',
        message: '权限不足'
      };
      return;
    }
    await next();
  };