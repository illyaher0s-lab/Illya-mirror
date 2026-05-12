import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    cognitive_profile: {
      reading_speed: 'medium',
      focus_duration: 'medium',
      preferred_depth: 'medium'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const wordCount = formData.content.length;
  const isValidLength = wordCount >= 1000 && wordCount <= 50000;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setFormData({...formData, content: text});
      
      // 如果标题为空，使用文件名作为标题
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 去掉扩展名
        setFormData(prev => ({...prev, title: fileName}));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!formData.title.trim()) {
      setError('请输入任务标题');
      return;
    }

    if (!formData.content.trim()) {
      setError('请输入或上传文本内容');
      return;
    }

    if (wordCount < 1000) {
      setError('文本内容至少需要 1000 字');
      return;
    }

    if (wordCount > 50000) {
      setError('文本内容不能超过 50000 字');
      return;
    }

    setLoading(true);

    try {
      // TODO: Task 16 会替换为真实 API 调用
      console.log('提交数据:', formData);
      
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟创建成功，跳转到进度页
      const mockTaskId = Math.floor(Math.random() * 1000);
      navigate(`/progress/${mockTaskId}`);
    } catch (err) {
      setError('创建任务失败，请重试');
      setLoading(false);
    }
  };

  const getWordCountColor = () => {
    if (wordCount === 0) return 'text-kenya-dark/50';
    if (wordCount < 1000) return 'text-red-600';
    if (wordCount > 50000) return 'text-red-600';
    if (wordCount > 10000) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-kenya-brown">
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-serif text-5xl mb-2">创建蒸馏任务</h1>
          <p className="text-kenya-dark/70">上传文本内容，配置认知画像</p>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 错误提示 */}
          {error && (
            <div className="kenya-card bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 任务标题 */}
          <div className="kenya-card">
            <label className="block mb-2 font-medium">任务标题</label>
            <input
              type="text"
              className="kenya-input w-full"
              placeholder="为这次蒸馏任务起个名字"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              maxLength={100}
            />
            <p className="text-xs text-kenya-dark/50 mt-1">
              {formData.title.length}/100
            </p>
          </div>

          {/* 文本内容 */}
          <div className="kenya-card">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">文本内容</label>
              <label className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5 transition-colors cursor-pointer">
                上传文件
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <textarea
              className="kenya-input w-full min-h-[300px] resize-y font-mono text-sm"
              placeholder="粘贴或输入需要蒸馏的长文本...&#10;&#10;支持上传 .txt 或 .md 文件"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-kenya-dark/50">
                建议长度：1000-10000 字
              </p>
              <p className={`text-sm font-medium ${getWordCountColor()}`}>
                {wordCount.toLocaleString()} 字
                {wordCount > 0 && !isValidLength && (
                  <span className="ml-2">
                    {wordCount < 1000 ? '(太短)' : '(太长)'}
                  </span>
                )}
                {wordCount > 0 && isValidLength && (
                  <span className="ml-2">✓</span>
                )}
              </p>
            </div>
          </div>

          {/* 认知画像配置 */}
          <div className="kenya-card">
            <h3 className="font-medium mb-2">认知画像配置</h3>
            <p className="text-sm text-kenya-dark/60 mb-4">
              根据你的阅读习惯和需求，调整蒸馏输出的风格和深度
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">阅读速度</label>
                <select 
                  className="kenya-input w-full"
                  value={formData.cognitive_profile.reading_speed}
                  onChange={(e) => setFormData({
                    ...formData, 
                    cognitive_profile: {...formData.cognitive_profile, reading_speed: e.target.value}
                  })}
                >
                  <option value="slow">慢速（200字/分钟）- 适合深度理解</option>
                  <option value="medium">中速（300字/分钟）- 平衡速度与理解</option>
                  <option value="fast">快速（400字/分钟）- 快速浏览要点</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">专注时长</label>
                <select 
                  className="kenya-input w-full"
                  value={formData.cognitive_profile.focus_duration}
                  onChange={(e) => setFormData({
                    ...formData, 
                    cognitive_profile: {...formData.cognitive_profile, focus_duration: e.target.value}
                  })}
                >
                  <option value="short">短时（5-10分钟）- 碎片化阅读</option>
                  <option value="medium">中等（15-20分钟）- 常规阅读</option>
                  <option value="long">长时（30分钟以上）- 深度学习</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">偏好深度</label>
                <select 
                  className="kenya-input w-full"
                  value={formData.cognitive_profile.preferred_depth}
                  onChange={(e) => setFormData({
                    ...formData, 
                    cognitive_profile: {...formData.cognitive_profile, preferred_depth: e.target.value}
                  })}
                >
                  <option value="shallow">浅层（快速浏览）- 只要核心观点</option>
                  <option value="medium">中等（理解要点）- 理解主要内容</option>
                  <option value="deep">深度（完整掌握）- 全面理解细节</option>
                </select>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="kenya-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isValidLength}
            >
              {loading ? '创建中...' : '开始蒸馏'}
            </button>
          </div>

          {/* 提示信息 */}
          {!isValidLength && wordCount > 0 && (
            <div className="kenya-card bg-yellow-50 border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-800">
                {wordCount < 1000 
                  ? `还需要 ${(1000 - wordCount).toLocaleString()} 字才能开始蒸馏`
                  : `文本过长，请删减 ${(wordCount - 50000).toLocaleString()} 字`
                }
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
