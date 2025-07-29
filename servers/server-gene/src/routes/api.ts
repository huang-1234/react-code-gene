import Router from 'koa-router';
import { auth, checkPermission } from '../middlewares/auth.js';
import {
  analyzeAndGenerateTasks,
  getAllTasks,
  getNextTasksToExecute,
  updateTaskStatus
} from '../controllers/taskController.js';

const router = new Router({ prefix: '/api' });

// 公开API
router.get('/public/status', (ctx) => {
  ctx.body = {
    status: 'success',
    message: '系统运行正常',
    timestamp: new Date().toISOString()
  };
});

// 需要认证的API
router.use(auth());

// 获取用户信息
router.get('/user', (ctx) => {
  // 用户信息已通过JWT中间件注入到ctx.state.user
  ctx.body = {
    status: 'success',
    data: ctx.state.user
  };
});

// 任务相关API
router.post('/tasks/analyze', analyzeAndGenerateTasks);
router.get('/tasks', getAllTasks);
router.get('/tasks/next', getNextTasksToExecute);
router.put('/tasks/status', updateTaskStatus);

// 需要管理员权限的API
router.get('/admin', checkPermission('admin'), (ctx) => {
  ctx.body = {
    status: 'success',
    message: '管理员API访问成功'
  };
});

export default router;