"""
质量评估模块
- 置信度计算
- Bad Case检测
- 覆盖度分析
"""

from typing import Dict, List, Any
from anthropic import Anthropic
import os
import json


class QualityEvaluator:
    def __init__(self):
        self.client = Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            base_url=os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
        )
    
    def calculate_confidence(self, item: Dict[str, Any]) -> str:
        """
        计算单条信念/规则/策略的置信度
        规则：
        - 证据数>=5且来源>=3 → 高
        - 证据数>=3且来源>=2 → 中
        - 其他 → 低
        """
        evidence = item.get("evidence", [])
        evidence_count = len(evidence)
        
        # 统计来源数量（兼容 source 和 paragraph_id 两种字段名）
        sources = set()
        for ev in evidence:
            # 优先使用 source，如果没有则尝试 paragraph_id
            source_id = ev.get("source") or ev.get("paragraph_id")
            if source_id:
                sources.add(source_id)
        source_count = len(sources)
        
        if evidence_count >= 5 and source_count >= 3:
            return "高"
        elif evidence_count >= 3 and source_count >= 2:
            return "中"
        else:
            return "低"
    
    def analyze_coverage(self, layer1: Dict, layer2: Dict, layer3: Dict) -> Dict[str, Any]:
        """
        覆盖度分析
        规则：
        - 认知层：>=3条底层假设 → 充足
        - 表达层：>=3条推理规则 → 充足
        - 互动层：>=3条表达策略 且 有沉默策略 且 有系统整合 → 充足
        """
        coverage = {
            "cognitive_layer": {
                "sufficient": False,
                "count": 0,
                "threshold": 3,
                "missing": []
            },
            "expression_layer": {
                "sufficient": False,
                "count": 0,
                "threshold": 3,
                "missing": []
            },
            "interaction_layer": {
                "sufficient": False,
                "count": 0,
                "threshold": 3,
                "missing": []
            }
        }
        
        # 认知层
        assumptions = layer1.get("fundamental_assumptions", [])
        coverage["cognitive_layer"]["count"] = len(assumptions)
        coverage["cognitive_layer"]["sufficient"] = len(assumptions) >= 3
        if len(assumptions) < 3:
            coverage["cognitive_layer"]["missing"].append(f"需要至少{3 - len(assumptions)}条底层假设")
        
        # 表达层
        rules = layer2.get("reasoning_patterns", [])
        coverage["expression_layer"]["count"] = len(rules)
        coverage["expression_layer"]["sufficient"] = len(rules) >= 3
        if len(rules) < 3:
            coverage["expression_layer"]["missing"].append(f"需要至少{3 - len(rules)}条推理规则")
        
        # 互动层
        strategies = layer3.get("expression_strategies", [])
        silence = layer3.get("silence_strategies", [])
        integration = layer3.get("system_integration", {})
        
        coverage["interaction_layer"]["count"] = len(strategies)
        has_silence = len(silence) > 0
        has_integration = bool(integration)
        
        coverage["interaction_layer"]["sufficient"] = (
            len(strategies) >= 3 and has_silence and has_integration
        )
        
        if len(strategies) < 3:
            coverage["interaction_layer"]["missing"].append(f"需要至少{3 - len(strategies)}条表达策略")
        if not has_silence:
            coverage["interaction_layer"]["missing"].append("缺少沉默策略")
        if not has_integration:
            coverage["interaction_layer"]["missing"].append("缺少系统整合评估")
        
        return coverage
    
    async def detect_bad_cases(self, layer1: Dict, layer2: Dict) -> List[Dict[str, Any]]:
        """
        Bad Case检测：找矛盾信念
        使用Claude分析底层假设和推理规则之间的矛盾
        """
        prompt = f"""你是一个认知数据质量检测专家。请分析以下提取的认知数据，找出其中的矛盾信念。

# 底层假设
{json.dumps(layer1.get("fundamental_assumptions", []), ensure_ascii=False, indent=2)}

# 推理规则
{json.dumps(layer2.get("reasoning_patterns", []), ensure_ascii=False, indent=2)}

# 任务
1. 找出底层假设之间的矛盾（如果有）
2. 找出推理规则之间的矛盾（如果有）
3. 找出底层假设和推理规则之间的矛盾（如果有）

# 输出格式
请以JSON格式输出，结构如下：
{{
  "contradictions": [
    {{
      "type": "assumption_vs_assumption" | "rule_vs_rule" | "assumption_vs_rule",
      "item1_id": "FA-01",
      "item1_content": "...",
      "item2_id": "RP-01",
      "item2_content": "...",
      "contradiction_reason": "为什么矛盾"
    }}
  ]
}}

如果没有发现矛盾，返回空数组。
"""
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # 检查响应是否有效
            if not response or not response.content or len(response.content) == 0:
                print(f"Bad case检测失败: API 返回空响应")
                return []
            
            content = response.content[0].text.strip()
            
            # 解析JSON（支持```json代码块）
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()
            
            result = json.loads(content)
            return result.get("contradictions", [])
        
        except Exception as e:
            print(f"Bad case检测失败: {e}")
            return []
    
    def calculate_overall_score(
        self,
        layer1: Dict,
        layer2: Dict,
        layer3: Dict,
        coverage: Dict,
        bad_cases: List
    ) -> Dict[str, Any]:
        """
        计算整体评分（0-100）
        评分规则：
        - 覆盖度：40分（认知层15 + 表达层10 + 互动层15）
        - 置信度：30分（高置信度条目占比）
        - Bad Case：-10分/条（最多扣30分）
        - 数据量：30分（总条目数>=10 → 满分，<10 → 按比例）
        """
        score = 0
        
        # 1. 覆盖度得分（40分）
        if coverage["cognitive_layer"]["sufficient"]:
            score += 15
        else:
            score += 15 * (coverage["cognitive_layer"]["count"] / 3)
        
        if coverage["expression_layer"]["sufficient"]:
            score += 10
        else:
            score += 10 * (coverage["expression_layer"]["count"] / 3)
        
        if coverage["interaction_layer"]["sufficient"]:
            score += 15
        else:
            # 互动层需要三个条件都满足
            strategies_score = min(len(layer3.get("expression_strategies", [])) / 3, 1) * 10
            silence_score = 2.5 if layer3.get("silence_strategies") else 0
            integration_score = 2.5 if layer3.get("system_integration") else 0
            score += strategies_score + silence_score + integration_score
        
        # 2. 置信度得分（30分）
        all_items = []
        all_items.extend(layer1.get("fundamental_assumptions", []))
        all_items.extend(layer2.get("reasoning_patterns", []))
        all_items.extend(layer3.get("expression_strategies", []))
        
        confidence_ratio = 0  # 初始化为 0
        if all_items:
            high_confidence_count = sum(
                1 for item in all_items
                if self.calculate_confidence(item) == "高"
            )
            confidence_ratio = high_confidence_count / len(all_items)
            score += confidence_ratio * 30
        
        # 3. Bad Case扣分（最多扣30分）
        bad_case_penalty = min(len(bad_cases) * 10, 30)
        score -= bad_case_penalty
        
        # 4. 数据量得分（30分）
        total_items = len(all_items)
        if total_items >= 10:
            score += 30
        else:
            score += (total_items / 10) * 30
        
        # 确保分数在0-100之间
        score = max(0, min(100, score))
        
        # 评级
        if score >= 80:
            rating = "优秀"
        elif score >= 60:
            rating = "良好"
        else:
            rating = "待改进"
        
        return {
            "score": round(score, 1),
            "rating": rating,
            "breakdown": {
                "coverage": round(score - (confidence_ratio * 30 if all_items else 0) + bad_case_penalty - (min(total_items, 10) / 10 * 30), 1),
                "confidence": round(confidence_ratio * 30 if all_items else 0, 1),
                "bad_case_penalty": bad_case_penalty,
                "data_volume": round(min(total_items, 10) / 10 * 30, 1)
            }
        }
    
    def generate_iteration_suggestions(
        self,
        coverage: Dict,
        bad_cases: List,
        overall_score: Dict
    ) -> List[str]:
        """
        生成迭代建议
        """
        suggestions = []
        
        # 覆盖度建议
        for layer_name, layer_data in coverage.items():
            if not layer_data["sufficient"]:
                for missing in layer_data["missing"]:
                    suggestions.append(f"【{layer_name}】{missing}")
        
        # Bad Case建议
        if bad_cases:
            suggestions.append(f"发现{len(bad_cases)}处矛盾信念，建议补充更多访谈内容以消除矛盾")
        
        # 置信度建议
        if overall_score["breakdown"]["confidence"] < 15:
            suggestions.append("整体置信度偏低，建议补充更多证据段落")
        
        # 数据量建议
        if overall_score["breakdown"]["data_volume"] < 20:
            suggestions.append("提取的认知条目数量不足，建议提供更长的访谈文本")
        
        if not suggestions:
            suggestions.append("质量良好，无需迭代")
        
        return suggestions
