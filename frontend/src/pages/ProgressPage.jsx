import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [pollingStartTime] = useState(Date.now());
  const [isTimeout, setIsTimeout] = useState(false);
  const [stopping, setStopping] = useState(false);

  const POLLING_TIMEOUT = 10 * 60 * 1000; // 10 分钟

  const handleStop = async () => {
    if (!window.confirm('确定要停止这个任务吗？')) return;

    setStopping(true);
    try {
      await api.stopTask(id);
      toast.success('任务已停止');
      setPolling(false);
      // 刷新任务状态
      const data = await api.getTask(id);
      setTaskData(data);
    } catch (err) {
      console.error('Failed to stop task:', err);
      toast.error('停止失败');
    } finally {
      setStopping(false);
    }
  };

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

  const getProgress = () => {
    if (!taskData) return 0;
    
    if (taskData.status === 'completed') return 100;
    if (taskData.status === 'failed' || taskData.status === 'stopped') return 0;
    
    const currentLayer = taskData.current_layer || 0;
    return (currentLayer / 4) * 100;
  };

  const getStatusText = () => {
    if (!taskData) return 'LOADING...';
    
    if (taskData.status === 'completed') return 'COMPLETE';
    if (taskData.status === 'failed') return 'FAILED';
    if (taskData.status === 'stopped') return 'STOPPED';
    
    const layer = taskData.current_layer || 0;
    return `PROCESSING LAYER ${layer}/4`;
  };

  if (loading) {
    return (
      <div className="page-frame paper">
        <nav className="nav">
          <div className="nav-breadcrumb">
            <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>
              ← MIRROR
            </span>
          </div>
        </nav>
        <div className="loading-state">
          <div className="loading-state-icon">∞</div>
          <div className="loading-state-text">LOADING TASK...</div>
        </div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="page-frame paper">
        <nav className="nav">
          <div className="nav-breadcrumb">
            <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>
              ← MIRROR
            </span>
          </div>
        </nav>
        <div className="error-state">
          <div className="error-state-icon">✕</div>
          <div className="error-state-text">TASK NOT FOUND</div>
          <button 
            className="btn-outline" 
            onClick={() => navigate('/')}
            style={{ marginTop: '20px' }}
          >
            ← BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-frame paper">
      {/* Nav with Breadcrumb */}
      <nav className="nav">
        <div className="nav-breadcrumb">
          <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>
            ← MIRROR
          </span>
          <span className="nav-breadcrumb-sep">/</span>
          <span className="nav-breadcrumb-cur">{taskData.name}</span>
        </div>
        <div className="nav-version">SYS_v2.4</div>
      </nav>

      {/* 内容区 */}
      <div className="content-area" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        {/* 状态显示 */}
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: '16px' }}>
            DISTILLATION IN PROGRESS
          </span>
          
          <h1 style={{ 
            fontFamily: 'var(--font-sans)',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '24px',
            color: 'var(--text-primary)'
          }}>
            {taskData.name}
          </h1>

          {/* 进度条 */}
          <div style={{ 
            width: '100%',
            height: '4px',
            background: 'var(--border-light)',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'var(--accent-blue)',
              width: `${getProgress()}%`,
              transition: 'width 300ms ease'
            }} />
          </div>

          {/* 状态文字 */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            {getStatusText()}
          </div>

          {/* 超时提示 */}
          {isTimeout && (
            <div style={{ 
              padding: '20px',
              background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.4)',
              marginBottom: '20px'
            }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#7a1a1a',
                marginBottom: '12px'
              }}>
                ⚠ TIMEOUT: 处理时间超过 10 分钟
              </div>
              <button 
                className="btn-outline" 
                onClick={() => window.location.reload()}
              >
                ⟳ REFRESH
              </button>
            </div>
          )}

          {/* 失败提示 */}
          {taskData.status === 'failed' && (
            <div style={{ 
              padding: '20px',
              background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.4)',
              marginBottom: '20px'
            }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#7a1a1a',
                marginBottom: '8px'
              }}>
                ✕ FAILED
              </div>
              <div style={{ 
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '12px'
              }}>
                {taskData.error_message || '任务处理失败'}
              </div>
              <button 
                className="btn-outline" 
                onClick={() => navigate('/')}
              >
                ← BACK TO HOME
              </button>
            </div>
          )}

          {/* 完成提示 */}
          {taskData.status === 'completed' && (
            <div style={{ 
              padding: '20px',
              background: 'rgba(224,122,48,0.1)',
              border: '1px solid rgba(224,122,48,0.4)'
            }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#7a4a10',
                marginBottom: '8px'
              }}>
                ✓ COMPLETE
              </div>
              <div style={{ 
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '12px'
              }}>
                正在跳转到结果页...
              </div>
              <button 
                className="btn-primary" 
                onClick={() => navigate(`/result/${id}`)}
              >
                ▶ 查看结果
              </button>
            </div>
          )}

          {/* 处理中动画 */}
          {polling && taskData.status !== 'completed' && taskData.status !== 'failed' && (
            <>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                color: 'var(--accent-blue)',
                animation: 'pulse 2s ease-in-out infinite',
                marginBottom: '20px'
              }}>
                ∞
              </div>
              <button 
                className="btn-outline" 
                onClick={handleStop}
                disabled={stopping}
                style={{ color: '#c0392b', borderColor: '#c0392b' }}
              >
                {stopping ? '⟳ STOPPING...' : '✕ STOP TASK'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
