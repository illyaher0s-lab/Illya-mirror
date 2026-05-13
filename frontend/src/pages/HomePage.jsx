import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Header from '../components/Header';

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, processing, completed, failed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      // API 返回 { total, items, skip, limit }，我们需要 items
      setTasks(data.items || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      // 错误已经由 api.js 显示 toast，这里不需要重复
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status, currentLayer) => {
    // 压缩阶段
    if (currentLayer === 'compressing') return '文本压缩中';
    if (currentLayer === 'compression_failed') return '压缩失败';
    
    // 三层蒸馏阶段
    if (currentLayer === 'layer1_running') return '第一层处理中';
    if (currentLayer === 'layer1_done') return '第一层完成';
    if (currentLayer === 'layer1_failed') return '第一层失败';
    if (currentLayer === 'layer2_running') return '第二层处理中';
    if (currentLayer === 'layer2_done') return '第二层完成';
    if (currentLayer === 'layer2_failed') return '第二层失败';
    if (currentLayer === 'layer3_running') return '第三层处理中';
    if (currentLayer === 'layer3_done') return '第三层完成';
    if (currentLayer === 'layer3_failed') return '第三层失败';
    
    // 通用状态
    if (status === 'completed') return '已完成';
    if (status === 'failed') return '失败';
    if (status === 'stopped') return '已停止';
    if (status === 'pending') return '等待中';
    
    return status;
  };

  const getStatusColor = (status, currentLayer) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'failed' || currentLayer?.includes('failed')) return 'bg-red-100 text-red-800';
    if (status === 'stopped') return 'bg-gray-100 text-gray-800';
    if (currentLayer?.includes('running') || currentLayer === 'compressing') return 'bg-blue-100 text-blue-800';
    if (currentLayer?.includes('done')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = (status, currentLayer) => {
    if (status === 'completed') return 100;
    if (status === 'failed' || status === 'stopped') return 0;
    
    // 压缩阶段 10%
    if (currentLayer === 'compressing') return 10;
    if (currentLayer === 'compression_failed') return 0;
    
    // 三层蒸馏：每层 30%
    if (currentLayer === 'layer1_running') return 25;
    if (currentLayer === 'layer1_done') return 30;
    if (currentLayer === 'layer2_running') return 55;
    if (currentLayer === 'layer2_done') return 60;
    if (currentLayer === 'layer3_running') return 85;
    if (currentLayer === 'layer3_done') return 90;
    
    return 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    return `${days} 天前`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个任务吗？')) return;
    
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('任务已删除');
    } catch (err) {
      console.error('Failed to delete task:', err);
      // 错误已经由 api.js 显示 toast
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'processing') {
      return task.current_layer?.includes('running') || task.current_layer === 'compressing';
    }
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'failed') return task.status === 'failed' || task.status === 'stopped';
    return true;
  });

  return (
    <div className="min-h-screen bg-kenya-brown">
      <Header />
      
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-4">
            镜像
          </h1>
          <p className="text-xl text-kenya-dark/80 mb-2">
            让 AI 像你一样思考
          </p>
          <p className="text-lg text-kenya-dark/70 mb-6">
            上传你的笔记、对话记录或文章，生成可注入 AI 的认知规则集
          </p>
          <div className="flex gap-4">
            <Link to="/upload">
              <button className="kenya-button">
                开始使用
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 任务列表区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">任务列表</h2>
          <Link to="/upload">
            <button className="kenya-button">
              创建新任务
            </button>
          </Link>
        </div>

        {/* 筛选器 */}
        {tasks.length > 0 && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm transition-colors ${
                filter === 'all' 
                  ? 'bg-kenya-dark text-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            >
              全部 ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-4 py-2 text-sm transition-colors ${
                filter === 'processing' 
                  ? 'bg-kenya-dark text-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            >
              处理中 ({tasks.filter(t => t.current_layer?.includes('running') || t.current_layer === 'compressing').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 text-sm transition-colors ${
                filter === 'completed' 
                  ? 'bg-kenya-dark text-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            >
              已完成 ({tasks.filter(t => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 text-sm transition-colors ${
                filter === 'failed' 
                  ? 'bg-kenya-dark text-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            >
              失败 ({tasks.filter(t => t.status === 'failed' || t.status === 'stopped').length})
            </button>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="kenya-card text-center py-20">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-kenya-dark/60">加载中...</p>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && tasks.length === 0 && (
          <div className="kenya-card text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📝</div>
            <p className="text-kenya-dark/60 mb-6">
              还没有任务，开始创建第一个蒸馏任务吧
            </p>
            <Link to="/upload">
              <button className="kenya-button">
                创建任务
              </button>
            </Link>
          </div>
        )}

        {/* 任务列表 */}
        {!loading && filteredTasks.length > 0 && (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task.id} className="kenya-card hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium">{task.name}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(task.status, task.current_layer)}`}>
                        {getStatusText(task.status, task.current_layer)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-kenya-dark/60 mb-4">
                      <span>任务 ID: {task.id}</span>
                      <span>创建于 {formatDate(task.created_at)}</span>
                      <span>更新于 {formatDate(task.updated_at)}</span>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-kenya-dark/60 mb-1">
                        <span>进度</span>
                        <span>{getProgressPercentage(task.status, task.current_layer)}%</span>
                      </div>
                      <div className="h-2 bg-kenya-line/20 overflow-hidden">
                        <div 
                          className="h-full bg-kenya-dark transition-all duration-500"
                          style={{ width: `${getProgressPercentage(task.status, task.current_layer)}%` }}
                        />
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      {/* 根据任务状态显示主操作按钮 */}
                      {(task.status === 'pending' || task.current_layer?.includes('running') || task.current_layer === 'compressing') && (
                        <Link to={`/progress/${task.id}`}>
                          <button className="kenya-button text-sm">
                            查看进度
                          </button>
                        </Link>
                      )}
                      
                      {task.status === 'completed' && (
                        <Link to={`/result/${task.id}`}>
                          <button className="kenya-button text-sm">
                            查看结果
                          </button>
                        </Link>
                      )}

                      {(task.status === 'failed' || task.status === 'stopped') && (
                        <Link to={`/progress/${task.id}`}>
                          <button className="kenya-button text-sm">
                            查看错误
                          </button>
                        </Link>
                      )}

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="kenya-button-danger text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 筛选后的空状态 */}
        {!loading && tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="kenya-card text-center py-20">
            <div className="text-4xl mb-4 opacity-20">🔍</div>
            <p className="text-kenya-dark/60">
              没有符合条件的任务
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
