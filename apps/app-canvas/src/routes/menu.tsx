import { AppstoreOutlined, LineChartOutlined, CodeOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';

// 菜单项类型定义
export interface MenuItem {
  key: string;
  icon?: ReactNode;
  label: string;
  path: string;
  children?: MenuItem[];
  permission?: string; // 权限控制
  divider?: boolean;   // 是否在此项后添加分隔线
}

// 菜单配置
export const menuItems: MenuItem[] = [
  {
    key: 'canvas',
    icon: <AppstoreOutlined />,
    label: 'AI画布',
    path: '/canvas',
  },
  {
    key: 'graph',
    icon: <LineChartOutlined />,
    label: '图表分析',
    path: '/graph',
  },
  {
    key: 'dev',
    icon: <CodeOutlined />,
    label: '开发工具',
    path: '/dev',
    children: [
      {
        key: 'api-test',
        label: 'API测试',
        path: '/dev/api-test',
      },
      {
        key: 'code-gen',
        label: '代码生成',
        path: '/dev/code-gen',
      }
    ]
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
    path: '/settings',
  }
];

// 将菜单项转换为Ant Design菜单格式
export const getAntdMenuItems = (items: MenuItem[]): MenuProps['items'] => {
  return items.map(item => {
    const menuItem: any = {
      key: item.key,
      icon: item.icon,
      label: item.label,
    };

    if (item.children && item.children.length > 0) {
      menuItem.children = getAntdMenuItems(item.children);
    }

    return menuItem;
  });
};

// 根据路径获取当前选中的菜单项
export const getSelectedKeys = (pathname: string): string[] => {
  // 移除开头的斜杠并分割路径
  const paths = pathname.replace(/^\//, '').split('/');

  // 如果路径为空（即首页），默认选中canvas
  if (paths[0] === '') {
    return ['canvas'];
  }

  // 查找匹配的菜单项
  const findMenuItem = (items: MenuItem[], path: string): MenuItem | undefined => {
    for (const item of items) {
      if (item.path === path || item.path === `/${path}`) {
        return item;
      }
      if (item.children) {
        const found = findMenuItem(item.children, path);
        if (found) return found;
      }
    }
    return undefined;
  };

  // 尝试匹配完整路径
  const fullPath = `/${paths.join('/')}`;
  const menuItem = findMenuItem(menuItems, fullPath);

  // 如果找到匹配项，返回其key
  if (menuItem) {
    return [menuItem.key];
  }

  // 如果没有找到匹配项，尝试匹配第一级路径
  if (paths.length > 0) {
    const firstLevelPath = `/${paths[0]}`;
    const firstLevelMenuItem = findMenuItem(menuItems, firstLevelPath);
    if (firstLevelMenuItem) {
      return [firstLevelMenuItem.key];
    }
  }

  // 默认返回空数组
  return [];
};

export default menuItems;
