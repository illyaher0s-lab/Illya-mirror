import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

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
        const data = await api.getTask(id);
        setTaskData(data);
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
      const blob = await api.exportTask(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 根据格式确定文件扩展名
      const extension = format === 'json' ? 'json' : format === 'yaml' ? 'yaml' : 'md';
      a.download = `${taskData.name}_${format}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`导出成功：${taskData.name}.${extension}`);
    } catch (err) {
      console.error('Export error:', err);
      // api.exportTask 已经显示了 toast，这里不重复显示
    } finally {
      setExporting(false);
    }
  };

  const renderLayer1Content = () => {
    const data = taskData.layer1_result;
    if (!data || !data.paragraph_index) {
      return <div className="text-kenya-dark/60">暂无数据</div>;
    }
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">段落索引</h3>
          <p className="text-kenya-dark/60">
            识别了 {data.paragraph_index.length} 个段落，按类型分类如下：
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
    if (!data) {
      return <div className="text-kenya-dark/60">暂无数据</div>;
    }
    
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">推理模式提取</h3>
          <p className="text-kenya-dark/60">
            识别了 {data.reasoning_patterns?.length || 0} 个推理模式
          </p>
        </div>
        
        {/* 推理模式列表 */}
        {data.reasoning_patterns && data.reasoning_patterns.map((pattern, idx) => (
          <div key={idx} className="p-6 bg-white border border-kenya-line">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm bg-kenya-dark text-white">
                {pattern.id}
              </span>
              <h4 className="text-lg font-medium">{pattern.name}</h4>
              <span className={`ml-auto px-2 py-1 text-xs ${
                pattern.confidence === '高' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                置信度：{pattern.confidence}
              </span>
            </div>
            
            {pattern.trigger && (
              <div className="mb-3">
                <span className="text-sm font-medium text-kenya-dark/70">触发条件：</span>
                <span className="text-sm text-kenya-dark/90">{pattern.trigger}</span>
              </div>
            )}
            
            {pattern.steps && pattern.steps.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-kenya-dark/70 mb-2">推理步骤：</div>
                <ol className="list-decimal list-inside space-y-1 text-sm text-kenya-dark/90">
                  {pattern.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {pattern.underlying_assumptions && pattern.underlying_assumptions.length > 0 && (
              <div className="text-sm text-kenya-dark/60">
                依赖假设：{pattern.underlying_assumptions.join(', ')}
              </div>
            )}
          </div>
        ))}
        
        {/* 提取说明 */}
        {data.extraction_notes && (
          <div className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line">
            <div className="text-sm font-medium text-kenya-dark/70 mb-2">提取说明</div>
            <div className="text-sm text-kenya-dark/90 space-y-1">
              {data.extraction_notes.total_reasoning_segments_analyzed && (
                <div>分析段落数：{data.extraction_notes.total_reasoning_segments_analyzed}</div>
              )}
              {data.extraction_notes.patterns_discarded && (
                <div>淘汰模式：{data.extraction_notes.patterns_discarded}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLayer4Content = () => {
    const data = taskData.layer4_result || taskData.cognitive_profile;  // Backward compatibility
    if (!data) {
      return <div className="text-kenya-dark/60">暂无数据</div>;
    }
    
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">认知操作系统</h3>
          <p className="text-kenya-dark/60">
            可直接注入 AI 的认知规则集
          </p>
        </div>
        
        {/* Identity */}
        {data.identity && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">身份信息</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-kenya-dark/70">模拟对象：</span>
                <span className="text-sm text-kenya-dark/90">{data.identity.subject}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-kenya-dark/70">覆盖范围：</span>
                <span className="text-sm text-kenya-dark/90">{data.identity.simulation_scope}</span>
              </div>
              {data.identity.known_blind_spots && data.identity.known_blind_spots.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-kenya-dark/70 mb-2">已知盲点：</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-kenya-dark/90">
                    {data.identity.known_blind_spots.map((spot, i) => (
                      <li key={i}>{spot}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Core Assumptions */}
        {data.core_assumptions && data.core_assumptions.length > 0 && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">核心假设（{data.core_assumptions.length} 条）</h4>
            <div className="space-y-4">
              {data.core_assumptions.map((assumption, idx) => (
                <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 text-xs bg-kenya-dark text-white">
                      {assumption.id}
                    </span>
                    <span className={`px-2 py-1 text-xs ${
                      assumption.confidence === '高' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assumption.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-kenya-dark/90">{assumption.statement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reasoning Engine */}
        {data.reasoning_engine && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">推理引擎</h4>
            {data.reasoning_engine.description && (
              <p className="text-sm text-kenya-dark/70 mb-4">{data.reasoning_engine.description}</p>
            )}
            <div className="space-y-4">
              {data.reasoning_engine.patterns && data.reasoning_engine.patterns.map((pattern, idx) => (
                <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs bg-kenya-dark text-white">{pattern.id}</span>
                    <span className="font-medium">{pattern.name}</span>
                    <span className={`ml-auto px-2 py-1 text-xs ${
                      pattern.confidence === '高' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pattern.confidence}
                    </span>
                  </div>
                  {pattern.trigger && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-kenya-dark/70">触发：</span>
                      <span className="text-sm text-kenya-dark/90">{pattern.trigger}</span>
                    </div>
                  )}
                  {pattern.steps && pattern.steps.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium text-kenya-dark/70 mb-1">步骤：</div>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-kenya-dark/90">
                        {pattern.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {pattern.depends_on && pattern.depends_on.length > 0 && (
                    <div className="text-sm text-kenya-dark/60">
                      依赖：{pattern.depends_on.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Expression Engine */}
        {data.expression_engine && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">表达引擎</h4>
            {data.expression_engine.description && (
              <p className="text-sm text-kenya-dark/70 mb-4">{data.expression_engine.description}</p>
            )}
            
            {/* Strategies */}
            {data.expression_engine.strategies && data.expression_engine.strategies.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-kenya-dark/70 mb-2">表达策略：</div>
                <div className="space-y-3">
                  {data.expression_engine.strategies.map((strategy, idx) => (
                    <div key={idx} className="p-3 bg-kenya-dark/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-kenya-dark text-white">{strategy.id}</span>
                        <span className="text-sm font-medium">{strategy.name}</span>
                      </div>
                      {strategy.when_to_use && (
                        <div className="text-sm text-kenya-dark/70 mb-1">
                          <span className="font-medium">何时使用：</span>{strategy.when_to_use}
                        </div>
                      )}
                      {strategy.how && (
                        <div className="text-sm text-kenya-dark/70">
                          <span className="font-medium">如何使用：</span>{strategy.how}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Signature Phrases */}
            {data.expression_engine.signature_phrases && data.expression_engine.signature_phrases.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-kenya-dark/70 mb-2">标志性短语：</div>
                <div className="flex flex-wrap gap-2">
                  {data.expression_engine.signature_phrases.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 text-sm bg-kenya-dark/10 text-kenya-dark">
                      {item.phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Silence Rules */}
            {data.expression_engine.silence_rules && data.expression_engine.silence_rules.length > 0 && (
              <div>
                <div className="text-sm font-medium text-kenya-dark/70 mb-2">沉默规则：</div>
                <div className="space-y-2">
                  {data.expression_engine.silence_rules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border-l-4 border-red-500">
                      <div className="text-sm text-kenya-dark/90">
                        <span className="font-medium">回避：</span>{rule.avoid}
                      </div>
                      <div className="text-sm text-kenya-dark/70">
                        <span className="font-medium">原因：</span>{rule.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Usage Instructions */}
        {data.usage_instructions && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">使用说明</h4>
            <div className="space-y-4">
              {data.usage_instructions.for_new_question && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                  <div className="text-sm font-medium text-blue-800 mb-2">新问题场景</div>
                  <pre className="text-sm text-kenya-dark/90 whitespace-pre-wrap font-sans">
                    {data.usage_instructions.for_new_question}
                  </pre>
                </div>
              )}
              {data.usage_instructions.for_opinion_judgment && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500">
                  <div className="text-sm font-medium text-green-800 mb-2">观点判断场景</div>
                  <pre className="text-sm text-kenya-dark/90 whitespace-pre-wrap font-sans">
                    {data.usage_instructions.for_opinion_judgment}
                  </pre>
                </div>
              )}
              {data.usage_instructions.for_expression_task && (
                <div className="p-4 bg-purple-50 border-l-4 border-purple-500">
                  <div className="text-sm font-medium text-purple-800 mb-2">表达任务场景</div>
                  <pre className="text-sm text-kenya-dark/90 whitespace-pre-wrap font-sans">
                    {data.usage_instructions.for_expression_task}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLayer3Content = () => {
    const data = taskData.layer3_result;
    if (!data) {
      return <div className="text-kenya-dark/60">暂无数据</div>;
    }
    
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-serif mb-2">表达策略分析</h3>
          <p className="text-kenya-dark/60">
            识别了 {data.expression_strategies?.length || 0} 个表达策略和 {data.signature_phrases?.length || 0} 个标志性短语
          </p>
        </div>
        
        {/* 标志性短语 */}
        {data.signature_phrases && data.signature_phrases.length > 0 && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">标志性短语</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.signature_phrases.map((phrase, idx) => (
                <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-kenya-dark">{phrase.phrase}</span>
                    <span className="text-xs text-kenya-dark/60">({phrase.frequency}次)</span>
                  </div>
                  <div className="text-sm text-kenya-dark/70">{phrase.cognitive_role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 表达策略 */}
        {data.expression_strategies && data.expression_strategies.map((strategy, idx) => (
          <div key={idx} className="p-6 bg-white border border-kenya-line">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm bg-kenya-dark text-white">
                {strategy.id}
              </span>
              <h4 className="text-lg font-medium">{strategy.name}</h4>
              <span className={`ml-auto px-2 py-1 text-xs ${
                strategy.confidence === '高' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                置信度：{strategy.confidence}
              </span>
            </div>
            
            {strategy.observable_form && (
              <div className="mb-3">
                <span className="text-sm font-medium text-kenya-dark/70">可观察形式：</span>
                <span className="text-sm text-kenya-dark/90">{strategy.observable_form}</span>
              </div>
            )}
            
            {strategy.cognitive_function && (
              <div className="mb-3">
                <span className="text-sm font-medium text-kenya-dark/70">认知功能：</span>
                <span className="text-sm text-kenya-dark/90">{strategy.cognitive_function}</span>
              </div>
            )}
            
            {strategy.frequency && (
              <div className="text-sm text-kenya-dark/60">
                使用频率：{strategy.frequency}
              </div>
            )}
          </div>
        ))}
        
        {/* 沉默策略 */}
        {data.silence_strategies && data.silence_strategies.length > 0 && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">沉默策略（刻意回避的内容）</h4>
            <div className="space-y-4">
              {data.silence_strategies.map((silence, idx) => (
                <div key={idx} className="p-4 bg-red-50 border-l-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-red-800">回避内容</span>
                    <span className="text-xs text-red-600">置信度：{silence.confidence}</span>
                  </div>
                  <div className="text-sm text-kenya-dark/90 mb-2">{silence.what_he_avoids}</div>
                  <div className="text-sm text-kenya-dark/70">
                    <span className="font-medium">推测原因：</span>
                    {silence.inferred_reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 系统整合 */}
        {data.system_integration && (
          <div className="p-6 bg-white border border-kenya-line">
            <h4 className="text-lg font-medium mb-4">系统整合分析</h4>
            <div className="space-y-3 text-sm">
              {data.system_integration.fa_rp_es_coherence && (
                <div>
                  <span className="font-medium text-kenya-dark/70">三层一致性：</span>
                  <span className="text-kenya-dark/90">{data.system_integration.fa_rp_es_coherence}</span>
                </div>
              )}
              {data.system_integration.internal_tensions && (
                <div>
                  <span className="font-medium text-kenya-dark/70">内部张力：</span>
                  <span className="text-kenya-dark/90">{data.system_integration.internal_tensions}</span>
                </div>
              )}
            </div>
          </div>
        )}
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
      {(error || (taskData.status === 'failed' || taskData.status === 'stopped') && taskData.error_message) && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="kenya-card bg-red-50 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <div className="text-2xl">❌</div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-2">
                  {taskData.status === 'failed' ? '任务失败' : taskData.status === 'stopped' ? '任务已停止' : '错误'}
                </h3>
                <p className="text-red-700">{error || taskData.error_message}</p>
              </div>
            </div>
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
          <button
            onClick={() => setSearchParams({ layer: '4' })}
            className={`px-4 py-2 text-sm transition-colors ${
              layer === '4' 
                ? 'bg-kenya-dark text-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          >
            第四层
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
            <h2 className="text-2xl font-serif mb-6">第 {layer} 层结果</h2>

            {layer === '1' && renderLayer1Content()}
            {layer === '2' && renderLayer2Content()}
            {layer === '3' && renderLayer3Content()}
            {layer === '4' && renderLayer4Content()}
          </div>
        )}

        {/* 质量报告 */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            {!taskData.quality_report ? (
              <div className="kenya-card text-center py-20">
                <div className="text-4xl mb-4 opacity-20">📊</div>
                <p className="text-kenya-dark/60">质量报告尚未生成</p>
              </div>
            ) : (
              <>
                {/* 整体评分 */}
                <div className="kenya-card">
                  <h2 className="text-2xl font-serif mb-6">质量评分</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-kenya-dark/60 mb-2">整体质量</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-serif">{taskData.quality_report.overall_score || 0}</span>
                        <span className="text-kenya-dark/60">/100</span>
                      </div>
                      <div className="mt-2 h-2 bg-kenya-line/20 overflow-hidden">
                        <div 
                          className="h-full bg-kenya-dark"
                          style={{ width: `${taskData.quality_report.overall_score || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-kenya-dark/60 mb-2">置信度</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-serif">{taskData.quality_report.confidence_score || 0}</span>
                        <span className="text-kenya-dark/60">/100</span>
                      </div>
                      <div className="mt-2 h-2 bg-kenya-line/20 overflow-hidden">
                        <div 
                          className="h-full bg-green-600"
                          style={{ width: `${taskData.quality_report.confidence_score || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bad Cases */}
                <div className="kenya-card">
                  <h3 className="text-xl font-serif mb-4">Bad Case 检测</h3>
                  {!taskData.quality_report.bad_cases || taskData.quality_report.bad_cases.length === 0 ? (
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
                {taskData.quality_report.coverage_analysis && (
                  <div className="kenya-card">
                    <h3 className="text-xl font-serif mb-4">覆盖度分析</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-kenya-dark/60 mb-1">总段落数</div>
                        <div className="text-3xl font-serif">{taskData.quality_report.coverage_analysis.total_paragraphs || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-kenya-dark/60 mb-1">已覆盖</div>
                        <div className="text-3xl font-serif">{taskData.quality_report.coverage_analysis.covered_paragraphs || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-kenya-dark/60 mb-1">覆盖率</div>
                        <div className="text-3xl font-serif">{taskData.quality_report.coverage_analysis.coverage_rate || 0}%</div>
                      </div>
                    </div>
                    <div className="mt-4 h-3 bg-kenya-line/20 overflow-hidden">
                      <div 
                        className="h-full bg-green-600"
                        style={{ width: `${taskData.quality_report.coverage_analysis.coverage_rate || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={() => handleExport('json')}
            className="px-6 py-3 bg-kenya-dark text-white hover:bg-kenya-dark/90 transition-colors disabled:opacity-50"
            disabled={exporting}
          >
            {exporting ? '导出中...' : '导出 JSON'}
          </button>
          <button
            onClick={() => handleExport('markdown')}
            className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors disabled:opacity-50"
            disabled={exporting}
          >
            {exporting ? '导出中...' : '导出 Markdown'}
          </button>
          <button
            onClick={() => handleExport('txt')}
            className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors disabled:opacity-50"
            disabled={exporting}
          >
            {exporting ? '导出中...' : '导出 TXT'}
          </button>
          <button
            onClick={() => navigate(`/progress/${id}`)}
            className="px-6 py-3 border border-kenya-line hover:bg-kenya-dark/5 transition-colors ml-auto"
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
