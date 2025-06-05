-- English prompt templates
INSERT INTO prompt_templates (id, name, description, category, version, locale, template, variables, metadata) VALUES
  (
    'import-untappd-en-v1',
    'Untappd Import',
    'Extract beer data from Untappd screenshots',
    'import',
    '1.0.0',
    'en-US',
    'You are a beer data expert. Analyze the attached Untappd screenshot and extract beer information in the following JSON format.

**Image Content**
{{screenshot_description}}

**Information to Extract**
- Beer name
- Brewery name
- Beer style
- Rating (star count)
- Check-in date and time
- Tasting notes (if available)

**Output Format**
```json
{
  "beers": [
    {
      "name": "Beer Name",
      "brewery": "Brewery Name",
      "style": "Beer Style",
      "rating": 4.2,
      "checkinDate": "2024-01-01",
      "notes": "Tasting notes (if available)",
      "venue": "Location where consumed (if available)"
    }
  ]
}
```

**Notes**
- Extract only information that can be reliably read
- Record unknown items as null
- Record beer names and brewery names accurately',
    '[{"name":"screenshot_description","type":"string","required":true,"description":"Description of screenshot content","placeholder":"This is an Untappd beer history screen showing 5 beers."}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":150,"difficulty":"easy","tags":["import","untappd","beer-data"]}'
  ),
  
  (
    'search-basic-en-v1',
    'Basic Beer Search',
    'Search for beers with basic conditions',
    'search',
    '1.0.0',
    'en-US',
    'You are a beer expert. Please suggest 3 optimal beers based on the following conditions.

**Search Conditions**
Purpose: {{session_goal}}
Location/Region: {{location}}
Budget: {{budget}}
Taste Preference: {{taste_preferences}}
Elements to Avoid: {{avoid_list}}

**My Beer History (Reference)**
{{user_history_summary}}

**Suggestion Format**
Please respond for each beer in the following format:

### 1. [Beer Name] / [Brewery Name]
- **Style**: [Beer Style]
- **Features**: [Taste characteristics]
- **Why Recommended**: [Reason for selection]
- **How to Obtain**: [Places or methods to purchase]
- **Price Range**: [Price range]

**Notes**
- Suggest only real beers
- Prioritize those available in the specified region
- Consider my taste history when suggesting',
    '[{"name":"session_goal","type":"string","required":true,"description":"Session purpose"},{"name":"location","type":"string","required":false,"description":"Location/region restrictions"},{"name":"budget","type":"string","required":false,"description":"Budget restrictions"},{"name":"taste_preferences","type":"string","required":true,"description":"Taste preferences"},{"name":"avoid_list","type":"string","required":false,"description":"Elements to avoid"},{"name":"user_history_summary","type":"string","required":false,"description":"User beer history summary"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":200,"difficulty":"medium","tags":["search","basic","recommendation"]}'
  );

-- Chinese prompt templates
INSERT INTO prompt_templates (id, name, description, category, version, locale, template, variables, metadata) VALUES
  (
    'import-untappd-zh-v1',
    'Untappd导入',
    '从Untappd截图中提取啤酒数据',
    'import',
    '1.0.0',
    'zh-CN',
    '您是啤酒数据专家。请分析附加的Untappd截图，并按以下JSON格式提取啤酒信息。

**图片内容**
{{screenshot_description}}

**需要提取的信息**
- 啤酒名称
- 酿造厂名称
- 啤酒风格
- 评分（星数）
- 签到日期时间
- 品鉴笔记（如有）

**输出格式**
```json
{
  "beers": [
    {
      "name": "啤酒名称",
      "brewery": "酿造厂名称",
      "style": "啤酒风格",
      "rating": 4.2,
      "checkinDate": "2024-01-01",
      "notes": "品鉴笔记（如有）",
      "venue": "消费地点（如有）"
    }
  ]
}
```

**注意事项**
- 仅提取可以可靠读取的信息
- 未知项目记录为null
- 准确记录啤酒名称和酿造厂名称',
    '[{"name":"screenshot_description","type":"string","required":true,"description":"截图内容描述","placeholder":"这是一个Untappd啤酒历史屏幕，显示了5款啤酒。"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":150,"difficulty":"easy","tags":["import","untappd","beer-data"]}'
  ),
  
  (
    'search-basic-zh-v1',
    '基础啤酒搜索',
    '基于基本条件搜索啤酒',
    'search',
    '1.0.0',
    'zh-CN',
    '您是啤酒专家。请根据以下条件推荐3款最佳啤酒。

**搜索条件**
目的：{{session_goal}}
地点/地区：{{location}}
预算：{{budget}}
口味偏好：{{taste_preferences}}
要避免的元素：{{avoid_list}}

**我的啤酒历史（参考信息）**
{{user_history_summary}}

**推荐格式**
请为每款啤酒按以下格式回答：

### 1. [啤酒名称] / [酿造厂名称]
- **风格**：[啤酒风格]
- **特点**：[味道特征]
- **推荐理由**：[选择原因]
- **获取方式**：[购买地点或方法]
- **价格范围**：[价格区间]

**注意事项**
- 仅推荐真实存在的啤酒
- 优先推荐在指定地区可获得的
- 根据我的口味历史进行推荐',
    '[{"name":"session_goal","type":"string","required":true,"description":"会话目的"},{"name":"location","type":"string","required":false,"description":"地点/地区限制"},{"name":"budget","type":"string","required":false,"description":"预算限制"},{"name":"taste_preferences","type":"string","required":true,"description":"口味偏好"},{"name":"avoid_list","type":"string","required":false,"description":"要避免的元素"},{"name":"user_history_summary","type":"string","required":false,"description":"用户啤酒历史摘要"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":200,"difficulty":"medium","tags":["search","basic","recommendation"]}'
  );

