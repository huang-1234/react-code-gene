import React, { Suspense } from 'react';
import { Spin } from 'antd';
import loadable from '@loadable/component';
// 懒加载页面组件
const ApiTestPage = loadable(/** webpackChunkName: "ApiTestPage" */ () => import('@/pages/ApiTestPage'));
const CodeGenPage = loadable(/** webpackChunkName: "CodeGenPage" */ () => import('@/pages/CodeGenPage'));
const SettingPage = loadable(/** webpackChunkName: "SettingPage" */ () => import('@/pages/Setting'));
const CanvasPage = loadable(/** webpackChunkName: "CanvasPage" */ () => import('../pages/Canvas'))
const GraphPage = loadable(/** webpackChunkName: "GraphPage" */ () => import('../pages/Graph'))

// 加载中组件
const Loading = () => (
  <div className="loading-container">
    <Spin size="large" tip="页面加载中..." />
  </div>
);

// 路由配置类型
export interface AppRouteObject {
  path: string;
  element?: React.ReactNode;
  children?: AppRouteObject[];
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
    path: '/dev',
    children: [
      {
        path: '/dev/api-test',
        element: (
          <Suspense fallback={<Loading />}>
            <ApiTestPage />
          </Suspense>
        ),
      },
      {
        path: '/dev/code-gen',
        element: (
          <Suspense fallback={<Loading />}>
            <CodeGenPage />
          </Suspense>
        ),
      }
    ],
  },
  {
    path: '/setting',
    element: (
      <Suspense fallback={<Loading />}>
        <SettingPage />
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
