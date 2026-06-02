import { useState } from 'react';

/**
 * 质量评分报告卡片
 * 显示整体评分、评级、得分明细、覆盖度分析、Bad Cases、迭代建议
 */
export default function QualityReportCard({ qualityReport }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 如果没有质量报告，不渲染
  if (!qualityReport) {
    return null;
  }

  const {
    overall_score = 0,
    rating = '待评估',
    coverage_analysis = {},
    confidence_analysis = {},
    bad_cases = [],
    iteration_suggestions = []
  } = qualityReport;

  const breakdown = confidence_analysis?.breakdown || {};

  // 评级对应的颜色
  const getRatingColor = (rating) => {
    if (rating === '优秀') {
      return { bg: 'rgba(46,160,67,0.1)', border: 'rgba(46,160,67,0.4)', text: '#2e6b3d' };
    } else if (rating === '良好') {
      return { bg: 'rgba(70,130,200,0.1)', border: 'rgba(70,130,200,0.4)', text: '#1a3f6f' };
    } else {
      return { bg: 'rgba(224,122,48,0.1)', border: 'rgba(224,122,48,0.4)', text: '#7a4a10' };
    }
  };

  const ratingColor = getRatingColor(rating);

  // 分数对应的颜色
  const getScoreColor = (score) => {
    if (score >= 80) return '#2e6b3d';
    if (score >= 60) return '#1a3f6f';
    return '#7a4a10';
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      border: '1px solid var(--border-light)',
      padding: '24px',
      marginBottom: '24px'
    }}>
      {/* 标题 */}
      <h3 style={{ 
        fontFamily: 'var(--font-sans)', 
        fontSize: '18px', 
        fontWeight: 700, 
        marginBottom: '20px',
        color: 'var(--text-primary)'
      }}>
        ⚡ 质量评分报告
      </h3>

      {/* 评分与评级 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        {/* 分数 */}
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '36px', 
          fontWeight: 700,
          color: getScoreColor(overall_score)
        }}>
          {overall_score.toFixed(1)}
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}> / 100</span>
        </div>

        {/* 评级标签 */}
        <span style={{ 
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          padding: '6px 12px',
          background: ratingColor.bg,
          color: ratingColor.text,
          border: `1px solid ${ratingColor.border}`,
          letterSpacing: '0.1em',
          fontWeight: 600
        }}>
          {rating}
        </span>
      </div>

      {/* 得分明细 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        marginBottom: '16px' 
      }}>
        {/* 覆盖度 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            width: '70px',
            letterSpacing: '0.05em'
          }}>
            覆盖度
          </span>
          <div style={{ 
            flex: 1, 
            height: '8px', 
            background: 'var(--bg-dark)', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${(breakdown.coverage || 0) / 40 * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #4682c8 0%, #2e6b3d 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            width: '60px',
            textAlign: 'right'
          }}>
            {(breakdown.coverage || 0).toFixed(1)}/40
          </span>
        </div>

        {/* 置信度 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            width: '70px',
            letterSpacing: '0.05em'
          }}>
            置信度
          </span>
          <div style={{ 
            flex: 1, 
            height: '8px', 
            background: 'var(--bg-dark)', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${(breakdown.confidence || 0) / 30 * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #4682c8 0%, #2e6b3d 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            width: '60px',
            textAlign: 'right'
          }}>
            {(breakdown.confidence || 0).toFixed(1)}/30
          </span>
        </div>

        {/* Bad Case 扣分 */}
        {breakdown.bad_case_penalty > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '11px', 
              color: '#d32f2f',
              width: '70px',
              letterSpacing: '0.05em'
            }}>
              Bad Case
            </span>
            <div style={{ 
              flex: 1, 
              fontFamily: 'var(--font-sans)',
              fontSize: '12px', 
              color: '#d32f2f'
            }}>
              -{breakdown.bad_case_penalty} 分 ({bad_cases.length} 处矛盾)
            </div>
          </div>
        )}

        {/* 数据量 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            width: '70px',
            letterSpacing: '0.05em'
          }}>
            数据量
          </span>
          <div style={{ 
            flex: 1, 
            height: '8px', 
            background: 'var(--bg-dark)', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${(breakdown.data_volume || 0) / 30 * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #4682c8 0%, #2e6b3d 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            width: '60px',
            textAlign: 'right'
          }}>
            {(breakdown.data_volume || 0).toFixed(1)}/30
          </span>
        </div>
      </div>

      {/* 展开/折叠按钮 */}
      <button
        onClick={toggleExpanded}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.1em',
          padding: '8px 16px',
          background: isExpanded ? 'var(--bg-dark)' : 'transparent',
          color: isExpanded ? '#fff' : 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'var(--bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {isExpanded ? '▲ 收起详细分析' : '▼ 查看详细分析'}
      </button>

      {/* 详细分析区域 */}
      {isExpanded && (
        <div style={{ 
          marginTop: '20px', 
          borderTop: '1px solid var(--border-light)', 
          paddingTop: '20px' 
        }}>
          {/* 覆盖度分析 */}
          {coverage_analysis && Object.keys(coverage_analysis).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>
                📊 覆盖度分析
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(coverage_analysis).map(([key, value]) => (
                  <div key={key} style={{ 
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ 
                      color: value.sufficient ? '#2e6b3d' : '#7a4a10',
                      fontSize: '14px'
                    }}>
                      {value.sufficient ? '✓' : '⚠'}
                    </span>
                    <span style={{ flex: 1 }}>
                      {key === 'cognitive_layer' ? '认知层' : 
                       key === 'expression_layer' ? '表达层' : 
                       key === 'interaction_layer' ? '互动层' : key}
                      ：{value.count} / {value.threshold}
                      {!value.sufficient && value.missing?.length > 0 && ` (${value.missing.join(', ')})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bad Cases */}
          {bad_cases && bad_cases.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: '#d32f2f'
              }}>
                ⚠️ 矛盾检测 ({bad_cases.length} 处)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bad_cases.map((badCase, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(211,47,47,0.05)',
                    border: '1px solid rgba(211,47,47,0.3)',
                    borderLeft: '3px solid #d32f2f',
                    padding: '12px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: 'rgba(211,47,47,0.2)',
                        color: '#d32f2f',
                        marginRight: '8px'
                      }}>
                        {badCase.type}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {badCase.item1_id} ↔ {badCase.item2_id}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: 1.6 }}>
                      {badCase.contradiction_reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 迭代建议 */}
          {iteration_suggestions && iteration_suggestions.length > 0 && (
            <div>
              <h4 style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>
                💡 迭代建议
              </h4>
              <ul style={{ 
                paddingLeft: '20px', 
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.7
              }}>
                {iteration_suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
