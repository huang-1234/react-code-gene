import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// 懒加载页面组件
const CanvasPage = lazy(() => import('../pages/canvas'));
const GraphPage = lazy(() => import('../pages/graph'));

// 加载中组件
const Loading = () => (
  <div className="loading-container">
    <Spin size="large" tip="页面加载中..." />
  </div>
);

// 路由配置类型
export interface AppRouteObject {
  path: string;
  element: React.ReactNode;
}

// 路由配置
const routes: AppRouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <CanvasPage />
      </Suspense>
    ),
  },
  {
    path: '/canvas',
    element: (
      <Suspense fallback={<Loading />}>
        <CanvasPage />
      </Suspense>
    ),
  },
  {
    path: '/graph',
    element: (
      <Suspense fallback={<Loading />}>
        <GraphPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <div className="not-found-page">
        <h2>404 - 页面未找到</h2>
        <p>您访问的页面不存在</p>
      </div>
    ),
  },
];

export default routes;
