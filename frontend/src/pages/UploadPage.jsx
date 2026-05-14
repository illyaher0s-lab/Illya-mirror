import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const wordCount = formData.content.length;
  const isValidLength = wordCount >= 1000 && wordCount <= 50000;
  const isValid = formData.title.trim() && formData.content.trim() && isValidLength;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    toast.loading('读取文件中...', { id: 'file-upload' });
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setFormData(prev => ({
        ...prev,
        content: text,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
      setFileLoading(false);
      toast.success('文件读取成功', { id: 'file-upload' });
    };
    reader.onerror = () => {
      setFileLoading(false);
      toast.error('文件读取失败，请重试', { id: 'file-upload' });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('请输入或上传文本内容');
      return;
    }

    if (wordCount < 1000) {
      toast.error('文本内容至少需要 1000 字');
      return;
    }

    if (wordCount > 50000) {
      toast.error('文本内容不能超过 50000 字');
      return;
    }

    setLoading(true);

    try {
      const result = await api.createTask({
        name: formData.title,
        raw_text: formData.content
      });
      toast.success('任务创建成功！');
      navigate(`/progress/${result.id}`);
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('创建失败，请重试');
      setLoading(false);
    }
  };

  const getWordCountColor = () => {
    if (wordCount === 0) return 'var(--text-muted)';
    if (wordCount < 1000) return '#c0392b';
    if (wordCount > 50000) return '#c0392b';
    if (wordCount > 10000) return '#E07A30';
    return 'var(--accent-blue)';
  };

  // Ticker 内容（静态版本）
  const tickerItems = [
    'TEXT INPUT',
    'LAYER 1: PARAGRAPH INDEX',
    'LAYER 2: REASONING PATTERNS',
    'LAYER 3: EXPRESSION STRATEGIES',
    'LAYER 4: COGNITIVE PROFILE'
  ];

  return (
    <div className="page-frame paper">
      {/* Nav with Breadcrumb */}
      <nav className="nav">
        <div className="nav-breadcrumb">
          <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>
            ← MIRROR
          </span>
          <span className="nav-breadcrumb-sep">/</span>
          <span className="nav-breadcrumb-cur">创建蒸馏任务</span>
        </div>
        <div className="nav-version">SYS_v2.4</div>
      </nav>

      {/* Ticker (静态) */}
      <div className="ticker static">
        <div className="ticker-inner">
          {tickerItems.map((item, i) => (
            <span key={i}>
              {item}
              {i < tickerItems.length - 1 && <span className="ticker-sep"> → </span>}
            </span>
          ))}
        </div>
      </div>

      {/* Hero 区 */}
      <div className="content-area" style={{ paddingTop: '32px', paddingBottom: '24px' }}>
        <span className="eyebrow">NEW DISTILLATION</span>
        <h1 className="page-title page-title-inner">创建蒸馏任务</h1>
        <p className="page-desc">
          上传你的文本内容，我们将提取其中的思维模式。
          <br />
          支持 1,000 - 50,000 字的文本输入。
        </p>
      </div>

      {/* 表单区 */}
      <div style={{ padding: '0 28px 40px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-wrap">
            {/* Terminal Header */}
            <div className="form-header">
              <div className={`form-header-dot ${formData.title ? 'active' : ''}`} />
              <div className={`form-header-dot ${formData.content && isValidLength ? 'active' : ''}`} />
              <div className="form-header-dot" />
              <span className="form-header-title">INPUT_FORM</span>
            </div>

            <div className="form-body">
              {/* 任务标题 */}
              <div className="form-field">
                <label className="form-label">TASK_NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="给这次蒸馏起个名字"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
                <div className="form-char-count">
                  {formData.title.length}/100
                </div>
              </div>

              {/* 文本内容 */}
              <div className="form-field" style={{ marginBottom: 0 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    TEXT_CONTENT
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.08em',
                        color: getWordCountColor()
                      }}
                    >
                      {wordCount.toLocaleString()} / 50,000
                      {wordCount > 0 && isValidLength && ' ✓'}
                    </span>
                    <label className="btn-outline" style={{ 
                      cursor: fileLoading ? 'not-allowed' : 'pointer',
                      opacity: fileLoading ? 0.5 : 1
                    }}>
                      ↑ {fileLoading ? 'READING...' : 'UPLOAD_FILE'}
                      <input
                        type="file"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                        disabled={fileLoading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="粘贴或输入至少 1000 字的文本内容..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <div className="form-char-count">
                  {wordCount < 1000 && wordCount > 0 && (
                    <span style={{ color: '#c0392b' }}>
                      ⚠ 至少需要 1000 字（当前 {wordCount} 字）
                    </span>
                  )}
                  {wordCount > 50000 && (
                    <span style={{ color: '#c0392b' }}>
                      ⚠ 不能超过 50000 字（当前 {wordCount} 字）
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            marginTop: '24px'
          }}>
            <button 
              type="button"
              className="btn-outline" 
              onClick={() => navigate('/')}
            >
              ← CANCEL
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!isValid || loading}
            >
              {loading ? '⟳ CREATING...' : '▶ 开始蒸馏'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
