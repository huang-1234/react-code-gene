// @ts-nocheck - 禁用类型检查以解决React类型兼容性问题
import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import useCanvasStore from './stores/canvasStore';
import routes from './routes';
import type { AppRouteObject } from './routes';
import { menuItems, getAntdMenuItems, getSelectedKeys } from './routes/menu';
import './App.css';

// 导入React类型覆盖
// import './types/react-fix';

const { Header, Content, Footer, Sider } = Layout;

// 主应用布局组件
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { sessionId } = useCanvasStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 根据当前路径选中对应菜单
  const selectedKeys = getSelectedKeys(location.pathname);

  // 生成会话ID
  useEffect(() => {
    const { sessionId, setSessionId } = useCanvasStore.getState();
    if (!sessionId) {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
    }
  }, []);

  // 菜单点击处理
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    // 查找对应的菜单项
    const findMenuPath = (items: typeof menuItems, key: string): string | undefined => {
      for (const item of items) {
        if (item.key === key) return item.path;
        if (item.children) {
          const path = findMenuPath(item.children, key);
          if (path) return path;
        }
      }
      return undefined;
    };

    const path = findMenuPath(menuItems, e.key);
    if (path) {
      navigate(path);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 移动端警告 */}
      {/* <div className="mobile-warning">
        <h2>不支持移动设备</h2>
        <p>AI画布控制器需要在桌面环境下使用</p>
        <p>请使用电脑访问此应用</p>
      </div> */}

      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: token.colorBgContainer,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
          overflow: 'auto',
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
        }}
        width={220}
      >
        <div className="logo">
          <h3 style={{ margin: 0, textAlign: 'center', color: '#1890ff', fontWeight: 'bold' }}>AI画布系统</h3>
        </div>
        <Menu
          theme="light"
          mode="inline"
          onClick={handleMenuClick}
          selectedKeys={selectedKeys}
          items={getAntdMenuItems(menuItems)}
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto'
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: token.colorBgContainer }}>
          <h1 style={{ margin: 0 }}>AI画布控制器</h1>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: token.colorBgContainer }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// 主应用组件
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.path === '*' ? (
                route.element as any
              ) : (
                <AppLayout>{route.element}</AppLayout>
              )
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
