import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Header from '../components/Header';

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [pollingStartTime] = useState(Date.now());
  const [isTimeout, setIsTimeout] = useState(false);

  const POLLING_TIMEOUT = 10 * 60 * 1000; // 10 分钟

  // 实时轮询
  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        // 检查是否超时
        if (Date.now() - pollingStartTime > POLLING_TIMEOUT) {
          setIsTimeout(true);
          setPolling(false);
          toast.error('任务处理超时，请刷新页面或联系管理员');
          return;
        }

        const data = await api.getTask(id);
        setTaskData(data);
        setLoading(false);
        
        // 如果任务完成或失败，停止轮询
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'stopped') {
          setPolling(false);
        }
      } catch (err) {
        console.error('Failed to fetch task status:', err);
        setLoading(false);
        setPolling(false);
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
  }, [id, polling, pollingStartTime, POLLING_TIMEOUT]);

  const getLayerStatus = (layer) => {
    if (!taskData) return 'pending';
    
    const currentLayer = taskData.current_layer;
    
    // 映射 current_layer 字符串到层级数字
    const layerMap = {
      'compressing': 0,
      'layer1_running': 1,
      'layer1_done': 1,
      'layer2_running': 2,
      'layer2_done': 2,
      'layer3_running': 3,
      'layer3_done': 3,
      'layer4_running': 4,
      'layer4_done': 4,
      'generating_report': 5,
      'completed': 5
    };
    
    const currentLayerNum = layerMap[currentLayer] || 0;
    
    // 判断状态
    if (currentLayerNum > layer) return 'completed';
    if (currentLayerNum === layer) {
      if (currentLayer.includes('running')) return 'processing';
      if (currentLayer.includes('done') || taskData.status === 'completed') return 'completed';
    }
    return 'pending';
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

  if (!taskData) {
    return (
      <div className="min-h-screen bg-kenya-brown flex items-center justify-center">
        <div className="kenya-card text-center py-20">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-kenya-dark/60 mb-6">任务不存在</p>
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
      <Header />
      
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kenya-dark/60 hover:text-kenya-dark transition-colors mb-4"
          >
            <span>←</span>
            <span className="text-sm">返回首页</span>
          </button>
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

      {/* 进度区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* 整体进度条 */}
          <div className="kenya-card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">整体进度</h3>
              <span className="text-sm text-kenya-dark/60">
                {(() => {
                  const layer = taskData.current_layer;
                  if (taskData.status === 'completed') return '第 4/4 步';
                  if (layer === 'compressing') return '第 1/4 步';
                  if (layer?.includes('layer1')) return '第 2/4 步';
                  if (layer?.includes('layer2')) return '第 3/4 步';
                  if (layer?.includes('layer3')) return '第 4/4 步';
                  return '第 0/4 步';
                })()}
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

          {/* 错误提示 */}
          {(taskData.status === 'failed' || taskData.status === 'stopped') && taskData.error_message && (
            <div className="kenya-card bg-red-50 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <div className="text-2xl">❌</div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-800 mb-2">任务失败</h3>
                  <p className="text-sm text-red-700 mb-4">{taskData.error_message}</p>
                  <button
                    onClick={() => navigate('/')}
                    className="kenya-button text-sm"
                    style={{ background: '#DC2626' }}
                  >
                    返回首页重试
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 超时提示 */}
          {isTimeout && taskData.status !== 'completed' && taskData.status !== 'failed' && (
            <div className="kenya-card bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⏰</div>
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 mb-2">任务处理超时</h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    任务已运行超过 10 分钟，可能遇到问题。建议刷新页面查看最新状态，或联系管理员。
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="kenya-button text-sm"
                    >
                      刷新页面
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="kenya-button-secondary text-sm"
                    >
                      返回首页
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 压缩阶段 */}
          <div className="kenya-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl
                  ${taskData.current_layer === 'compressing' ? 'bg-kenya-line text-white animate-pulse' : 
                    taskData.current_layer && taskData.current_layer !== 'pending' && taskData.current_layer !== 'compressing' ? 'bg-kenya-dark text-white' : 
                    'bg-kenya-line/30 text-kenya-dark/50'}`}>
                  📝
                </div>
                <div>
                  <h3 className="font-medium text-lg">文本压缩</h3>
                  <p className="text-sm text-kenya-dark/60">使用 Gemini 压缩原始文本，保留关键信息</p>
                </div>
              </div>
              <div className="text-sm text-kenya-dark/60">
                {taskData.current_layer === 'compressing' && '处理中...'}
                {taskData.current_layer === 'compression_failed' && '❌ 失败'}
                {taskData.current_layer && taskData.current_layer !== 'pending' && taskData.current_layer !== 'compressing' && taskData.current_layer !== 'compression_failed' && '✓ 已完成'}
                {(taskData.current_layer === 'pending' || !taskData.current_layer) && '等待中'}
              </div>
            </div>
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
                  <h3 className="font-medium text-lg">第三层：表达策略分析</h3>
                  <p className="text-sm text-kenya-dark/60">提取表达模式和标志性短语</p>
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

          {/* Layer 4 */}
          <div className="kenya-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl
                  ${getLayerStatus(4) === 'completed' ? 'bg-kenya-dark text-white' : 
                    getLayerStatus(4) === 'processing' ? 'bg-kenya-line text-white animate-pulse' : 
                    'bg-kenya-line/30 text-kenya-dark/50'}`}>
                  4
                </div>
                <div>
                  <h3 className="font-medium text-lg">第四层：认知操作系统</h3>
                  <p className="text-sm text-kenya-dark/60">整合为可执行的认知规则集</p>
                </div>
              </div>
              <div className="text-sm text-kenya-dark/60">
                {getLayerStatus(4) === 'completed' && '✓ 已完成'}
                {getLayerStatus(4) === 'processing' && '处理中...'}
                {getLayerStatus(4) === 'pending' && '等待中'}
              </div>
            </div>
            
            {taskData.cognitive_profile && (
              <div className="mt-4 pt-4 border-t border-kenya-line/30">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-kenya-dark/60">
                    认知系统已生成
                  </div>
                  <button 
                    onClick={() => navigate(`/result/${id}?layer=4`)}
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
              className="kenya-button-secondary"
            >
              返回首页
            </button>
            
            {taskData.status === 'completed' && (
              <button
                onClick={() => navigate(`/result/${id}`)}
                className="kenya-button flex-1"
              >
                查看完整结果
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
