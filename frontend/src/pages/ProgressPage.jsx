import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ResultCard from '../components/ResultCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import SecondaryButton from '../components/SecondaryButton';

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [pollingStartTime] = useState(Date.now());
  const [isTimeout, setIsTimeout] = useState(false);

  const POLLING_TIMEOUT = 10 * 60 * 1000; // 10 分钟

  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        // 检查是否超时
        if (Date.now() - pollingStartTime > POLLING_TIMEOUT) {
          setIsTimeout(true);
          setPolling(false);
          return;
        }

        const data = await api.getTask(id);
        setTaskData(data);
        setLoading(false);

        // 如果任务完成或失败，停止轮询
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'stopped') {
          setPolling(false);
          
          // 如果完成，自动跳转到结果页
          if (data.status === 'completed') {
            setTimeout(() => {
              navigate(`/result/${id}`);
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Failed to fetch task status:', err);
        setLoading(false);
        setPolling(false);
      }
    };

    fetchTaskStatus();

    let interval;
    if (polling) {
      interval = setInterval(fetchTaskStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, polling, pollingStartTime, navigate]);

  const getCurrentStep = () => {
    if (!taskData) return 0;
    
    const currentLayer = taskData.current_layer;
    
    if (currentLayer === 'compressing') return 1;
    if (currentLayer === 'layer1_running' || currentLayer === 'layer1_done') return 2;
    if (currentLayer === 'layer2_running' || currentLayer === 'layer2_done') return 2;
    if (currentLayer === 'layer3_running' || currentLayer === 'layer3_done') return 3;
    if (currentLayer === 'layer4_running' || currentLayer === 'layer4_done') return 3;
    if (currentLayer === 'generating_report' || taskData.status === 'completed') return 4;
    
    return 1;
  };

  const steps = [
    '上传完成',
    '分析中',
    '压缩中',
    '完成'
  ];

  const currentStep = getCurrentStep();

  if (loading) {
    return (
      <div className="min-h-screen bg-kenya-brown">
        <AppHeader />
        <PageContainer>
          <LoadingState message="加载任务信息..." />
        </PageContainer>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="min-h-screen bg-kenya-brown">
        <AppHeader />
        <PageContainer>
          <ErrorState
            title="任务不存在"
            message="未找到该任务，可能已被删除"
            actions={[
              <SecondaryButton key="home" onClick={() => navigate('/')}>
                返回首页
              </SecondaryButton>
            ]}
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kenya-brown">
      <AppHeader breadcrumb={taskData.name} />

      {/* Hero 区 */}
      <div className="bg-kenya-cream py-10">
        <PageContainer>
          <PageTitle
            title={taskData.name}
            subtitle="蒸馏进行中"
          />
        </PageContainer>
      </div>

      {/* 进度区 */}
      <PageContainer>
        <ResultCard>
          {/* 步骤进度条 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all border-2 ${
                        currentStep > idx
                          ? 'bg-kenya-dark text-kenya-cream border-kenya-dark'
                          : currentStep === idx
                          ? 'bg-kenya-dark text-kenya-cream border-kenya-dark animate-pulse'
                          : 'bg-kenya-line/20 text-kenya-dark/40 border-kenya-line/40'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        currentStep >= idx ? 'text-kenya-dark' : 'text-kenya-dark/40'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-4 -mt-8">
                      <div
                        className={`h-full transition-all ${
                          currentStep > idx ? 'bg-kenya-dark' : 'bg-kenya-line/20'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-base text-kenya-dark/60">
              {polling ? `第 ${currentStep} / ${steps.length} 步：${steps[currentStep - 1]}` : '处理完成'}
            </p>
          </div>

          {/* 超时提示 */}
          {isTimeout && (
            <ErrorState
              title="处理超时"
              message="任务处理时间超过 10 分钟，请刷新页面查看最新状态或返回首页"
              actions={[
                <SecondaryButton key="refresh" onClick={() => window.location.reload()}>
                  刷新页面
                </SecondaryButton>,
                <SecondaryButton key="home" onClick={() => navigate('/')}>
                  返回首页
                </SecondaryButton>
              ]}
            />
          )}

          {/* 失败提示 */}
          {taskData.status === 'failed' && (
            <ErrorState
              title="任务失败"
              message={taskData.error_message || '任务处理失败，请重试'}
              actions={[
                <SecondaryButton key="retry" onClick={() => navigate('/upload')}>
                  创建新任务
                </SecondaryButton>,
                <SecondaryButton key="home" onClick={() => navigate('/')}>
                  返回首页
                </SecondaryButton>
              ]}
            />
          )}

          {/* 停止提示 */}
          {taskData.status === 'stopped' && (
            <ErrorState
              title="任务已停止"
              message={taskData.error_message || '任务已被手动停止'}
              actions={[
                <SecondaryButton key="retry" onClick={() => navigate('/upload')}>
                  创建新任务
                </SecondaryButton>,
                <SecondaryButton key="home" onClick={() => navigate('/')}>
                  返回首页
                </SecondaryButton>
              ]}
            />
          )}

          {/* 完成提示 */}
          {taskData.status === 'completed' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-kenya-dark text-lg font-medium mb-2">蒸馏完成！</p>
              <p className="text-kenya-dark/60 text-sm mb-6">正在跳转到结果页...</p>
              <SecondaryButton onClick={() => navigate(`/result/${id}`)}>
                立即查看结果
              </SecondaryButton>
            </div>
          )}
        </ResultCard>
      </PageContainer>
    </div>
  );
}
