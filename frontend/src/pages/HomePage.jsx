import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data.items || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个任务吗？')) return;

    try {
      await api.deleteTask(id);
      toast.success('任务已删除');
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('删除失败');
    }
  };

  const filterTabs = [
    { value: 'all', label: 'ALL' },
    { value: 'processing', label: 'PROCESSING' },
    { value: 'completed', label: 'DONE' },
    { value: 'failed', label: 'FAILED' }
  ];

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'processing') return task.status === 'processing' || task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'failed') return task.status === 'failed' || task.status === 'stopped';
    return true;
  });

  // Ticker 内容（需要复制两份实现无缝循环）
  const tickerItems = [
    'COGNITIVE DISTILLATION',
    'LAYER-BY-LAYER EXTRACTION',
    'REASONING PATTERN CAPTURE',
    'EXPRESSION STRATEGY MAPPING'
  ];

  const tickerContent = [...tickerItems, ...tickerItems];

  return (
    <div className="page-frame paper">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">MIRROR</div>
        <div className="nav-version">SYS_v2.4</div>
      </nav>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-inner">
          {tickerContent.map((item, i) => (
            <span key={i}>
              {item}
              {i < tickerContent.length - 1 && <span className="ticker-sep"> ★ </span>}
            </span>
          ))}
        </div>
      </div>

      {/* Hero 区 */}
      <div className="content-area" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
        <span className="eyebrow">COGNITIVE OS</span>
        <h1 className="page-title">
          镜像
          <br />
          <span className="hollow-title">MIRROR</span>
        </h1>
        <p className="page-desc" style={{ marginBottom: '32px' }}>
          将你的思考方式蒸馏成可复用的认知操作系统。
          <br />
          四层渐进式提取：段落索引 → 推理模式 → 表达策略 → 认知画像。
        </p>
        <button className="btn-primary" onClick={() => navigate('/upload')}>
          ▶ 开始使用
        </button>
      </div>

      {/* 任务列表区 */}
      <div style={{ 
        borderTop: `2px solid var(--border)`, 
        padding: '28px',
        flex: 1 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '24px', 
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            任务列表
          </h2>
          <button className="btn-outline" onClick={() => navigate('/upload')}>
            ＋ NEW_TASK
          </button>
        </div>

        {/* Tab 筛选 */}
        <div className="task-tabs">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              className={`task-tab ${filter === tab.value ? 'active' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        <div className="task-list" style={{ marginTop: '20px' }}>
          {loading ? (
            <div className="loading-state">
              <div className="loading-state-icon">∞</div>
              <div className="loading-state-text">LOADING TASKS...</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">□</div>
              <div className="empty-state-text">
                {filter === 'all' ? 'NO TASKS YET' : `NO ${filterTabs.find(t => t.value === filter)?.label} TASKS`}
              </div>
              <button 
                className="btn-outline" 
                onClick={() => navigate('/upload')}
                style={{ marginTop: '20px' }}
              >
                ＋ CREATE FIRST TASK
              </button>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div key={task.id} className="task-card" onClick={() => {
                if (task.status === 'completed') {
                  navigate(`/result/${task.id}`);
                } else if (task.status === 'processing' || task.status === 'pending') {
                  navigate(`/progress/${task.id}`);
                }
              }}>
                {/* 状态竖条 */}
                <div className={`task-card-stripe ${
                  task.status === 'completed' ? 'done' : 
                  task.status === 'processing' || task.status === 'pending' ? 'processing' : 
                  'failed'
                }`} />
                
                {/* 编号 */}
                <div className="task-card-num">
                  #{String(index + 1).padStart(3, '0')}
                </div>

                {/* 主体 */}
                <div className="task-card-body">
                  <div className="task-card-title">{task.name}</div>
                  <div className="task-card-meta">
                    <span className={`task-status ${
                      task.status === 'completed' ? 'done' : 
                      task.status === 'processing' || task.status === 'pending' ? 'processing' : 
                      'failed'
                    }`}>
                      {task.status === 'completed' ? 'COMPLETE' : 
                       task.status === 'processing' ? 'PROCESSING' : 
                       task.status === 'pending' ? 'PENDING' : 
                       'FAILED'}
                    </span>
                    <span className="task-card-time">
                      {new Date(task.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\//g, '.')}
                    </span>
                  </div>
                  
                  {/* 处理中任务显示进度条 */}
                  {(task.status === 'processing' || task.status === 'pending') && (
                    <div className="task-progress-bar">
                      <div 
                        className="task-progress-fill" 
                        style={{ 
                          width: `${task.current_layer ? (task.current_layer / 4) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* COMPLETE 水印戳 */}
                {task.status === 'completed' && (
                  <div className="task-stamp">COMPLETE</div>
                )}

                {/* 操作按钮 */}
                <div className="task-card-actions">
                  {task.status === 'completed' ? (
                    <button className="btn-text" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/result/${task.id}`);
                    }}>
                      查看结果 →
                    </button>
                  ) : task.status === 'processing' || task.status === 'pending' ? (
                    <button className="btn-text" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/progress/${task.id}`);
                    }}>
                      查看进度 →
                    </button>
                  ) : (
                    <button 
                      className="btn-text" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                      style={{ color: '#c0392b' }}
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
