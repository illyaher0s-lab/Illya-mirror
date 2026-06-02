import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import EvidenceCard from '../components/EvidenceCard';
import QualityReportCard from '../components/QualityReportCard';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const layer = parseInt(searchParams.get('layer') || '4');

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

      const extension = format === 'json' ? 'json' : format === 'yaml' ? 'yaml' : format === 'txt' ? 'txt' : 'md';
      a.download = `${taskData.name}_${format}.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`导出成功：${taskData.name}.${extension}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const renderLayer1 = (data) => {
    if (!data || !data.paragraph_index || data.paragraph_index.length === 0) {
      return <div className="empty-state"><div className="empty-state-text">暂无数据</div></div>;
    }

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            段落索引
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            识别了 {data.paragraph_index.length} 个段落
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.paragraph_index.map((item, idx) => {
            const typeMap = { '判断型': 'judge', '推理型': 'infer', '叙述型': 'narrate' };
            const typeClass = typeMap[item.type] || 'judge';

            return (
              <div key={idx} className="seg-item">
                <div className={`seg-stripe ${typeClass}`} />
                <div className="seg-num">#{String(idx + 1).padStart(2, '0')}</div>
                <div className="seg-body">
                  <span className={`seg-badge ${typeClass}`}>
                    {item.type === '判断型' ? 'JUDGE · 判断型' : 
                     item.type === '推理型' ? 'INFER · 推理型' : 
                     'NARRATE · 叙述型'}
                  </span>
                  <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '15px' }}>{item.title}</div>
                  {item.full_text && <p className="seg-text">{item.full_text}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLayer2 = (data) => {
    if (!data || !data.reasoning_patterns || data.reasoning_patterns.length === 0) {
      return <div className="empty-state"><div className="empty-state-text">暂无数据</div></div>;
    }

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            推理模式
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            识别了 {data.reasoning_patterns.length} 个推理模式
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.reasoning_patterns.map((pattern, idx) => (
            <div key={idx} style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-light)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '10px', 
                  padding: '4px 10px',
                  background: 'var(--bg-dark)',
                  color: '#fff',
                  letterSpacing: '0.08em'
                }}>
                  {pattern.id}
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{pattern.name}</h4>
                {pattern.confidence && (
                  <span style={{ 
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    padding: '3px 8px',
                    border: '1px solid',
                    color: pattern.confidence === '高' ? '#7a4a10' : '#1a3f6f',
                    background: pattern.confidence === '高' ? 'rgba(224,122,48,0.1)' : 'rgba(70,130,200,0.1)',
                    borderColor: pattern.confidence === '高' ? 'rgba(224,122,48,0.4)' : 'rgba(70,130,200,0.4)',
                    letterSpacing: '0.1em'
                  }}>
                    {pattern.confidence}
                  </span>
                )}
              </div>

              {pattern.trigger && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>触发条件：</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{pattern.trigger}</span>
                </div>
              )}

              {pattern.steps && pattern.steps.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    推理步骤：
                  </div>
                  <ol style={{ 
                    paddingLeft: '20px', 
                    fontSize: '13px', 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7
                  }}>
                    {pattern.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              )}

              {pattern.underlying_assumptions && pattern.underlying_assumptions.length > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  依赖假设：{pattern.underlying_assumptions.join(', ')}
                </div>
              )}

              {/* 证据回链 */}
              <EvidenceCard evidence={pattern.evidence} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLayer3 = (data) => {
    if (!data || (!data.expression_strategies && !data.signature_phrases)) {
      return <div className="empty-state"><div className="empty-state-text">暂无数据</div></div>;
    }

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            表达策略
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            识别了 {data.expression_strategies?.length || 0} 个表达策略和 {data.signature_phrases?.length || 0} 个标志性短语
          </p>
        </div>

        {data.signature_phrases && data.signature_phrases.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '16px', 
              fontWeight: 600, 
              marginBottom: '12px',
              color: 'var(--text-primary)'
            }}>
              标志性短语
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
              {data.signature_phrases.map((phrase, idx) => (
                <div key={idx} style={{ 
                  position: 'relative',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  padding: '16px'
                }}>
                  <div style={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}>
                    {phrase.phrase}
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7
                  }}>
                    {phrase.cognitive_role}
                  </div>
                  <span style={{ 
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '9px', 
                    color: 'var(--text-muted)'
                  }}>
                    {phrase.frequency}次
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.expression_strategies && data.expression_strategies.map((strategy, idx) => (
          <div key={idx} style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-light)',
            padding: '20px 24px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '9px', 
                padding: '3px 8px',
                background: 'var(--bg-dark)',
                color: '#fff',
                letterSpacing: '0.1em'
              }}>
                {strategy.id}
              </span>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '18px', 
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                {strategy.name}
              </h4>
            </div>

            {strategy.observable_form && (
              <div style={{ 
                borderTop: idx === 0 ? 'none' : '1px solid var(--border-light)',
                paddingTop: idx === 0 ? 0 : '12px',
                marginTop: idx === 0 ? 0 : '12px',
                marginBottom: '12px' 
              }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)',
                  letterSpacing: '0.1em'
                }}>
                  可观察形式：
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  marginLeft: '8px'
                }}>
                  {strategy.observable_form}
                </span>
              </div>
            )}

            {strategy.cognitive_function && (
              <div style={{ 
                borderTop: '1px solid var(--border-light)',
                paddingTop: '12px',
                marginTop: '12px'
              }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)',
                  letterSpacing: '0.1em'
                }}>
                  认知功能：
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  marginLeft: '8px'
                }}>
                  {strategy.cognitive_function}
                </span>
              </div>
            )}

            {/* 证据回链 */}
            <EvidenceCard evidence={strategy.evidence} />
          </div>
        ))}
      </div>
    );
  };

  const renderLayer4 = (data) => {
    if (!data) {
      return <div className="empty-state"><div className="empty-state-text">暂无数据</div></div>;
    }

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            认知操作系统
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            可直接注入 AI 的认知规则集
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.identity && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-light)', 
              padding: '20px 24px'
            }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                marginBottom: '16px' 
              }}>
                身份信息
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.identity.subject && (
                  <div>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em'
                    }}>
                      模拟对象：
                    </span>
                    <span style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      marginLeft: '8px'
                    }}>
                      {data.identity.subject}
                    </span>
                  </div>
                )}
                {data.identity.simulation_scope && (
                  <div>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em'
                    }}>
                      覆盖范围：
                    </span>
                    <span style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      marginLeft: '8px'
                    }}>
                      {data.identity.simulation_scope}
                    </span>
                  </div>
                )}
                {data.identity.known_blind_spots && data.identity.known_blind_spots.length > 0 && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px',
                    marginTop: '12px'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em',
                      marginBottom: '8px'
                    }}>
                      已知盲点：
                    </div>
                    <ul style={{ 
                      paddingLeft: '20px',
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7
                    }}>
                      {data.identity.known_blind_spots.map((spot, i) => (
                        <li key={i}>{spot}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.identity.known_failure_modes && data.identity.known_failure_modes.length > 0 && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px',
                    marginTop: '12px'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em',
                      marginBottom: '8px'
                    }}>
                      已知失效模式：
                    </div>
                    <ul style={{ 
                      paddingLeft: '20px',
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7
                    }}>
                      {data.identity.known_failure_modes.map((mode, i) => (
                        <li key={i}>{mode}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {data.core_assumptions && data.core_assumptions.length > 0 && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-light)', 
              padding: '20px 24px'
            }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                marginBottom: '16px' 
              }}>
                核心假设 ({data.core_assumptions.length} 条)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {data.core_assumptions.map((assumption, idx) => (
                  <div key={idx} style={{ 
                    borderTop: idx === 0 ? 'none' : '1px solid var(--border-light)',
                    paddingTop: idx === 0 ? 0 : '12px',
                    marginTop: idx === 0 ? 0 : '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '9px', 
                        padding: '3px 8px',
                        background: 'var(--bg-dark)',
                        color: '#fff',
                        letterSpacing: '0.1em'
                      }}>
                        {assumption.id}
                      </span>
                      {assumption.confidence && (
                        <span style={{ 
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          padding: '2px 6px',
                          border: '1px solid',
                          color: assumption.confidence === '高' ? '#7a4a10' : '#1a3f6f',
                          background: assumption.confidence === '高' ? 'rgba(224,122,48,0.1)' : 'rgba(70,130,200,0.1)',
                          borderColor: assumption.confidence === '高' ? 'rgba(224,122,48,0.4)' : 'rgba(70,130,200,0.4)',
                          letterSpacing: '0.1em'
                        }}>
                          {assumption.confidence}
                        </span>
                      )}
                    </div>
                    <p style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7
                    }}>
                      {assumption.statement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.reasoning_engine && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-light)', 
              padding: '20px 24px'
            }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                marginBottom: '16px' 
              }}>
                推理引擎
              </h4>
              {data.reasoning_engine.description && (
                <p style={{ 
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.7,
                  marginBottom: '12px' 
                }}>
                  {data.reasoning_engine.description}
                </p>
              )}
              {data.reasoning_engine.patterns && data.reasoning_engine.patterns.length > 0 && (
                <div>
                  <div style={{ 
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px', 
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    包含 {data.reasoning_engine.patterns.length} 个推理模式
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {data.reasoning_engine.patterns.map((pattern, idx) => (
                      <div key={idx} style={{ 
                        borderTop: idx === 0 ? 'none' : '1px solid var(--border-light)',
                        paddingTop: idx === 0 ? 0 : '12px',
                        marginTop: idx === 0 ? 0 : '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '9px', 
                            padding: '3px 8px',
                            background: 'var(--bg-dark)',
                            color: '#fff',
                            letterSpacing: '0.1em'
                          }}>
                            {pattern.id}
                          </span>
                          <span style={{ 
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                          }}>
                            {pattern.name}
                          </span>
                        </div>
                        {pattern.trigger && (
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ 
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              letterSpacing: '0.1em'
                            }}>
                              触发条件：
                            </span>
                            <span style={{ 
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              marginLeft: '8px'
                            }}>
                              {pattern.trigger}
                            </span>
                          </div>
                        )}
                        {pattern.steps && pattern.steps.length > 0 && (
                          <div>
                            <div style={{ 
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              letterSpacing: '0.1em',
                              marginBottom: '6px'
                            }}>
                              推理步骤：
                            </div>
                            <ol style={{ 
                              paddingLeft: '20px',
                              margin: 0,
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.7
                            }}>
                              {pattern.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {data.expression_engine && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-light)', 
              padding: '20px 24px'
            }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                marginBottom: '16px' 
              }}>
                表达引擎
              </h4>
              {data.expression_engine.description && (
                <p style={{ 
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.7,
                  marginBottom: '12px' 
                }}>
                  {data.expression_engine.description}
                </p>
              )}
              {data.expression_engine.strategies && data.expression_engine.strategies.length > 0 && (
                <div>
                  <div style={{ 
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px', 
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    包含 {data.expression_engine.strategies.length} 个表达策略
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {data.expression_engine.strategies.map((strategy, idx) => (
                      <div key={idx} style={{ 
                        borderTop: idx === 0 ? 'none' : '1px solid var(--border-light)',
                        paddingTop: idx === 0 ? 0 : '12px',
                        marginTop: idx === 0 ? 0 : '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '9px', 
                            padding: '3px 8px',
                            background: 'var(--bg-dark)',
                            color: '#fff',
                            letterSpacing: '0.1em'
                          }}>
                            {strategy.id}
                          </span>
                          <span style={{ 
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                          }}>
                            {strategy.name}
                          </span>
                        </div>
                        {strategy.how && (
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ 
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              letterSpacing: '0.1em'
                            }}>
                              如何使用：
                            </span>
                            <span style={{ 
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              marginLeft: '8px'
                            }}>
                              {strategy.how}
                            </span>
                          </div>
                        )}
                        {strategy.when_to_use && (
                          <div>
                            <span style={{ 
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              letterSpacing: '0.1em'
                            }}>
                              使用时机：
                            </span>
                            <span style={{ 
                              fontFamily: 'var(--font-sans)',
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              marginLeft: '8px'
                            }}>
                              {strategy.when_to_use}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {data.usage_instructions && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-light)', 
              padding: '20px 24px'
            }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                marginBottom: '16px' 
              }}>
                使用说明
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.usage_instructions.for_new_question && (
                  <div>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em',
                      marginBottom: '6px'
                    }}>
                      处理新问题：
                    </div>
                    <pre style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {data.usage_instructions.for_new_question}
                    </pre>
                  </div>
                )}
                {data.usage_instructions.for_opinion_judgment && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em',
                      marginBottom: '6px'
                    }}>
                      判断观点：
                    </div>
                    <pre style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {data.usage_instructions.for_opinion_judgment}
                    </pre>
                  </div>
                )}
                {data.usage_instructions.for_expression_task && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.1em',
                      marginBottom: '6px'
                    }}>
                      生成表达：
                    </div>
                    <pre style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {data.usage_instructions.for_expression_task}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLayerContent = () => {
    if (!taskData) return null;

    const layerData = {
      1: taskData.layer1_result,
      2: taskData.layer2_result,
      3: taskData.layer3_result,
      4: taskData.layer4_result || taskData.cognitive_profile
    };

    const data = layerData[layer];
    
    if (!data) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">□</div>
          <div className="empty-state-text">LAYER {layer} DATA NOT AVAILABLE</div>
        </div>
      );
    }

    switch(layer) {
      case 1: return renderLayer1(data);
      case 2: return renderLayer2(data);
      case 3: return renderLayer3(data);
      case 4: return renderLayer4(data);
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="page-frame paper">
        <nav className="nav">
          <div className="nav-breadcrumb">
            <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>← MIRROR</span>
          </div>
        </nav>
        <div className="loading-state">
          <div className="loading-state-icon">∞</div>
          <div className="loading-state-text">LOADING RESULT...</div>
        </div>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="page-frame paper">
        <nav className="nav">
          <div className="nav-breadcrumb">
            <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>← MIRROR</span>
          </div>
        </nav>
        <div className="error-state">
          <div className="error-state-icon">✕</div>
          <div className="error-state-text">{error || 'TASK NOT FOUND'}</div>
          <button className="btn-outline" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            ← BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-frame paper">
      <nav className="nav">
        <div className="nav-breadcrumb">
          <span className="nav-breadcrumb-link" onClick={() => navigate('/')}>← MIRROR</span>
          <span className="nav-breadcrumb-sep">/</span>
          <span className="nav-breadcrumb-cur">{taskData.name}</span>
        </div>
        <div className="nav-version">SYS_v2.4</div>
      </nav>

      <div style={{ 
        padding: '20px 28px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map(l => (
            <button
              key={l}
              className={`layer-chip ${layer === l ? 'active' : ''}`}
              onClick={() => setSearchParams({ layer: String(l) })}
            >
              L{l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-export" onClick={() => handleExport('json')} disabled={exporting}>
            ↓ JSON
          </button>
          <button className="btn-export" onClick={() => handleExport('markdown')} disabled={exporting}>
            ↓ MD
          </button>
          <button className="btn-export" onClick={() => handleExport('txt')} disabled={exporting}>
            ↓ TXT
          </button>
        </div>
      </div>

      <div className="content-area">
        {/* 质量评分报告 - 只在有数据时显示 */}
        <QualityReportCard qualityReport={taskData.quality_report} />

        {renderLayerContent()}
      </div>
    </div>
  );
}
