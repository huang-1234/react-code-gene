import { useState, useEffect } from 'react';
import { Layout, Menu, MenuProps, theme } from 'antd';
import { AppstoreOutlined, LineChartOutlined } from '@ant-design/icons';
import CanvasPage from './pages/canvas';
import GraphPage from './pages/graph';
import useCanvasStore from './stores/canvasStore';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [selectedKey, setSelectedKey] = useState('1');
  const { token } = theme.useToken();
  const { sessionId } = useCanvasStore();

  // 生成会话ID
  useEffect(() => {
    const { sessionId, setSessionId } = useCanvasStore.getState();
    if (!sessionId) {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
    }
  }, []);

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <CanvasPage />;
      case '2':
        return <GraphPage />;
      default:
        return <CanvasPage />;
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 移动端警告 */}
      <div className="mobile-warning">
        <h2>不支持移动设备</h2>
        <p>AI画布控制器需要在桌面环境下使用</p>
        <p>请使用电脑访问此应用</p>
      </div>

      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(0, 0, 0, 0.2)' }} />
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={[
            {
              key: '1',
              icon: <AppstoreOutlined />,
              label: 'AI画布',
            },
            {
              key: '2',
              icon: <LineChartOutlined />,
              label: '图表分析',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: token.colorBgContainer }}>
          <h1 style={{ margin: 0 }}>AI画布控制器</h1>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: token.colorBgContainer }}>
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <p>会话ID: {sessionId || '未生成'}</p>
          <p><small>注意: 当前版本不支持移动端显示</small></p>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
