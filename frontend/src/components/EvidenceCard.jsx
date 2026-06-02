import { useState } from 'react';

/**
 * 证据回链卡片组件
 * 显示底层假设、推理规则、表达策略的证据来源
 */
export default function EvidenceCard({ evidence }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 如果没有证据，不渲染
  if (!evidence || evidence.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // 证据类型对应的颜色
  const getRoleColor = (role) => {
    if (!role) return { bg: 'rgba(100,100,100,0.1)', border: 'rgba(100,100,100,0.4)', text: '#555' };
    
    if (role.includes('直接表达')) {
      return { bg: 'rgba(46,160,67,0.1)', border: 'rgba(46,160,67,0.4)', text: '#2e6b3d' };
    } else if (role.includes('前提依赖')) {
      return { bg: 'rgba(70,130,200,0.1)', border: 'rgba(70,130,200,0.4)', text: '#1a3f6f' };
    } else if (role.includes('行为印证')) {
      return { bg: 'rgba(224,122,48,0.1)', border: 'rgba(224,122,48,0.4)', text: '#7a4a10' };
    }
    return { bg: 'rgba(100,100,100,0.1)', border: 'rgba(100,100,100,0.4)', text: '#555' };
  };

  return (
    <div style={{ 
      marginTop: '16px', 
      borderTop: '1px solid var(--border-light)', 
      paddingTop: '16px' 
    }}>
      {/* 折叠/展开按钮 */}
      <button
        onClick={toggleExpanded}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.1em',
          padding: '6px 12px',
          background: isExpanded ? 'var(--bg-dark)' : 'transparent',
          color: isExpanded ? '#fff' : 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
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
        <span>{isExpanded ? '▲' : '▼'}</span>
        <span>
          {isExpanded ? '收起证据' : `查看 ${evidence.length} 条证据`}
        </span>
      </button>

      {/* 展开时显示证据列表 */}
      {isExpanded && (
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px' 
        }}>
          {evidence.map((item, idx) => {
            const roleColor = getRoleColor(item.role);
            
            return (
              <div 
                key={idx} 
                style={{ 
                  background: 'var(--bg-card)',
                  border: `1px solid ${roleColor.border}`,
                  borderLeft: `3px solid ${roleColor.border}`,
                  padding: '12px 16px',
                  position: 'relative'
                }}
              >
                {/* 证据来源（段落索引） */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px' 
                }}>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '9px',
                    padding: '2px 6px',
                    background: 'var(--bg-dark)',
                    color: '#fff',
                    letterSpacing: '0.1em'
                  }}>
                    {item.source || `证据 ${idx + 1}`}
                  </span>
                  
                  {/* 证据类型标签 */}
                  {item.role && (
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '9px',
                      padding: '2px 6px',
                      background: roleColor.bg,
                      color: roleColor.text,
                      border: `1px solid ${roleColor.border}`,
                      letterSpacing: '0.1em'
                    }}>
                      {item.role}
                    </span>
                  )}
                </div>

                {/* 原文引用 */}
                {item.quote && (
                  <p style={{ 
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px', 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    margin: 0,
                    fontStyle: 'italic'
                  }}>
                    "{item.quote}"
                  </p>
                )}

                {/* 附加说明（如果有 annotation 字段） */}
                {item.annotation && (
                  <p style={{ 
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px', 
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    💡 {item.annotation}
                  </p>
                )}

                {/* Layer 3 特有：how_it_fits 字段（validation_cases） */}
                {item.how_it_fits && (
                  <p style={{ 
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px', 
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    💡 {item.how_it_fits}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
