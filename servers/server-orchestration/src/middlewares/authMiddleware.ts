/**
 * 认证中间件
 * 处理用户认证和授权
 */

import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// 用户角色枚举
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin'
}

// 用户接口
export interface User {
  id: string;
  username: string;
  role: UserRole;
}

// JWT载荷接口
export interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  exp?: number;
}

/**
 * 生成JWT令牌
 * @param user 用户对象
 * @param expiresIn 过期时间（秒）
 * @returns JWT令牌
 */
export function generateToken(user: User, expiresIn: number = 3600): string {
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证JWT令牌
 * @param token JWT令牌
 * @returns 解码的载荷或null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 认证中间件
 * @param ctx Koa上下文
 * @param next 下一个中间件
 */
export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  try {
    // 从请求头获取令牌
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: '未提供认证令牌' };
      return;
    }

    // 提取令牌
    const token = authHeader.substring(7);

    // 验证令牌
    const payload = verifyToken(token);
    if (!payload) {
      ctx.status = 401;
      ctx.body = { error: '无效的认证令牌' };
      return;
    }

    // 将用户信息添加到上下文
    ctx.state.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role
    };

    // 继续处理请求
    await next();
  } catch (error: any) {
    ctx.status = 401;
    ctx.body = { error: '认证失败', message: error.message };
  }
}

/**
 * 角色授权中间件
 * @param requiredRoles 所需角色
 * @returns Koa中间件
 */
export function roleMiddleware(requiredRoles: UserRole[]): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    // 检查用户是否已认证
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = { error: '未认证的用户' };
      return;
    }

    // 检查用户角色
    const userRole = ctx.state.user.role;
    if (!requiredRoles.includes(userRole)) {
      ctx.status = 403;
      ctx.body = { error: '权限不足', requiredRoles };
      return;
    }

    // 继续处理请求
    await next();
  };
}

/**
 * 可选认证中间件
 * 如果提供了令牌，则验证并添加用户信息到上下文
 * 如果未提供令牌，则继续处理请求
 * @param ctx Koa上下文
 * @param next 下一个中间件
 */
export async function optionalAuthMiddleware(ctx: Context, next: Next): Promise<void> {
  try {
    // 从请求头获取令牌
    const authHeader = ctx.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 提取令牌
      const token = authHeader.substring(7);

      // 验证令牌
      const payload = verifyToken(token);
      if (payload) {
        // 将用户信息添加到上下文
        ctx.state.user = {
          id: payload.id,
          username: payload.username,
          role: payload.role
        };
      }
    }

    // 继续处理请求
    await next();
  } catch (error) {
    // 忽略错误，继续处理请求
    await next();
  }
}
