// 用户相关类型
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

// 任务相关类型
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dependencies?: string[];
}

// Figma设计规范类型
export interface FigmaSpec {
  id: string;
  name: string;
  components: FigmaComponent[];
}

export interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  style: Record<string, any>;
  children?: FigmaComponent[];
}

// API响应类型
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}