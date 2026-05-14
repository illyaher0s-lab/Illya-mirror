import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ResultCard from '../components/ResultCard';
import LayerTabs from '../components/LayerTabs';
import SegmentedControl from '../components/SegmentedControl';
import SecondaryButton from '../components/SecondaryButton';
import TertiaryButton from '../components/TertiaryButton';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const layer = parseInt(searchParams.get('layer') || '1');

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

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setActiveTab('content');
      } else if (e.key === 'ArrowRight') {
        setActiveTab('quality');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const blob = await api.exportTask(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const extension = format === 'json' ? 'json' : format === 'yaml' ? 'yaml' : format === 'txt' ? 'txt' : 'md';
      a.download = `${taskData.name}_${format}.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`导出成功：${taskData.name}.${extension}`);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const renderLayer1Content = () => {
    const data = taskData.layer1_result;
    if (!data || !data.paragraph_index || data.paragraph_index.length === 0) {
      return (
        <EmptyState
          icon="📄"
          message="第一层暂无结果"
          actions={[
            <SecondaryButton key="layer2" onClick={() => setSearchParams({ layer: '2' })}>
              查看第二层
            </SecondaryButton>,
            <SecondaryButton key="home" onClick={() => navigate('/')}>
              返回首页
            </SecondaryButton>
          ]}
        />
      );
    }

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">段落索引</h3>
          <p className="text-kenya-dark/60 text-sm">
            识别了 {data.paragraph_index.length} 个段落，按类型分类如下：
          </p>
        </div>

        <div className="space-y-3">
          {data.paragraph_index.map((item, idx) => {
            const typeColors = {
              '判断型': { border: 'border-l-[3px] border-[#E8593C]', badge: 'bg-[rgba(232,89,60,0.1)] text-[#C04828]' },
              '推理型': { border: 'border-l-[3px] border-[#3B8BD4]', badge: 'bg-[rgba(59,139,212,0.1)] text-[#185FA5]' },
              '叙述型': { border: 'border-l-[3px] border-[#3B6D11]', badge: 'bg-[rgba(59,109,17,0.1)] text-[#2D5209]' },
              '提问型': { border: 'border-l-[3px] border-[#854F0B]', badge: 'bg-[rgba(133,79,11,0.1)] text-[#6B3F08]' },
              '反思型': { border: 'border-l-[3px] border-[#533AB7]', badge: 'bg-[rgba(83,58,183,0.1)] text-[#3F2C8A]' }
            };
            const colors = typeColors[item.type] || { border: 'border-l-4 border-kenya-line', badge: 'bg-kenya-dark text-kenya-cream' };
            
            return (
              <div key={idx} className={`p-4 bg-kenya-dark/5 rounded ${colors.border}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs border border-current rounded ${colors.badge}`}>
                    {item.type}
                  </span>
                  <span className="font-medium text-base">{item.title}</span>
                </div>
                {item.full_text && (
                  <p className="text-sm text-kenya-dark/90 leading-6">{item.full_text}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLayer2Content = () => {
    const data = taskData.layer2_result;
    if (!data || !data.reasoning_patterns || data.reasoning_patterns.length === 0) {
      return (
        <EmptyState
          icon="📄"
          message="第二层暂无结果"
          actions={[
            <SecondaryButton key="layer1" onClick={() => setSearchParams({ layer: '1' })}>
              查看第一层
            </SecondaryButton>,
            <SecondaryButton key="home" onClick={() => navigate('/')}>
              返回首页
            </SecondaryButton>
          ]}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">推理模式提取</h3>
          <p className="text-kenya-dark/60 text-sm">
            识别了 {data.reasoning_patterns?.length || 0} 个推理模式
          </p>
        </div>

        {data.reasoning_patterns && data.reasoning_patterns.map((pattern, idx) => (
          <div key={idx} className="p-6 bg-white border border-kenya-line rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm bg-kenya-dark text-kenya-cream border border-kenya-dark rounded">
                {pattern.id}
              </span>
              <h4 className="text-lg font-medium">{pattern.name}</h4>
              <span className={`ml-auto px-2 py-1 text-xs rounded ${
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
      </div>
    );
  };

  const renderLayer3Content = () => {
    const data = taskData.layer3_result;
    if (!data || (!data.expression_strategies && !data.signature_phrases)) {
      return (
        <EmptyState
          icon="📄"
          message="第三层暂无结果"
          actions={[
            <SecondaryButton key="layer1" onClick={() => setSearchParams({ layer: '1' })}>
              查看第一层
            </SecondaryButton>,
            <SecondaryButton key="layer2" onClick={() => setSearchParams({ layer: '2' })}>
              查看第二层
            </SecondaryButton>,
            <SecondaryButton key="home" onClick={() => navigate('/')}>
              返回首页
            </SecondaryButton>
          ]}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">表达策略分析</h3>
          <p className="text-kenya-dark/60 text-sm">
            识别了 {data.expression_strategies?.length || 0} 个表达策略和 {data.signature_phrases?.length || 0} 个标志性短语
          </p>
        </div>

        {data.signature_phrases && data.signature_phrases.length > 0 && (
          <div className="p-6 bg-white border border-kenya-line rounded-lg">
            <h4 className="text-lg font-medium mb-4">标志性短语</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.signature_phrases.map((phrase, idx) => (
                <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line rounded">
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

        {data.expression_strategies && data.expression_strategies.map((strategy, idx) => (
          <div key={idx} className="p-6 bg-white border border-kenya-line rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm bg-kenya-dark text-kenya-cream border border-kenya-dark rounded">
                {strategy.id}
              </span>
              <h4 className="text-lg font-medium">{strategy.name}</h4>
              <span className={`ml-auto px-2 py-1 text-xs rounded ${
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
      </div>
    );
  };

  const renderLayer4Content = () => {
    const data = taskData.layer4_result || taskData.cognitive_profile;
    if (!data) {
      return (
        <EmptyState
          icon="📄"
          message="第四层暂无结果"
          actions={[
            <SecondaryButton key="layer1" onClick={() => setSearchParams({ layer: '1' })}>
              查看第一层
            </SecondaryButton>,
            <SecondaryButton key="home" onClick={() => navigate('/')}>
              返回首页
            </SecondaryButton>
          ]}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">认知操作系统</h3>
          <p className="text-kenya-dark/60 text-sm">
            可直接注入 AI 的认知规则集
          </p>
        </div>

        {data.identity && (
          <div className="p-6 bg-white border border-kenya-line rounded-lg">
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

        {data.core_assumptions && data.core_assumptions.length > 0 && (
          <div className="p-6 bg-white border border-kenya-line rounded-lg">
            <h4 className="text-lg font-medium mb-4">核心假设（{data.core_assumptions.length} 条）</h4>
            <div className="space-y-4">
              {data.core_assumptions.map((assumption, idx) => (
                <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line rounded">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 text-xs bg-kenya-dark text-kenya-cream border border-kenya-dark rounded">
                      {assumption.id}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
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

        {data.reasoning_engine && (
          <div className="p-6 bg-white border border-kenya-line rounded-lg">
            <h4 className="text-lg font-medium mb-4">推理引擎</h4>
            {data.reasoning_engine.description && (
              <div className="mb-4">
                <span className="text-sm font-medium text-kenya-dark/70">整体风格：</span>
                <span className="text-sm text-kenya-dark/90">{data.reasoning_engine.description}</span>
              </div>
            )}
            {data.reasoning_engine.patterns && Array.isArray(data.reasoning_engine.patterns) && data.reasoning_engine.patterns.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-kenya-dark/70">推理模式：</div>
                {data.reasoning_engine.patterns.map((pattern, idx) => (
                  <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line rounded">
                    <div className="flex items-center gap-3 mb-2">
                      {pattern.id && (
                        <span className="px-2 py-1 text-xs bg-kenya-dark text-kenya-cream rounded">
                          {pattern.id}
                        </span>
                      )}
                      {pattern.name && (
                        <span className="font-medium text-base">{pattern.name}</span>
                      )}
                    </div>
                    {pattern.trigger && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-kenya-dark/70">触发条件：</span>
                        <span className="text-sm text-kenya-dark/90">{pattern.trigger}</span>
                      </div>
                    )}
                    {pattern.steps && Array.isArray(pattern.steps) && pattern.steps.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-kenya-dark/70 mb-1">推理步骤：</div>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-kenya-dark/90">
                          {pattern.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {data.expression_engine && (
          <div className="p-6 bg-white border border-kenya-line rounded-lg">
            <h4 className="text-lg font-medium mb-4">表达引擎</h4>
            {data.expression_engine.description && (
              <div className="mb-4">
                <span className="text-sm font-medium text-kenya-dark/70">整体风格：</span>
                <span className="text-sm text-kenya-dark/90">{data.expression_engine.description}</span>
              </div>
            )}
            
            {data.expression_engine.strategies && Array.isArray(data.expression_engine.strategies) && data.expression_engine.strategies.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-kenya-dark/70 mb-3">表达策略：</div>
                <div className="space-y-3">
                  {data.expression_engine.strategies.map((strategy, idx) => (
                    <div key={idx} className="p-4 bg-kenya-dark/5 border-l-4 border-kenya-line rounded">
                      <div className="flex items-center gap-3 mb-2">
                        {strategy.id && (
                          <span className="px-2 py-1 text-xs bg-kenya-dark text-kenya-cream rounded">
                            {strategy.id}
                          </span>
                        )}
                        {strategy.name && (
                          <span className="font-medium text-base">{strategy.name}</span>
                        )}
                      </div>
                      {strategy.how && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-kenya-dark/70">如何使用：</span>
                          <span className="text-sm text-kenya-dark/90">{strategy.how}</span>
                        </div>
                      )}
                      {strategy.when_to_use && (
                        <div>
                          <span className="text-sm font-medium text-kenya-dark/70">使用时机：</span>
                          <span className="text-sm text-kenya-dark/90">{strategy.when_to_use}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.expression_engine.silence_rules && Array.isArray(data.expression_engine.silence_rules) && data.expression_engine.silence_rules.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-kenya-dark/70 mb-3">沉默策略：</div>
                <div className="space-y-2">
                  {data.expression_engine.silence_rules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-kenya-dark/5 rounded">
                      {rule.avoid && (
                        <div className="mb-1">
                          <span className="text-sm font-medium text-kenya-dark/70">避免：</span>
                          <span className="text-sm text-kenya-dark/90">{rule.avoid}</span>
                        </div>
                      )}
                      {rule.reason && (
                        <div>
                          <span className="text-sm font-medium text-kenya-dark/70">原因：</span>
                          <span className="text-sm text-kenya-dark/90">{rule.reason}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.expression_engine.signature_phrases && Array.isArray(data.expression_engine.signature_phrases) && data.expression_engine.signature_phrases.length > 0 && (
              <div>
                <div className="text-sm font-medium text-kenya-dark/70 mb-3">标志性表达：</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.expression_engine.signature_phrases.map((phrase, idx) => (
                    <div key={idx} className="p-3 bg-kenya-dark/5 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        {phrase.phrase && (
                          <span className="font-medium text-kenya-dark">{phrase.phrase}</span>
                        )}
                      </div>
                      {phrase.use_when && (
                        <div className="text-sm text-kenya-dark/70">{phrase.use_when}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {data.usage_instructions && (
          <div className="p-6 bg-white border border-kenya-line rounded-lg">
            <h4 className="text-lg font-medium mb-4">使用说明</h4>
            {typeof data.usage_instructions === 'string' ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-kenya-dark/90 whitespace-pre-wrap">{data.usage_instructions}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.usage_instructions.for_new_question && (
                  <div>
                    <div className="text-sm font-medium text-kenya-dark mb-2">新问题处理：</div>
                    <p className="text-sm text-kenya-dark/90 whitespace-pre-wrap">{data.usage_instructions.for_new_question}</p>
                  </div>
                )}
                {data.usage_instructions.for_expression_task && (
                  <div>
                    <div className="text-sm font-medium text-kenya-dark mb-2">表达任务：</div>
                    <p className="text-sm text-kenya-dark/90 whitespace-pre-wrap">{data.usage_instructions.for_expression_task}</p>
                  </div>
                )}
                {data.usage_instructions.for_opinion_judgment && (
                  <div>
                    <div className="text-sm font-medium text-kenya-dark mb-2">观点判断：</div>
                    <p className="text-sm text-kenya-dark/90 whitespace-pre-wrap">{data.usage_instructions.for_opinion_judgment}</p>
                  </div>
                )}
                {data.usage_instructions.default && (
                  <div>
                    <div className="text-sm font-medium text-kenya-dark mb-2">默认处理：</div>
                    <p className="text-sm text-kenya-dark/90 whitespace-pre-wrap">{data.usage_instructions.default}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQualityReport = () => {
    if (!taskData.quality_report) {
      return (
        <EmptyState
          icon="📊"
          message="质量报告尚未生成"
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-6 bg-white border border-kenya-line rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">质量评分</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-kenya-dark/60 mb-2">整体质量</div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-serif">{taskData.quality_report.overall_score || 0}</span>
                <span className="text-kenya-dark/60">/100</span>
              </div>
              <div className="mt-2 h-2 bg-kenya-line/20 overflow-hidden rounded-full">
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
              <div className="mt-2 h-2 bg-kenya-line/20 overflow-hidden rounded-full">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${taskData.quality_report.confidence_score || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-kenya-line rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Bad Case 检测</h3>
          {!taskData.quality_report.bad_cases || taskData.quality_report.bad_cases.length === 0 ? (
            <p className="text-kenya-dark/60">✓ 未检测到质量问题</p>
          ) : (
            <ul className="space-y-3">
              {taskData.quality_report.bad_cases.map((item, idx) => (
                <li key={idx} className={`p-4 border-l-4 rounded ${
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kenya-brown">
        <AppHeader />
        <PageContainer>
          <LoadingState message="加载结果..." />
        </PageContainer>
      </div>
    );
  }

  if (error && !taskData) {
    return (
      <div className="min-h-screen bg-kenya-brown">
        <AppHeader />
        <PageContainer>
          <ErrorState
            title="加载失败"
            message={error}
            actions={[
              <SecondaryButton key="home" onClick={() => navigate('/')}>
                返回首页
              </SecondaryButton>
            ]}
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kenya-brown">
      <AppHeader breadcrumb={taskData.name} />

      {/* Hero 区 */}
      <div className="bg-kenya-cream py-10">
        <PageContainer>
          <PageTitle
            title={taskData.name}
            subtitle="蒸馏结果"
          />
        </PageContainer>
      </div>

      {/* 错误提示 */}
      {(error || (taskData.status === 'failed' || taskData.status === 'stopped') && taskData.error_message) && (
        <PageContainer>
          <div className="mb-6">
            <ErrorState
              title={taskData.status === 'failed' ? '任务失败' : taskData.status === 'stopped' ? '任务已停止' : '错误'}
              message={error || taskData.error_message}
            />
          </div>
        </PageContainer>
      )}

      {/* 结果区 */}
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <ResultCard>
            {/* 层级切换 */}
            <LayerTabs
              layers={[1, 2, 3, 4]}
              active={layer}
              onChange={(newLayer) => setSearchParams({ layer: newLayer.toString() })}
            />

            {/* 内容类型切换 + 导出按钮 */}
            <div className="flex items-center justify-between mt-6 mb-6">
              <SegmentedControl
                options={[
                  { value: 'content', label: '📄 蒸馏内容' },
                  { value: 'quality', label: '📊 质量报告' }
                ]}
                active={activeTab}
                onChange={setActiveTab}
              />

              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('json')} 
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border-[0.5px] border-kenya-line rounded-md hover:bg-kenya-cream transition-colors disabled:opacity-50"
                >
                  <span>↓</span>
                  <span>{exporting ? '导出中...' : 'JSON'}</span>
                </button>
                <button 
                  onClick={() => handleExport('markdown')} 
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border-[0.5px] border-kenya-line rounded-md hover:bg-kenya-cream transition-colors disabled:opacity-50"
                >
                  <span>↓</span>
                  <span>{exporting ? '导出中...' : 'Markdown'}</span>
                </button>
                <button 
                  onClick={() => handleExport('txt')} 
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border-[0.5px] border-kenya-line rounded-md hover:bg-kenya-cream transition-colors disabled:opacity-50"
                >
                  <span>↓</span>
                  <span>{exporting ? '导出中...' : 'TXT'}</span>
                </button>
              </div>
            </div>

          {/* 内容展示 */}
          {activeTab === 'content' && (
            <div>
              {layer === 1 && renderLayer1Content()}
              {layer === 2 && renderLayer2Content()}
              {layer === 3 && renderLayer3Content()}
              {layer === 4 && renderLayer4Content()}
            </div>
          )}

          {activeTab === 'quality' && renderQualityReport()}

          {/* 底部操作 */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-kenya-line">
            <TertiaryButton onClick={() => navigate('/')}>
              返回首页
            </TertiaryButton>
          </div>
        </ResultCard>
        </div>
      </PageContainer>
    </div>
  );
}
