import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import FormCard from '../components/FormCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

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

  const getDisabledReason = () => {
    if (!formData.title.trim()) return '请输入任务标题';
    if (!formData.content.trim()) return '请输入文本内容';
    if (wordCount < 1000) return '文本内容至少需要 1000 字';
    if (wordCount > 50000) return '文本内容不能超过 50000 字';
    return '';
  };

  return (
    <div className="min-h-screen bg-kenya-brown">
      <AppHeader breadcrumb="创建蒸馏任务" />

      {/* Hero 区 */}
      <div className="bg-kenya-cream py-10">
        <PageContainer>
          <PageTitle
            title="创建蒸馏任务"
            subtitle="上传你的文本内容，我们将提取其中的思维模式"
          />
        </PageContainer>
      </div>

      {/* 表单区 */}
      <PageContainer>
        <div className="mt-8">
        <FormCard>
          <form onSubmit={handleSubmit}>
            {/* 任务标题 */}
            <div className="mb-6">
              <label className="block text-base font-medium text-kenya-dark mb-2">
                任务标题
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 border border-kenya-line rounded-lg text-base
                         focus:outline-none focus:ring-2 focus:ring-kenya-dark/20 transition-all"
                placeholder="给这次蒸馏起个名字"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={100}
              />
              <p className="text-xs text-kenya-dark/40 text-right mt-1">
                {formData.title.length}/100
              </p>
            </div>

            {/* 文本内容 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-base font-medium text-kenya-dark">
                  文本内容
                </label>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${getWordCountColor()}`}>
                    {wordCount.toLocaleString()} / 50,000 字
                    {wordCount > 0 && isValidLength && <span className="ml-2">✓</span>}
                  </span>
                  <label className={`px-4 py-2 text-sm border-[0.5px] border-kenya-line rounded-lg
                                   hover:bg-kenya-dark/5 transition-colors font-medium
                                   ${fileLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {fileLoading ? '读取文件中...' : '上传文件'}
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      disabled={fileLoading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <textarea
                className="w-full h-80 p-4 border border-kenya-line rounded-lg resize-none text-base
                         focus:outline-none focus:ring-2 focus:ring-kenya-dark/20 transition-all"
                placeholder="粘贴或输入至少 1000 字的文本内容..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              {wordCount > 0 && wordCount < 1000 && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ 请输入至少 1000 字（当前 {wordCount} 字）
                </p>
              )}
              {wordCount > 50000 && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ 文本内容不能超过 50000 字（当前 {wordCount} 字）
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4">
              <SecondaryButton onClick={() => navigate('/')} type="button">
                取消
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={!isValid}
                loading={loading}
                className="w-40"
              >
                {loading ? '创建中...' : isValid ? '开始蒸馏' : getDisabledReason()}
              </PrimaryButton>
            </div>
          </form>
        </FormCard>
        </div>
      </PageContainer>
    </div>
  );
}
