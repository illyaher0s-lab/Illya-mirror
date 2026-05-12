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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: 实际 API 调用会在 Task 16 实现
    console.log('提交数据:', formData);
    // 模拟跳转到进度页
    // navigate(`/progress/1`);
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
            />
          </div>

          {/* 文本内容 */}
          <div className="kenya-card">
            <label className="block mb-2 font-medium">文本内容</label>
            <textarea
              className="kenya-input w-full min-h-[300px] resize-y"
              placeholder="粘贴或输入需要蒸馏的长文本..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
            <p className="text-sm text-kenya-dark/50 mt-2">
              建议长度：1000-10000 字
            </p>
          </div>

          {/* 认知画像配置 */}
          <div className="kenya-card">
            <h3 className="font-medium mb-4">认知画像配置</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm">阅读速度</label>
                <select 
                  className="kenya-input w-full"
                  value={formData.cognitive_profile.reading_speed}
                  onChange={(e) => setFormData({
                    ...formData, 
                    cognitive_profile: {...formData.cognitive_profile, reading_speed: e.target.value}
                  })}
                >
                  <option value="slow">慢速（200字/分钟）</option>
                  <option value="medium">中速（300字/分钟）</option>
                  <option value="fast">快速（400字/分钟）</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm">专注时长</label>
                <select 
                  className="kenya-input w-full"
                  value={formData.cognitive_profile.focus_duration}
                  onChange={(e) => setFormData({
                    ...formData, 
                    cognitive_profile: {...formData.cognitive_profile, focus_duration: e.target.value}
                  })}
                >
                  <option value="short">短时（5-10分钟）</option>
                  <option value="medium">中等（15-20分钟）</option>
                  <option value="long">长时（30分钟以上）</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm">偏好深度</label>
                <select 
                  className="kenya-input w-full"
                  value={formData.cognitive_profile.preferred_depth}
                  onChange={(e) => setFormData({
                    ...formData, 
                    cognitive_profile: {...formData.cognitive_profile, preferred_depth: e.target.value}
                  })}
                >
                  <option value="shallow">浅层（快速浏览）</option>
                  <option value="medium">中等（理解要点）</option>
                  <option value="deep">深度（完整掌握）</option>
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
            >
              取消
            </button>
            <button type="submit" className="kenya-button flex-1">
              开始蒸馏
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
