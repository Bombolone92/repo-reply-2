"""
AI Prompts for Competitor Analysis

This module contains prompts for analyzing competitor data from Exa API
to generate actionable insights for content strategy and competitive positioning.
"""

COMPETITOR_ANALYSIS_PROMPT = """
You are a competitive intelligence analyst specializing in content strategy and market positioning. 

**TASK**: Analyze competitor data to provide actionable insights for content strategy and competitive positioning.

**COMPETITOR DATA**:
{competitor_context}

**USER'S WEBSITE**: {user_url}
**INDUSTRY CONTEXT**: {industry_context}

**ANALYSIS REQUIREMENTS**:

1. **Market Position Analysis**
   - Identify the competitive landscape structure
   - Determine market leaders vs. challengers
   - Assess market saturation and opportunities

2. **Content Strategy Insights**
   - Analyze competitor content themes and topics
   - Identify content gaps and opportunities
   - Suggest unique content angles for differentiation

3. **Competitive Advantages**
   - Highlight what makes each competitor unique
   - Identify areas where the user can differentiate
   - Suggest positioning strategies

4. **SEO and Marketing Insights**
   - Analyze competitor positioning and messaging
   - Identify keyword and content opportunities
   - Suggest marketing strategies

**OUTPUT FORMAT** (JSON):
{{
    "market_analysis": {{
        "competitive_landscape": "Description of market structure",
        "market_leaders": ["List of top 3 competitors"],
        "market_opportunities": ["List of 3-5 opportunities"],
        "saturation_level": "high/medium/low"
    }},
    "content_strategy": {{
        "common_themes": ["List of common content themes"],
        "content_gaps": ["List of 5 content opportunities"],
        "unique_angles": ["List of 3 unique content angles"],
        "content_frequency_insights": "Analysis of publishing patterns"
    }},
    "competitive_positioning": {{
        "differentiation_opportunities": ["List of 5 ways to differentiate"],
        "unique_value_propositions": ["List of 3 unique positioning ideas"],
        "target_audience_insights": "Analysis of competitor audience targeting"
    }},
    "seo_opportunities": {{
        "keyword_gaps": ["List of 5 keyword opportunities"],
        "content_topics": ["List of 5 high-value content topics"],
        "marketing_channels": ["List of competitor marketing strategies"]
    }},
    "actionable_recommendations": [
        "List of 5 specific, actionable recommendations"
    ],
    "risk_assessment": {{
        "competitive_threats": ["List of 3 main threats"],
        "market_barriers": ["List of 2-3 barriers to entry"],
        "success_factors": ["List of 3 key success factors"]
    }}
}}

**INSTRUCTIONS**:
- Be specific and actionable in your recommendations
- Focus on opportunities for differentiation
- Consider the user's industry context
- Prioritize recommendations by impact and feasibility
- Use data from the competitor analysis to support insights
- Keep recommendations practical and implementable

**QUALITY STANDARDS**:
- Each recommendation should be specific and actionable
- Insights should be based on actual competitor data
- Focus on differentiation and competitive advantage
- Consider both short-term and long-term strategies
- Ensure recommendations are relevant to the user's industry
"""

CONTENT_GAP_ANALYSIS_PROMPT = """
You are a content strategist analyzing competitor content to identify gaps and opportunities.

**TASK**: Analyze competitor content patterns to identify content gaps and opportunities.

**COMPETITOR CONTENT DATA**:
{competitor_context}

**USER'S INDUSTRY**: {industry_context}
**TARGET AUDIENCE**: {target_audience}

**ANALYSIS FOCUS**:

1. **Content Topic Analysis**
   - Identify most common content topics across competitors
   - Find underserved or missing topics
   - Analyze content depth and quality patterns

2. **Content Format Opportunities**
   - Identify popular content formats among competitors
   - Find format gaps and opportunities
   - Suggest innovative content approaches

3. **Audience Targeting Gaps**
   - Analyze competitor audience targeting
   - Identify underserved audience segments
   - Suggest audience expansion opportunities

4. **SEO Content Opportunities**
   - Identify high-value keywords competitors are missing
   - Find long-tail keyword opportunities
   - Suggest content clusters for SEO

**OUTPUT FORMAT** (JSON):
{{
    "content_gaps": [
        {{
            "topic": "Specific content topic",
            "opportunity_level": "high/medium/low",
            "reasoning": "Why this is an opportunity",
            "content_angle": "Unique angle for this topic",
            "estimated_difficulty": "easy/medium/hard"
        }}
    ],
    "format_opportunities": [
        {{
            "format": "Content format type",
            "gap_reason": "Why competitors aren't using this",
            "potential_impact": "Expected impact level",
            "implementation_tips": "How to implement"
        }}
    ],
    "audience_gaps": [
        {{
            "audience_segment": "Underserved audience",
            "opportunity_size": "large/medium/small",
            "content_needs": "What content this audience needs",
            "engagement_strategy": "How to engage this audience"
        }}
    ],
    "seo_opportunities": [
        {{
            "keyword_theme": "Keyword cluster theme",
            "search_volume": "estimated_high/medium/low",
            "competition_level": "low/medium/high",
            "content_ideas": ["3-5 content ideas for this theme"]
        }}
    ],
    "priority_recommendations": [
        "Top 5 prioritized content opportunities with implementation order"
    ]
}}
"""

