import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const layer = searchParams.get('layer') || '3';

  // TODO: 实际数据会在 Task 16 从 API 获取
  const [taskData, setTaskData] = useState({
    title: '示例任务',
    layer1_result: { paragraph_index: [] },
    layer2_result: { distilled_content: '' },
    layer3_result: { final_output: '' },
    quality_report: {
      overall_score: 85,
      confidence_score: 90,
      bad_cases: [],
      coverage_analysis: {}
    }
  });

  const [activeTab, setActiveTab] = useState('content');

  const handleExport = (format) => {
    // TODO: 调用导出 API
    console.log(`导出格式: ${format}`);
  };

  return (
    <div className="min-h-screen bg-kenya-brown">
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-5xl mb-2">{taskData.title}</h1>
          <p className="text-kenya-dark/70">蒸馏结果 - 第 {layer} 层</p>
        </div>
      </div>

      {/* 结果区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab 切换 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 transition-colors ${
              activeTab === 'content' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            蒸馏内容
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-6 py-3 transition-colors ${
              activeTab === 'quality' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            质量报告
          </button>
        </div>

        {/* 内容展示 */}
        {activeTab === 'content' && (
          <div className="kenya-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">第 {layer} 层结果</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5"
                >
                  导出 JSON
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5"
                >
                  导出 Markdown
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              {layer === '1' && (
                <div>
                  <h3>段落索引</h3>
                  <p className="text-kenya-dark/60">
                    第一层结果：段落类型识别和内容索引
                  </p>
                  {/* TODO: 实际渲染 paragraph_index */}
                  <pre className="bg-kenya-dark/5 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(taskData.layer1_result, null, 2)}
                  </pre>
                </div>
              )}

              {layer === '2' && (
                <div>
                  <h3>深度蒸馏</h3>
                  <p className="text-kenya-dark/60">
                    第二层结果：核心概念提取和知识结构
                  </p>
                  <div className="mt-4 whitespace-pre-wrap">
                    {taskData.layer2_result?.distilled_content || '暂无数据'}
                  </div>
                </div>
              )}

              {layer === '3' && (
                <div>
                  <h3>最终蒸馏</h3>
                  <p className="text-kenya-dark/60">
                    第三层结果：认知友好的最终输出
                  </p>
                  <div className="mt-4 whitespace-pre-wrap">
                    {taskData.layer3_result?.final_output || '暂无数据'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 质量报告 */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            {/* 整体评分 */}
            <div className="kenya-card">
              <h2 className="text-2xl font-serif mb-6">质量评分</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-kenya-dark/60 mb-2">整体质量</div>
                  <div className="text-4xl font-serif">{taskData.quality_report.overall_score}</div>
                </div>
                <div>
                  <div className="text-sm text-kenya-dark/60 mb-2">置信度</div>
                  <div className="text-4xl font-serif">{taskData.quality_report.confidence_score}</div>
                </div>
              </div>
            </div>

            {/* Bad Cases */}
            <div className="kenya-card">
              <h3 className="text-xl font-serif mb-4">Bad Case 检测</h3>
              {taskData.quality_report.bad_cases.length === 0 ? (
                <p className="text-kenya-dark/60">未检测到质量问题</p>
              ) : (
                <ul className="space-y-2">
                  {taskData.quality_report.bad_cases.map((item, idx) => (
                    <li key={idx} className="p-3 bg-red-50 border-l-4 border-red-500">
                      <div className="font-medium">{item.type}</div>
                      <div className="text-sm text-kenya-dark/70">{item.description}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 覆盖度分析 */}
            <div className="kenya-card">
              <h3 className="text-xl font-serif mb-4">覆盖度分析</h3>
              <p className="text-kenya-dark/60">段落级别的内容覆盖情况</p>
              {/* TODO: 实际渲染覆盖度数据 */}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate(`/progress/${id}`)}
            className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors"
          >
            返回进度页
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
