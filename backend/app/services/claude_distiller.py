"""
Claude API integration for text compression and three-layer cognitive distillation.
"""
import os
import json
from anthropic import Anthropic


def load_prompt(layer: str) -> str:
    """Load prompt template from docs/prompts/"""
    prompt_path = f"/home/ubuntu/mirror/docs/prompts/layer{layer}.md"
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_client() -> Anthropic:
    """Get Anthropic client with custom base_url support."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    base_url = os.getenv("ANTHROPIC_BASE_URL")
    
    if base_url:
        return Anthropic(api_key=api_key, base_url=base_url)
    else:
        return Anthropic(api_key=api_key)


def compress_text(raw_text: str) -> str:
    """
    Compress raw text into structured format for distillation.
    
    Args:
        raw_text: Original long-form text
        
    Returns:
        Compressed structured text
    """
    client = get_client()
    
    prompt = """你是一个文本压缩专家。请将输入的长文本压缩为结构化格式，保留所有关键信息，但去除冗余和重复。

要求：
1. 保留所有核心观点、论据、例子
2. 保持逻辑结构清晰
3. 使用简洁的语言
4. 不要改变原文的意思和语气
5. 输出格式：markdown，使用标题、列表等结构化元素

直接输出压缩后的文本，不要添加任何解释或元信息。"""
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f"{prompt}\n\n---\n\n## 原始文本\n\n{raw_text}"
            }
        ]
    )
    
    return message.content[0].text


def extract_layer1(compressed_text: str) -> dict:
    """
    Extract foundational assumptions and build paragraph index.
    
    Args:
        compressed_text: Gemini-compressed structured text
        
    Returns:
        dict with keys: paragraph_index, foundational_assumptions, extraction_notes
    """
    client = get_client()
    prompt = load_prompt("1")
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=16000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f"{prompt}\n\n---\n\n## 输入文本\n\n{compressed_text}"
            }
        ]
    )
    
    # Extract JSON from response
    response_text = message.content[0].text
    
    # Try to parse JSON from code block or raw text
    if "```json" in response_text:
        json_start = response_text.find("```json") + 7
        json_end = response_text.find("```", json_start)
        json_text = response_text[json_start:json_end].strip()
    elif "```" in response_text:
        json_start = response_text.find("```") + 3
        json_end = response_text.find("```", json_start)
        json_text = response_text[json_start:json_end].strip()
    else:
        json_text = response_text.strip()
    
    return json.loads(json_text)


def extract_layer2(layer1_result: dict) -> dict:
    """
    Extract reasoning patterns from layer1 output.
    
    Args:
        layer1_result: Output from extract_layer1
        
    Returns:
        dict with keys: reasoning_patterns, assumption_coverage, extraction_notes
    """
    client = get_client()
    prompt = load_prompt("2")
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=12000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f"{prompt}\n\n---\n\n## 输入数据（请求1的输出）\n\n```json\n{json.dumps(layer1_result, ensure_ascii=False, indent=2)}\n```"
            }
        ]
    )
    
    response_text = message.content[0].text
    
    if "```json" in response_text:
        json_start = response_text.find("```json") + 7
        json_end = response_text.find("```", json_start)
        json_text = response_text[json_start:json_end].strip()
    elif "```" in response_text:
        json_start = response_text.find("```") + 3
        json_end = response_text.find("```", json_start)
        json_text = response_text[json_start:json_end].strip()
    else:
        json_text = response_text.strip()
    
    return json.loads(json_text)


def extract_layer3(layer1_result: dict, layer2_result: dict) -> dict:
    """
    Extract expression strategies from layer1+2 output.
    
    Args:
        layer1_result: Output from extract_layer1
        layer2_result: Output from extract_layer2
        
    Returns:
        dict with keys: expression_strategies, silence_strategies, signature_phrases, system_integration
    """
    client = get_client()
    prompt = load_prompt("3")
    
    combined_input = {
        "layer1": layer1_result,
        "layer2": layer2_result
    }
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=12000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f"{prompt}\n\n---\n\n## 输入数据（请求1和请求2的输出）\n\n```json\n{json.dumps(combined_input, ensure_ascii=False, indent=2)}\n```"
            }
        ]
    )
    
    response_text = message.content[0].text
    
    if "```json" in response_text:
        json_start = response_text.find("```json") + 7
        json_end = response_text.find("```", json_start)
        json_text = response_text[json_start:json_end].strip()
    elif "```" in response_text:
        json_start = response_text.find("```") + 3
        json_end = response_text.find("```", json_start)
        json_text = response_text[json_start:json_end].strip()
    else:
        json_text = response_text.strip()
    
    return json.loads(json_text)
