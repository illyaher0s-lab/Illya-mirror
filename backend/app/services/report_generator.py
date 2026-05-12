"""
质量报告生成器
生成Markdown格式的质量报告
"""

from typing import Dict, List, Any
from datetime import datetime


class ReportGenerator:
    def generate_markdown_report(
        self,
        distillation_name: str,
        layer1: Dict,
        layer2: Dict,
        layer3: Dict,
        overall_score: Dict,
        coverage: Dict,
        bad_cases: List,
        suggestions: List[str]
    ) -> str:
        """
        生成Markdown格式的质量报告
        """
        report = f"""# Mirror 认知数据质量报告

**任务名称：** {distillation_name}  
**生成时间：** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

## 📊 整体评分

**得分：** {overall_score['score']}/100  
**评级：** {overall_score['rating']}

### 得分构成
- 覆盖度：{overall_score['breakdown']['coverage']} 分
- 置信度：{overall_score['breakdown']['confidence']} 分
- 数据量：{overall_score['breakdown']['data_volume']} 分
- Bad Case扣分：-{overall_score['breakdown']['bad_case_penalty']} 分

---

## 🎯 覆盖度分析

### 认知层（底层假设）
- **状态：** {'✅ 充足' if coverage['cognitive_layer']['sufficient'] else '⚠️ 不足'}
- **提取数量：** {coverage['cognitive_layer']['count']} 条
- **阈值：** {coverage['cognitive_layer']['threshold']} 条
{self._format_missing(coverage['cognitive_layer']['missing'])}

### 表达层（推理规则）
- **状态：** {'✅ 充足' if coverage['expression_layer']['sufficient'] else '⚠️ 不足'}
- **提取数量：** {coverage['expression_layer']['count']} 条
- **阈值：** {coverage['expression_layer']['threshold']} 条
{self._format_missing(coverage['expression_layer']['missing'])}

### 互动层（表达策略）
- **状态：** {'✅ 充足' if coverage['interaction_layer']['sufficient'] else '⚠️ 不足'}
- **提取数量：** {coverage['interaction_layer']['count']} 条
- **阈值：** {coverage['interaction_layer']['threshold']} 条
{self._format_missing(coverage['interaction_layer']['missing'])}

---

## 🔍 置信度分析

{self._generate_confidence_section(layer1, layer2, layer3)}

---

## ⚠️ Bad Case 检测

{self._generate_bad_case_section(bad_cases)}

---

## 💡 迭代建议

{self._format_suggestions(suggestions)}

---

## 📈 数据统计

- **底层假设：** {len(layer1.get('fundamental_assumptions', []))} 条
- **推理规则：** {len(layer2.get('reasoning_patterns', []))} 条
- **表达策略：** {len(layer3.get('expression_strategies', []))} 条
- **沉默策略：** {len(layer3.get('silence_strategies', []))} 条
- **系统整合：** {'✅ 已完成' if layer3.get('system_integration') else '❌ 未完成'}

---

*本报告由 Mirror 认知数据提取引擎自动生成*
"""
        return report
    
    def _format_missing(self, missing: List[str]) -> str:
        """格式化缺失项"""
        if not missing:
            return ""
        return "\n**缺失项：**\n" + "\n".join(f"- {item}" for item in missing)
    
    def _generate_confidence_section(self, layer1: Dict, layer2: Dict, layer3: Dict) -> str:
        """生成置信度分析部分"""
        from app.services.quality_evaluator import QualityEvaluator
        evaluator = QualityEvaluator()
        
        all_items = []
        all_items.extend([
            {"type": "底层假设", "id": item.get("id"), "content": item.get("assumption"), "confidence": evaluator.calculate_confidence(item)}
            for item in layer1.get("fundamental_assumptions", [])
        ])
        all_items.extend([
            {"type": "推理规则", "id": item.get("id"), "content": item.get("pattern"), "confidence": evaluator.calculate_confidence(item)}
            for item in layer2.get("reasoning_patterns", [])
        ])
        all_items.extend([
            {"type": "表达策略", "id": item.get("id"), "content": item.get("strategy"), "confidence": evaluator.calculate_confidence(item)}
            for item in layer3.get("expression_strategies", [])
        ])
        
        if not all_items:
            return "无数据"
        
        high_count = sum(1 for item in all_items if item["confidence"] == "高")
        medium_count = sum(1 for item in all_items if item["confidence"] == "中")
        low_count = sum(1 for item in all_items if item["confidence"] == "低")
        
        section = f"""### 置信度分布
- **高置信度：** {high_count} 条 ({high_count/len(all_items)*100:.1f}%)
- **中置信度：** {medium_count} 条 ({medium_count/len(all_items)*100:.1f}%)
- **低置信度：** {low_count} 条 ({low_count/len(all_items)*100:.1f}%)
"""
        
        # 列出低置信度条目
        low_items = [item for item in all_items if item["confidence"] == "低"]
        if low_items:
            section += "\n### 低置信度条目\n"
            for item in low_items:
                section += f"- **[{item['id']}]** {item['type']}：{item['content'][:50]}...\n"
        
        return section
    
    def _generate_bad_case_section(self, bad_cases: List[Dict]) -> str:
        """生成Bad Case部分"""
        if not bad_cases:
            return "✅ 未发现矛盾信念"
        
        section = f"⚠️ 发现 {len(bad_cases)} 处矛盾\n\n"
        for i, case in enumerate(bad_cases, 1):
            type_map = {
                "assumption_vs_assumption": "底层假设之间的矛盾",
                "rule_vs_rule": "推理规则之间的矛盾",
                "assumption_vs_rule": "底层假设与推理规则的矛盾"
            }
            section += f"""### 矛盾 {i}：{type_map.get(case['type'], '未知类型')}

**条目1：** [{case['item1_id']}] {case['item1_content'][:100]}...  
**条目2：** [{case['item2_id']}] {case['item2_content'][:100]}...  
**矛盾原因：** {case['contradiction_reason']}

"""
        return section
    
    def _format_suggestions(self, suggestions: List[str]) -> str:
        """格式化迭代建议"""
        if not suggestions:
            return "无建议"
        return "\n".join(f"{i}. {s}" for i, s in enumerate(suggestions, 1))
