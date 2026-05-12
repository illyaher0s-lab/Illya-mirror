import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { distillationAPI } from '../api/distillation';

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);

  // 实时轮询
  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        const data = await distillationAPI.get(id);
        setTaskData(data);
        setLoading(false);
        
        // 如果任务完成或失败，停止轮询
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'stopped') {
          setPolling(false);
        }
      } catch (err) {
        setError('获取任务状态失败');
        setLoading(false);
      }
    };

    fetchTaskStatus();

    // 每 3 秒轮询一次
    let interval;
    if (polling) {
      interval = setInterval(fetchTaskStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, polling]);

  const getLayerStatus = (layer) => {
    if (!taskData) return 'pending';
    if (taskData.current_layer > layer) return 'completed';
    if (taskData.current_layer === layer) {
      if (taskData.status.includes('processing')) return 'processing';
      if (taskData.status.includes('completed')) return 'completed';
    }
    return 'pending';
  };

  const handleContinue = async () => {
    try {
      await distillationAPI.continue(id);
      // 重新开始轮询
      setPolling(true);
    } catch (err) {
      setError('继续任务失败');
    }
  };

  const handleStop = async () => {
    if (!confirm('确定要停止这个任务吗？停止后可以稍后继续。')) {
      return;
    }

    try {
      await distillationAPI.stop(id);
      setPolling(false);
      // 刷新任务状态
      const data = await distillationAPI.get(id);
      setTaskData(data);
    } catch (err) {
      setError('停止任务失败');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kenya-brown flex items-center justify-center">
        <div className="kenya-card text-center py-20">
          <div className="animate-pulse">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-kenya-dark/60">加载任务信息...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !taskData) {
    return (
      <div className="min-h-screen bg-kenya-brown flex items-center justify-center">
        <div className="kenya-card text-center py-20">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-kenya-dark/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="kenya-button"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kenya-brown">
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-5xl mb-2">{taskData.title}</h1>
          <div className="flex items-center gap-4 text-kenya-dark/70">
            <span>任务 ID: {id}</span>
            <span>•</span>
            <span>创建于 {formatDate(taskData.created_at)}</span>
            {polling && (
              <>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  实时更新中
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="kenya-card bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 进度区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* 整体进度条 */}
          <div className="kenya-card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">整体进度</h3>
              <span className="text-sm text-kenya-dark/60">
                {taskData.progress_detail?.percentage || 0}%
              </span>
            </div>
            <div className="h-3 bg-kenya-line/20 overflow-hidden mb-2">
              <div 
                className="h-full bg-kenya-dark transition-all duration-500"
                style={{ width: `${taskData.progress_detail?.percentage || 0}%` }}
              />
            </div>
            {taskData.progress_detail?.current_step && (
              <p className="text-sm text-kenya-dark/60">
                {taskData.progress_detail.current_step}
              </p>
            )}
          </div>

          {/* Layer 1 */}
          <div className="kenya-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl
                  ${getLayerStatus(1) === 'completed' ? 'bg-kenya-dark text-white' : 
                    getLayerStatus(1) === 'processing' ? 'bg-kenya-line text-white animate-pulse' : 
                    'bg-kenya-line/30 text-kenya-dark/50'}`}>
                  1
                </div>
                <div>
                  <h3 className="font-medium text-lg">第一层：段落索引</h3>
                  <p className="text-sm text-kenya-dark/60">识别段落类型，构建内容索引</p>
                </div>
              </div>
              <div className="text-sm text-kenya-dark/60">
                {getLayerStatus(1) === 'completed' && '✓ 已完成'}
                {getLayerStatus(1) === 'processing' && '处理中...'}
                {getLayerStatus(1) === 'pending' && '等待中'}
              </div>
            </div>
            
            {taskData.layer1_result && (
              <div className="mt-4 pt-4 border-t border-kenya-line/30">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-kenya-dark/60">
                    识别段落数：{taskData.layer1_result.paragraph_count}
                    <span className="ml-4">完成时间：{formatDate(taskData.layer1_result.completed_at)}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/result/${id}?layer=1`)}
                    className="text-sm text-kenya-dark hover:underline"
                  >
                    查看结果 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Layer 2 */}
          <div className="kenya-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl
                  ${getLayerStatus(2) === 'completed' ? 'bg-kenya-dark text-white' : 
                    getLayerStatus(2) === 'processing' ? 'bg-kenya-line text-white animate-pulse' : 
                    'bg-kenya-line/30 text-kenya-dark/50'}`}>
                  2
                </div>
                <div>
                  <h3 className="font-medium text-lg">第二层：深度蒸馏</h3>
                  <p className="text-sm text-kenya-dark/60">提取核心概念，构建知识结构</p>
                </div>
              </div>
              <div className="text-sm text-kenya-dark/60">
                {getLayerStatus(2) === 'completed' && '✓ 已完成'}
                {getLayerStatus(2) === 'processing' && '处理中...'}
                {getLayerStatus(2) === 'pending' && '等待中'}
              </div>
            </div>
            
            {taskData.layer2_result && (
              <div className="mt-4 pt-4 border-t border-kenya-line/30">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-kenya-dark/60">
                    完成时间：{formatDate(taskData.layer2_result.completed_at)}
                  </div>
                  <button 
                    onClick={() => navigate(`/result/${id}?layer=2`)}
                    className="text-sm text-kenya-dark hover:underline"
                  >
                    查看结果 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Layer 3 */}
          <div className="kenya-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl
                  ${getLayerStatus(3) === 'completed' ? 'bg-kenya-dark text-white' : 
                    getLayerStatus(3) === 'processing' ? 'bg-kenya-line text-white animate-pulse' : 
                    'bg-kenya-line/30 text-kenya-dark/50'}`}>
                  3
                </div>
                <div>
                  <h3 className="font-medium text-lg">第三层：最终蒸馏</h3>
                  <p className="text-sm text-kenya-dark/60">生成认知友好的最终输出</p>
                </div>
              </div>
              <div className="text-sm text-kenya-dark/60">
                {getLayerStatus(3) === 'completed' && '✓ 已完成'}
                {getLayerStatus(3) === 'processing' && '处理中...'}
                {getLayerStatus(3) === 'pending' && '等待中'}
              </div>
            </div>
            
            {taskData.layer3_result && (
              <div className="mt-4 pt-4 border-t border-kenya-line/30">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-kenya-dark/60">
                    完成时间：{formatDate(taskData.layer3_result.completed_at)}
                  </div>
                  <button 
                    onClick={() => navigate(`/result/${id}?layer=3`)}
                    className="text-sm text-kenya-dark hover:underline"
                  >
                    查看结果 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors"
            >
              返回首页
            </button>
            
            {taskData.current_layer < 3 && taskData[`layer${taskData.current_layer}_result`] && (
              <button
                onClick={handleContinue}
                className="kenya-button flex-1"
              >
                继续下一层
              </button>
            )}
            
            {taskData.status === 'completed' && (
              <button
                onClick={() => navigate(`/result/${id}`)}
                className="kenya-button flex-1"
              >
                查看完整结果
              </button>
            )}
            
            {taskData.status.includes('processing') && (
              <button
                onClick={handleStop}
                className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                停止任务
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
