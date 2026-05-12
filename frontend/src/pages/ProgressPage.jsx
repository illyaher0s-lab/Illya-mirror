import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // TODO: 实际数据会在 Task 16 从 API 获取
  const [taskData, setTaskData] = useState({
    title: '示例任务',
    status: 'layer1_processing',
    current_layer: 1,
    layer1_result: null,
    layer2_result: null,
    layer3_result: null,
  });

  const getLayerStatus = (layer) => {
    if (taskData.current_layer > layer) return 'completed';
    if (taskData.current_layer === layer) return 'processing';
    return 'pending';
  };

  const handleContinue = () => {
    // TODO: 调用 API 继续下一层
    console.log('继续下一层');
  };

  const handleStop = () => {
    // TODO: 调用 API 停止任务
    console.log('停止任务');
  };

  return (
    <div className="min-h-screen bg-kenya-brown">
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-5xl mb-2">{taskData.title}</h1>
          <p className="text-kenya-dark/70">任务 ID: {id}</p>
        </div>
      </div>

      {/* 进度区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
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
                <button 
                  onClick={() => navigate(`/result/${id}?layer=1`)}
                  className="text-sm text-kenya-dark hover:underline"
                >
                  查看结果 →
                </button>
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
                <button 
                  onClick={() => navigate(`/result/${id}?layer=2`)}
                  className="text-sm text-kenya-dark hover:underline"
                >
                  查看结果 →
                </button>
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
                <button 
                  onClick={() => navigate(`/result/${id}?layer=3`)}
                  className="text-sm text-kenya-dark hover:underline"
                >
                  查看结果 →
                </button>
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
            
            {taskData.current_layer === 3 && taskData.layer3_result && (
              <button
                onClick={() => navigate(`/result/${id}`)}
                className="kenya-button flex-1"
              >
                查看完整结果
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              停止任务
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
