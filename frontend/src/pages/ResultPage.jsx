import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const layer = searchParams.get('layer') || '3';

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        // TODO: Task 16 会替换为真实 API 调用
        // const response = await fetch(`/api/distillations/${id}`);
        // const data = await response.json();
        
        // 模拟数据
        const mockData = {
          id: parseInt(id),
          title: 'AI 产品设计方法论长文',
          status: 'completed',
          layer1_result: {
            paragraph_index: [
              { type: 'concept', title: '什么是 AI 产品', full_text: null },
              { type: 'description', title: '核心特征', full_text: 'AI 产品的核心特征包括...' },
              { type: 'example', title: '案例分析', full_text: '以 ChatGPT 为例...' },
            ],
            paragraph_count: 45,
            completed_at: '2026-05-12T14:25:00'
          },
          layer2_result: {
            distilled_content: `# AI 产品设计核心要点

## 1. 产品定位
- 明确 AI 能力边界
- 识别用户真实需求
- 设计合理的交互模式

## 2. 用户体验
- 降低学习成本
- 提供即时反馈
- 处理边界情况

## 3. 技术实现
- 选择合适的模型
- 优化响应速度
- 保证输出质量`,
            completed_at: '2026-05-12T14:40:00'
          },
          layer3_result: {
            final_output: `AI 产品设计的三个关键维度：

**产品定位**：首先要明确 AI 的能力边界，不要过度承诺。识别用户的真实需求，而不是被技术驱动。设计合理的交互模式，让用户理解 AI 在做什么。

**用户体验**：降低学习成本，让用户快速上手。提供即时反馈，让用户知道系统状态。妥善处理边界情况，当 AI 无法理解时给出明确提示。

**技术实现**：选择合适的模型，平衡效果和成本。优化响应速度，避免用户等待焦虑。保证输出质量，建立评估和监控机制。`,
            completed_at: '2026-05-12T14:55:00'
          },
          quality_report: {
            overall_score: 88,
            confidence_score: 92,
            bad_cases: [
              {
                type: '过度简化',
                description: '第二层蒸馏中，技术实现部分可能丢失了一些重要细节',
                severity: 'medium'
              }
            ],
            coverage_analysis: {
              total_paragraphs: 45,
              covered_paragraphs: 42,
              coverage_rate: 93.3
            }
          },
          created_at: '2026-05-12T14:20:00',
          updated_at: '2026-05-12T14:55:00'
        };
        
        setTaskData(mockData);
        setLoading(false);
      } catch (err) {
        setError('获取任务数据失败');
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [id]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      // TODO: Task 16 会调用导出 API
      // const response = await fetch(`/api/distillations/${id}/export?format=${format}`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `${taskData.title}_layer${layer}.${format}`;
      // a.click();
      
      console.log(`导出格式: ${format}`);
      
      // 模拟导出
      let content = '';
      if (format === 'json') {
        content = JSON.stringify(taskData[`layer${layer}_result`], null, 2);
      } else if (format === 'markdown') {
        content = taskData[`layer${layer}_result`]?.distilled_content || 
                  taskData[`layer${layer}_result`]?.final_output || 
                  JSON.stringify(taskData[`layer${layer}_result`], null, 2);
      } else if (format === 'txt') {
        content = taskData[`layer${layer}_result`]?.final_output || 
                  taskData[`layer${layer}_result`]?.distilled_content || 
                  JSON.stringify(taskData[`layer${layer}_result`], null, 2);
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${taskData.title}_layer${layer}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const renderLayer1Content = () => {
    const data = taskData.layer1_result;
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">段落索引</h3>
          <p className="text-kenya-dark/60">
            识别了 {data.paragraph_count} 个段落，按类型分类如下：
          </p>
        </div>
        
        <div className="space-y-3">
          {data.paragraph_index.map((item, idx) => (
            <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 text-xs bg-kenya-dark text-white">
                  {item.type}
                </span>
                <span className="font-medium">{item.title}</span>
              </div>
              {item.full_text && (
                <p className="text-sm text-kenya-dark/70">{item.full_text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLayer2Content = () => {
    const data = taskData.layer2_result;
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">深度蒸馏</h3>
          <p className="text-kenya-dark/60">
            提取核心概念，构建知识结构
          </p>
        </div>
        
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
            {data.distilled_content}
          </pre>
        </div>
      </div>
    );
  };

  const renderLayer3Content = () => {
    const data = taskData.layer3_result;
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">最终蒸馏</h3>
          <p className="text-kenya-dark/60">
            认知友好的最终输出
          </p>
        </div>
        
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
            {data.final_output}
          </pre>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kenya-brown flex items-center justify-center">
        <div className="kenya-card text-center py-20">
          <div className="animate-pulse">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-kenya-dark/60">加载结果...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !taskData) {
    return (
      <div className="min-h-screen bg-kenya-brown flex items-center justify-center">
        <div className="kenya-card text-center py-20">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-kenya-dark/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="kenya-button"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kenya-brown">
      {/* Hero 区域 */}
      <div className="bg-kenya-cream py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-5xl mb-2">{taskData.title}</h1>
          <p className="text-kenya-dark/70">蒸馏结果 - 第 {layer} 层</p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="kenya-card bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 结果区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 层级切换 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSearchParams({ layer: '1' })}
            className={`px-4 py-2 text-sm transition-colors ${
              layer === '1' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            第一层
          </button>
          <button
            onClick={() => setSearchParams({ layer: '2' })}
            className={`px-4 py-2 text-sm transition-colors ${
              layer === '2' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            第二层
          </button>
          <button
            onClick={() => setSearchParams({ layer: '3' })}
            className={`px-4 py-2 text-sm transition-colors ${
              layer === '3' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            第三层
          </button>
        </div>

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
                  className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5 disabled:opacity-50"
                  disabled={exporting}
                >
                  {exporting ? '导出中...' : '导出 JSON'}
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5 disabled:opacity-50"
                  disabled={exporting}
                >
                  {exporting ? '导出中...' : '导出 Markdown'}
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="px-4 py-2 text-sm border border-kenya-line hover:bg-kenya-dark/5 disabled:opacity-50"
                  disabled={exporting}
                >
                  {exporting ? '导出中...' : '导出 TXT'}
                </button>
              </div>
            </div>

            {layer === '1' && renderLayer1Content()}
            {layer === '2' && renderLayer2Content()}
            {layer === '3' && renderLayer3Content()}
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
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif">{taskData.quality_report.overall_score}</span>
                    <span className="text-kenya-dark/60">/100</span>
                  </div>
                  <div className="mt-2 h-2 bg-kenya-line/20 overflow-hidden">
                    <div 
                      className="h-full bg-kenya-dark"
                      style={{ width: `${taskData.quality_report.overall_score}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-kenya-dark/60 mb-2">置信度</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif">{taskData.quality_report.confidence_score}</span>
                    <span className="text-kenya-dark/60">/100</span>
                  </div>
                  <div className="mt-2 h-2 bg-kenya-line/20 overflow-hidden">
                    <div 
                      className="h-full bg-green-600"
                      style={{ width: `${taskData.quality_report.confidence_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bad Cases */}
            <div className="kenya-card">
              <h3 className="text-xl font-serif mb-4">Bad Case 检测</h3>
              {taskData.quality_report.bad_cases.length === 0 ? (
                <p className="text-kenya-dark/60">✓ 未检测到质量问题</p>
              ) : (
                <ul className="space-y-3">
                  {taskData.quality_report.bad_cases.map((item, idx) => (
                    <li key={idx} className={`p-4 border-l-4 ${
                      item.severity === 'high' ? 'bg-red-50 border-red-500' :
                      item.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          item.severity === 'high' ? 'bg-red-200 text-red-800' :
                          item.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                      <div className="text-sm text-kenya-dark/70">{item.description}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 覆盖度分析 */}
            <div className="kenya-card">
              <h3 className="text-xl font-serif mb-4">覆盖度分析</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-kenya-dark/60 mb-1">总段落数</div>
                  <div className="text-3xl font-serif">{taskData.quality_report.coverage_analysis.total_paragraphs}</div>
                </div>
                <div>
                  <div className="text-sm text-kenya-dark/60 mb-1">已覆盖</div>
                  <div className="text-3xl font-serif">{taskData.quality_report.coverage_analysis.covered_paragraphs}</div>
                </div>
                <div>
                  <div className="text-sm text-kenya-dark/60 mb-1">覆盖率</div>
                  <div className="text-3xl font-serif">{taskData.quality_report.coverage_analysis.coverage_rate}%</div>
                </div>
              </div>
              <div className="mt-4 h-3 bg-kenya-line/20 overflow-hidden">
                <div 
                  className="h-full bg-green-600"
                  style={{ width: `${taskData.quality_report.coverage_analysis.coverage_rate}%` }}
                />
              </div>
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
