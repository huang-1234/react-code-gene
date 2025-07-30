import Router from '@koa/router';
import { handleInstructions } from '../controllers/instructionController';
import { handleHealth } from '../controllers/healthController';

const router = new Router({ prefix: '/api' });

// 健康检查
router.get('/health', handleHealth);

// AI指令处理
router.post('/instructions', handleInstructions);

export default router;
