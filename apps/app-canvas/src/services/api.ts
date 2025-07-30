import axios from 'axios';

// API客户端实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应类型
export interface ApiResponse<T> {
  taskId?: string;
  previewUrl?: string;
  assets?: any[];
  error?: string;
  data?: T;
}

/**
 * 发送AI指令
 * @param task 任务类型
 * @param params 任务参数
 * @param sessionId 会话ID
 * @returns API响应
 */
export const sendInstruction = async (
  task: string,
  params: Record<string, any>,
  sessionId?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>('/instructions', {
      task,
      params,
      sessionId,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<any>;
    }

    return {
      error: '网络错误',
    };
  }
};

/**
 * 健康检查
 * @returns API响应
 */
export const checkHealth = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>('/health');
    return response.data;
  } catch (error) {
    return {
      error: '服务器连接失败',
    };
  }
};

/**
 * 获取预览内容
 * @param taskId 任务ID
 * @returns 预览HTML内容
 */
export const getPreview = async (taskId: string): Promise<string> => {
  try {
    const response = await apiClient.get<string>(`/preview/${taskId}.html`, {
      responseType: 'text',
    });

    return response.data;
  } catch (error) {
    return '<div>预览加载失败</div>';
  }
};