-- Korean prompt templates
INSERT INTO prompt_templates (id, name, description, category, version, locale, template, variables, metadata) VALUES
  (
    'import-untappd-ko-v1',
    'Untappd 가져오기',
    'Untappd 스크린샷에서 맥주 데이터 추출',
    'import',
    '1.0.0',
    'ko-KR',
    '당신은 맥주 데이터 전문가입니다. 첨부된 Untappd 스크린샷을 분석하고 다음 JSON 형식으로 맥주 정보를 추출해주세요.

**이미지 내용**
{{screenshot_description}}

**추출할 정보**
- 맥주 이름
- 양조장 이름
- 맥주 스타일
- 평점 (별 개수)
- 체크인 날짜 시간
- 테이스팅 노트 (있는 경우)

**출력 형식**
```json
{
  "beers": [
    {
      "name": "맥주 이름",
      "brewery": "양조장 이름",
      "style": "맥주 스타일",
      "rating": 4.2,
      "checkinDate": "2024-01-01",
      "notes": "테이스팅 노트 (있는 경우)",
      "venue": "소비 장소 (있는 경우)"
    }
  ]
}
```

**주의사항**
- 확실히 읽을 수 있는 정보만 추출하세요
- 알 수 없는 항목은 null로 기록하세요
- 맥주 이름과 양조장 이름을 정확히 기록하세요',
    '[{"name":"screenshot_description","type":"string","required":true,"description":"스크린샷 내용 설명","placeholder":"5개의 맥주를 보여주는 Untappd 맥주 기록 화면입니다."}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":150,"difficulty":"easy","tags":["import","untappd","beer-data"]}'
  ),
  
  (
    'search-basic-ko-v1',
    '기본 맥주 검색',
    '기본 조건으로 맥주 검색',
    'search',
    '1.0.0',
    'ko-KR',
    '당신은 맥주 전문가입니다. 다음 조건에 따라 최적의 맥주 3개를 추천해주세요.

**검색 조건**
목적: {{session_goal}}
위치/지역: {{location}}
예산: {{budget}}
맛 선호도: {{taste_preferences}}
피하고 싶은 요소: {{avoid_list}}

**나의 맥주 기록 (참고 정보)**
{{user_history_summary}}

**추천 형식**
각 맥주에 대해 다음 형식으로 답변해주세요:

### 1. [맥주 이름] / [양조장 이름]
- **스타일**: [맥주 스타일]
- **특징**: [맛 특성]
- **추천 이유**: [선택 이유]
- **구입 방법**: [구매 장소나 방법]
- **가격 범위**: [가격대]

**주의사항**
- 실제로 존재하는 맥주만 추천해주세요
- 지정된 지역에서 구할 수 있는 것을 우선해주세요
- 제 맛 기록을 고려하여 추천해주세요',
    '[{"name":"session_goal","type":"string","required":true,"description":"세션 목적"},{"name":"location","type":"string","required":false,"description":"위치/지역 제한"},{"name":"budget","type":"string","required":false,"description":"예산 제한"},{"name":"taste_preferences","type":"string","required":true,"description":"맛 선호도"},{"name":"avoid_list","type":"string","required":false,"description":"피하고 싶은 요소"},{"name":"user_history_summary","type":"string","required":false,"description":"사용자 맥주 기록 요약"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":200,"difficulty":"medium","tags":["search","basic","recommendation"]}'
  );