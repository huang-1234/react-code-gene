import Redis from 'ioredis';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Redis配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    // 重试策略
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// 创建Redis客户端
export const redisClient = new Redis(redisConfig);

// 连接事件处理
redisClient.on('connect', () => {
  console.log('Redis连接成功');
});

redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

/**
 * 设置缓存
 * @param key 键
 * @param value 值
 * @param ttl 过期时间(秒)
 */
export const setCache = async (key: string, value: any, ttl?: number): Promise<void> => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl) {
      await redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await redisClient.set(key, stringValue);
    }
  } catch (error) {
    console.error('Redis设置缓存错误:', error);
    throw error;
  }
};

/**
 * 获取缓存
 * @param key 键
 * @returns 缓存值
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redisClient.get(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (error) {
    console.error('Redis获取缓存错误:', error);
    return null;
  }
};

/**
 * 删除缓存
 * @param key 键
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis删除缓存错误:', error);
    throw error;
  }
};

/**
 * 保存工作流状态
 * @param taskId 任务ID
 * @param state 状态
 */
export const saveWorkflowState = async (taskId: string, state: any): Promise<void> => {
  await setCache(`workflow:${taskId}`, state, 3600); // 1小时过期
};

/**
 * 获取工作流状态
 * @param taskId 任务ID
 * @returns 工作流状态
 */
export const getWorkflowState = async <T>(taskId: string): Promise<T | null> => {
  return await getCache<T>(`workflow:${taskId}`);
};

export default redisClient;

