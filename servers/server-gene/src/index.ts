import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { config } from 'dotenv';
import { auth } from './middlewares/auth.js';
import apiRouter from './routes/api.js';

// 加载环境变量
config();

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(bodyParser());

// 路由
router.get('/', (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'React代码自动生成API服务已启动'
  };
});

// API路由
app.use(router.routes());
app.use(apiRouter.routes());
app.use(router.allowedMethods());

// 错误处理
app.on('error', (err, ctx) => {
  console.error('服务器错误', err, ctx);
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});