COMPETITIVE_INTELLIGENCE_PROMPT = """
You are a competitive intelligence expert providing strategic insights for market positioning.

**TASK**: Generate comprehensive competitive intelligence insights for strategic decision-making.

**COMPETITOR INTELLIGENCE DATA**:
{competitor_context}

**BUSINESS CONTEXT**:
- User Website: {user_url}
- Industry: {industry_context}
- Business Model: {business_model}
- Target Market: {target_market}

**INTELLIGENCE AREAS**:

1. **Competitive Landscape Mapping**
   - Market positioning analysis
   - Competitive strength assessment
   - Market share estimation

2. **Strategic Positioning Opportunities**
   - Blue ocean opportunities
   - Differentiation strategies
   - Competitive moats

3. **Threat Assessment**
   - Competitive threats
   - Market disruption risks
   - Barrier to entry analysis

4. **Growth Strategy Insights**
   - Market expansion opportunities
   - Partnership possibilities
   - Acquisition targets

**OUTPUT FORMAT** (JSON):
{{
    "competitive_landscape": {{
        "market_structure": "Description of market structure",
        "key_players": [
            {{
                "name": "Competitor name",
                "position": "market_leader/challenger/niche",
                "strengths": ["List of key strengths"],
                "weaknesses": ["List of key weaknesses"],
                "market_share": "estimated_percentage"
            }}
        ],
        "market_dynamics": "Analysis of market trends and forces"
    }},
    "positioning_opportunities": {{
        "blue_ocean_opportunities": ["List of uncontested market spaces"],
        "differentiation_strategies": ["List of positioning strategies"],
        "competitive_advantages": ["List of potential advantages to build"]
    }},
    "threat_analysis": {{
        "immediate_threats": ["List of current competitive threats"],
        "future_risks": ["List of potential future risks"],
        "market_barriers": ["List of barriers to success"]
    }},
    "strategic_recommendations": {{
        "short_term_actions": ["List of 3-5 immediate actions"],
        "medium_term_strategy": ["List of 3-5 strategic initiatives"],
        "long_term_vision": ["List of 2-3 long-term strategic goals"]
    }},
    "success_metrics": {{
        "kpis_to_track": ["List of key performance indicators"],
        "competitive_benchmarks": ["List of metrics to benchmark against"],
        "success_thresholds": ["List of success criteria"]
    }}
}}
"""

# Utility function to format prompts with data
def format_competitor_analysis_prompt(competitor_context: str, user_url: str, industry_context: str = None) -> str:
    """Format the competitor analysis prompt with actual data."""
    return COMPETITOR_ANALYSIS_PROMPT.format(
        competitor_context=competitor_context,
        user_url=user_url,
        industry_context=industry_context or "Not specified"
    )

def format_content_gap_prompt(competitor_context: str, industry_context: str = None, target_audience: str = None) -> str:
    """Format the content gap analysis prompt with actual data."""
    return CONTENT_GAP_ANALYSIS_PROMPT.format(
        competitor_context=competitor_context,
        industry_context=industry_context or "Not specified",
        target_audience=target_audience or "Not specified"
    )

def format_competitive_intelligence_prompt(
    competitor_context: str, 
    user_url: str, 
    industry_context: str = None,
    business_model: str = None,
    target_market: str = None
) -> str:
    """Format the competitive intelligence prompt with actual data."""
    return COMPETITIVE_INTELLIGENCE_PROMPT.format(
        competitor_context=competitor_context,
        user_url=user_url,
        industry_context=industry_context or "Not specified",
        business_model=business_model or "Not specified",
        target_market=target_market or "Not specified"
    )
