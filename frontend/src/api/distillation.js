// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 通用请求函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // 处理空响应（204 No Content）
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 蒸馏任务 API
export const distillationAPI = {
  // 创建任务
  create: async (data) => {
    return request('/distillations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 获取任务列表
  list: async () => {
    return request('/distillations');
  },

  // 获取任务详情
  get: async (id) => {
    return request(`/distillations/${id}`);
  },

  // 删除任务
  delete: async (id) => {
    return request(`/distillations/${id}`, {
      method: 'DELETE',
    });
  },

  // 继续下一层
  continue: async (id) => {
    return request(`/distillations/${id}/continue`, {
      method: 'POST',
    });
  },

  // 停止任务
  stop: async (id) => {
    return request(`/distillations/${id}/stop`, {
      method: 'POST',
    });
  },

  // 获取任务状态
  getStatus: async (id) => {
    return request(`/distillations/${id}/status`);
  },

  // 获取第一层结果
  getLayer1: async (id) => {
    return request(`/distillations/${id}/layer1`);
  },

  // 获取第二层结果
  getLayer2: async (id) => {
    return request(`/distillations/${id}/layer2`);
  },

  // 获取第三层结果
  getLayer3: async (id) => {
    return request(`/distillations/${id}/layer3`);
  },

  // 获取质量报告
  getQuality: async (id) => {
    return request(`/distillations/${id}/quality`);
  },

  // 导出结果
  export: async (id, format = 'json') => {
    const url = `${API_BASE_URL}/distillations/${id}/export?format=${format}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  },
};

export default distillationAPI;
