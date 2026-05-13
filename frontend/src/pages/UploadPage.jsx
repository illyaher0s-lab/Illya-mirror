import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Header from '../components/Header';

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setFormData({...formData, content: text});
      
      // 如果标题为空，使用文件名作为标题
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 去掉扩展名
        setFormData(prev => ({...prev, title: fileName}));
      }
      setFileLoading(false);
      toast.success('文件读取成功');
    };
    reader.onerror = () => {
      setFileLoading(false);
      toast.error('文件读取失败，请重试');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 表单验证
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
      // 创建成功，跳转到进度页
      navigate(`/progress/${result.id}`);
    } catch (err) {
      console.error('Failed to create task:', err);
      setLoading(false);
      // 错误已经由 api.js 显示 toast
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
      <Header />
      
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kenya-dark/60 hover:text-kenya-dark transition-colors mb-4"
          >
            <span>←</span>
            <span className="text-sm">返回首页</span>
          </button>
          <h1 className="font-serif text-5xl mb-2">创建蒸馏任务</h1>
          <p className="text-kenya-dark/70">上传文本内容,开始认知结构提取</p>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className={`px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5 transition-colors ${fileLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                {fileLoading ? '读取文件中...' : '上传文件'}
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={fileLoading}
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

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="kenya-button-secondary"
              disabled={loading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="kenya-button flex-1"
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
