import toast from 'react-hot-toast';

const API_BASE_URL = 'http://43.128.11.119:8000';

/**
 * 统一的 API 请求封装
 * 自动处理错误并显示 Toast 提示
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`[API] ${options.method || 'GET'} ${endpoint}`, options.body ? JSON.parse(options.body) : '');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // 尝试解析响应
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('[API] Non-JSON response:', text);
      throw new Error('服务器返回了非 JSON 格式的响应');
    }

    // 检查 HTTP 状态码
    if (!response.ok) {
      const errorMessage = data.detail || data.message || `请求失败 (${response.status})`;
      console.error('[API] Error response:', data);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log('[API] Success:', data);
    return data;

  } catch (error) {
    console.error('[API] Request failed:', error);
    
    // 网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('网络连接失败，请检查服务器是否运行');
    } 
    // 其他错误（如果还没显示过 toast）
    else if (!error.message.includes('服务器返回了非 JSON 格式的响应')) {
      toast.error(error.message);
    }
    
    throw error;
  }
}

// API 方法
export const api = {
  // 获取任务列表
  getTasks: (skip = 0, limit = 10) => 
    apiRequest(`/distillations/?skip=${skip}&limit=${limit}`),

  // 获取单个任务详情
  getTask: (id) => 
    apiRequest(`/distillations/${id}`),

  // 创建新任务
  createTask: (data) => 
    apiRequest('/distillations/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 删除任务
  deleteTask: (id) => 
    apiRequest(`/distillations/${id}`, {
      method: 'DELETE',
    }),
};

export default api;
