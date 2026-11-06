# Blog Writer Implementation Specification

This technical specification document outlines the implementation details, architecture, and technical requirements for ALwrity's Blog Writer feature.

## Architecture Overview

### System Architecture

The Blog Writer is built on a microservices architecture with the following key components:

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI Components]
        State[Redux State Management]
        Router[React Router]
    end
    
    subgraph "Backend Layer"
        API[FastAPI Application]
        Auth[Authentication Service]
        Cache[Redis Cache]
        Queue[Celery Task Queue]
    end
    
    subgraph "AI Services Layer"
        Gemini[Google Gemini API]
        Research[Research Services]
        SEO[SEO Analysis Engine]
        Content[Content Generation]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Files[File Storage]
        Logs[Application Logs]
    end
    
    subgraph "External APIs"
        Tavily[Tavily Research API]
        Serper[Serper Search API]
        GSC[Google Search Console]
    end
    
    UI --> API
    State --> API
    Router --> API
    
    API --> Auth
    API --> Cache
    API --> Queue
    
    API --> Gemini
    API --> Research
    API --> SEO
    API --> Content
    
    Research --> Tavily
    Research --> Serper
    SEO --> GSC
    
    API --> DB
    Content --> Files
    API --> Logs
    
    style UI fill:#e3f2fd
    style API fill:#f3e5f5
    style Gemini fill:#e8f5e8
    style DB fill:#fff3e0
```

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Rich Text Editor**: TinyMCE or Quill

#### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with Clerk integration
- **API Documentation**: OpenAPI/Swagger
- **Background Tasks**: Celery with Redis
- **Caching**: Redis
- **File Storage**: AWS S3 or local storage

#### AI Services
- **Primary AI**: Google Gemini API
- **Research**: Tavily, Serper, Metaphor APIs
- **SEO Analysis**: Custom algorithms + external APIs
- **Image Generation**: Stability AI
- **Content Moderation**: Custom + external services

## API Endpoints

### Core Blog Writer Endpoints

#### Content Generation
```http
POST /api/blog-writer/generate
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "topic": "AI in Digital Marketing",
  "target_audience": "Marketing professionals",
  "content_type": "how-to-guide",
  "word_count": 1500,
  "tone": "professional",
  "keywords": ["AI", "digital marketing", "automation"],
  "research_depth": "comprehensive",
  "include_seo_analysis": true
}
```

#### Research Integration
```http
POST /api/blog-writer/research
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "topic": "Content Strategy",
  "research_depth": "comprehensive",
  "sources": ["web", "academic", "industry"],
  "language": "en",
  "date_range": "last_12_months"
}
```

#### SEO Analysis
```http
POST /api/blog-writer/seo/analyze
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "content": "Your blog post content here...",
  "target_keywords": ["content strategy", "digital marketing"],
  "competitor_urls": ["https://example.com"],
  "analysis_depth": "comprehensive"
}
```

### Response Formats

#### Success Response
```json
{
  "success": true,
  "data": {
    "content": {
      "title": "AI in Digital Marketing: A Comprehensive Guide",
      "body": "Generated content here...",
      "word_count": 1500,
      "reading_time": "6 minutes"
    },
    "research": {
      "sources": [...],
      "key_facts": [...],
      "trends": [...]
    },
    "seo_analysis": {
      "score": 85,
      "recommendations": [...],
      "keyword_analysis": {...}
    },
    "metadata": {
      "generated_at": "2024-01-15T10:30:00Z",
      "processing_time": "45 seconds",
      "ai_model": "gemini-pro"
    }
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_GENERATION_FAILED",
    "message": "Failed to generate content",
    "details": {
      "reason": "AI service timeout",
      "suggestion": "Try again with a shorter content length"
    }
  }
}
```

## Database Schema

### Core Tables

#### Blog Posts
```sql
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    word_count INTEGER,
    reading_time INTEGER,
    seo_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at);
```

#### Research Data
```sql
CREATE TABLE research_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID REFERENCES blog_posts(id),
    source_url VARCHAR(500),
    source_title VARCHAR(255),
    content TEXT,
    credibility_score INTEGER,
    relevance_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_research_data_blog_post_id ON research_data(blog_post_id);
CREATE INDEX idx_research_data_credibility ON research_data(credibility_score);
```

#### SEO Analysis
```sql
CREATE TABLE seo_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID REFERENCES blog_posts(id),
    overall_score INTEGER,
    keyword_score INTEGER,
    content_score INTEGER,
    technical_score INTEGER,
    readability_score INTEGER,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_analysis_blog_post_id ON seo_analysis(blog_post_id);
```

## AI Integration

### Google Gemini Integration

#### Configuration
```python
import google.generativeai as genai

class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_content(self, prompt: str, **kwargs) -> str:
        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=kwargs.get('temperature', 0.7),
                    max_output_tokens=kwargs.get('max_tokens', 2048),
                    top_p=kwargs.get('top_p', 0.8),
                    top_k=kwargs.get('top_k', 40)
                )
            )
            return response.text
        except Exception as e:
            raise ContentGenerationError(f"Gemini API error: {str(e)}")
```

#### Prompt Engineering
```python
class BlogWriterPrompts:
    @staticmethod
    def generate_blog_post(topic: str, audience: str, word_count: int) -> str:
        return f"""
        Write a comprehensive blog post about "{topic}" for {audience}.
        
        Requirements:
        - Word count: {word_count} words
        - Tone: Professional and engaging
        - Structure: Introduction, main sections, conclusion
        - Include actionable insights and examples
        - Use subheadings for better readability
        - Include a compelling call-to-action
        
        Please ensure the content is:
        - Well-researched and factual
        - SEO-friendly
        - Engaging and valuable to readers
        - Free from plagiarism
        """
    
    @staticmethod
    def generate_outline(topic: str, audience: str) -> str:
        return f"""
        Create a detailed outline for a blog post about "{topic}" for {audience}.
        
        Include:
        - Compelling headline
        - Introduction hook
        - 3-5 main sections with sub-points
        - Conclusion with call-to-action
        - Suggested word count for each section
        """
```

### Research Service Integration

#### Multi-Source Research
```python
class ResearchService:
    def __init__(self):
        self.tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        self.serper_client = SerperClient(api_key=settings.SERPER_API_KEY)
        self.metaphor_client = MetaphorClient(api_key=settings.METAPHOR_API_KEY)
    
    async def comprehensive_research(self, topic: str, depth: str = "comprehensive") -> Dict:
        research_results = {
            "web_sources": await self._web_research(topic),
            "academic_sources": await self._academic_research(topic),
            "industry_sources": await self._industry_research(topic),
            "news_sources": await self._news_research(topic)
        }
        
        return self._process_research_results(research_results)
    
    async def _web_research(self, topic: str) -> List[Dict]:
        # Tavily web search
        tavily_results = await self.tavily_client.search(
            query=topic,
            search_depth="advanced",
            max_results=10
        )
        
        # Serper Google search
        serper_results = await self.serper_client.search(
            query=topic,
            num_results=10
        )
        
        return self._merge_search_results(tavily_results, serper_results)
```

## Frontend Components

### React Components Structure

```
src/
├── components/
│   ├── BlogWriter/
│   │   ├── BlogWriterContainer.tsx
│   │   ├── TopicInput.tsx
│   │   ├── ContentEditor.tsx
│   │   ├── ResearchPanel.tsx
│   │   ├── SEOAnalysis.tsx
│   │   └── ContentPreview.tsx
│   ├── shared/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ProgressBar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
```

### Main Blog Writer Component
```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BlogWriterContainer } from './BlogWriterContainer';
import { ResearchPanel } from './ResearchPanel';
import { SEOAnalysis } from './SEOAnalysis';
import { ContentEditor } from './ContentEditor';

interface BlogWriterProps {
  initialTopic?: string;
  onContentGenerated?: (content: BlogContent) => void;
}

export const BlogWriter: React.FC<BlogWriterProps> = ({
  initialTopic,
  onContentGenerated
}) => {
  const [currentStep, setCurrentStep] = useState<'input' | 'research' | 'generation' | 'editing' | 'analysis'>('input');
  const [blogData, setBlogData] = useState<BlogData>({
    topic: initialTopic || '',
    audience: '',
    wordCount: 1000,
    tone: 'professional',
    keywords: []
  });

  const dispatch = useDispatch();
  const { content, research, seoAnalysis, loading, error } = useSelector(
    (state: RootState) => state.blogWriter
  );

  const handleGenerateContent = async () => {
    setCurrentStep('generation');
    dispatch(generateBlogContent(blogData));
  };

  const handleResearchComplete = (researchData: ResearchData) => {
    setBlogData(prev => ({ ...prev, research: researchData }));
    setCurrentStep('generation');
  };

  return (
    <div className="blog-writer">
      <BlogWriterContainer
        currentStep={currentStep}
        blogData={blogData}
        onDataChange={setBlogData}
        onGenerate={handleGenerateContent}
      />
      
      {currentStep === 'research' && (
        <ResearchPanel
          topic={blogData.topic}
          onComplete={handleResearchComplete}
        />
      )}
      
      {currentStep === 'editing' && content && (
        <ContentEditor
          content={content}
          onContentChange={(newContent) => setBlogData(prev => ({ ...prev, content: newContent }))}
        />
      )}
      
      {currentStep === 'analysis' && (
        <SEOAnalysis
          content={content}
          targetKeywords={blogData.keywords}
          onAnalysisComplete={(analysis) => setBlogData(prev => ({ ...prev, seoAnalysis: analysis }))}
        />
      )}
    </div>
  );
};
```

## State Management

### Redux Store Structure
```typescript
interface BlogWriterState {
  // Input data
  topic: string;
  audience: string;
  wordCount: number;
  tone: string;
  keywords: string[];
  
  // Generated content
  content: BlogContent | null;
  research: ResearchData | null;
  seoAnalysis: SEOAnalysis | null;
  
  // UI state
  currentStep: 'input' | 'research' | 'generation' | 'editing' | 'analysis';
  loading: boolean;
  error: string | null;
  
  // Progress tracking
  generationProgress: number;
  researchProgress: number;
}

// Actions
export const blogWriterSlice = createSlice({
  name: 'blogWriter',
  initialState,
  reducers: {
    setTopic: (state, action) => {
      state.topic = action.payload;
    },
    setAudience: (state, action) => {
      state.audience = action.payload;
    },
    setWordCount: (state, action) => {
      state.wordCount = action.payload;
    },
    setTone: (state, action) => {
      state.tone = action.payload;
    },
    setKeywords: (state, action) => {
      state.keywords = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setContent: (state, action) => {
      state.content = action.payload;
    },
    setResearch: (state, action) => {
      state.research = action.payload;
    },
    setSEOAnalysis: (state, action) => {
      state.seoAnalysis = action.payload;
    }
  }
});
```

## Error Handling

### Error Types
```python
class BlogWriterError(Exception):
    """Base exception for Blog Writer errors"""
    pass

class ContentGenerationError(BlogWriterError):
    """Error during content generation"""
    pass

class ResearchError(BlogWriterError):
    """Error during research process"""
    pass

class SEOAnalysisError(BlogWriterError):
    """Error during SEO analysis"""
    pass

class ValidationError(BlogWriterError):
    """Input validation error"""
    pass
```

### Error Handling Middleware
```python
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

@app.exception_handler(BlogWriterError)
async def blog_writer_error_handler(request: Request, exc: BlogWriterError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": exc.__class__.__name__,
                "message": str(exc),
                "details": getattr(exc, 'details', {})
            }
        }
    )

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": {
                    "field": exc.field,
                    "message": str(exc)
                }
            }
        }
    )
```

## Performance Optimization

### Caching Strategy
```python
from functools import lru_cache
import redis

class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
    
    @lru_cache(maxsize=1000)
    def get_research_cache(self, topic: str, depth: str) -> Dict:
        cache_key = f"research:{topic}:{depth}"
        cached_data = self.redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        return None
    
    def set_research_cache(self, topic: str, depth: str, data: Dict, ttl: int = 3600):
        cache_key = f"research:{topic}:{depth}"
        self.redis_client.setex(
            cache_key,
            ttl,
            json.dumps(data)
        )
```

### Background Processing
```python
from celery import Celery

celery_app = Celery('blog_writer')

@celery_app.task
def generate_blog_content_async(topic: str, audience: str, word_count: int):
    """Generate blog content asynchronously"""
    try:
        # Generate content
        content = generate_content(topic, audience, word_count)
        
        # Perform research
        research = perform_research(topic)
        
        # SEO analysis
        seo_analysis = perform_seo_analysis(content)
        
        return {
            "content": content,
            "research": research,
            "seo_analysis": seo_analysis
        }
    except Exception as e:
        raise ContentGenerationError(f"Async generation failed: {str(e)}")
```

## Security Considerations

### Input Validation
```python
from pydantic import BaseModel, validator
import re

class BlogGenerationRequest(BaseModel):
    topic: str
    audience: str
    word_count: int
    tone: str
    keywords: List[str]
    
    @validator('topic')
    def validate_topic(cls, v):
        if len(v) < 3 or len(v) > 200:
            raise ValueError('Topic must be between 3 and 200 characters')
        return v.strip()
    
    @validator('word_count')
    def validate_word_count(cls, v):
        if v < 100 or v > 10000:
            raise ValueError('Word count must be between 100 and 10,000')
        return v
    
    @validator('tone')
    def validate_tone(cls, v):
        allowed_tones = ['professional', 'casual', 'friendly', 'authoritative', 'conversational']
        if v not in allowed_tones:
            raise ValueError(f'Tone must be one of: {", ".join(allowed_tones)}')
        return v
```

### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/blog-writer/generate")
@limiter.limit("10/minute")
async def generate_blog_content(request: Request, data: BlogGenerationRequest):
    # Implementation
    pass
```

## Testing Strategy

### Unit Tests
```python
import pytest
from unittest.mock import Mock, patch
from blog_writer.services import BlogWriterService

class TestBlogWriterService:
    @pytest.fixture
    def blog_writer_service(self):
        return BlogWriterService()
    
    @patch('blog_writer.services.GeminiService')
    def test_generate_content_success(self, mock_gemini, blog_writer_service):
        # Mock Gemini response
        mock_gemini.return_value.generate_content.return_value = "Generated content"
        
        # Test content generation
        result = blog_writer_service.generate_content(
            topic="AI in Marketing",
            audience="Marketing professionals",
            word_count=1000
        )
        
        assert result["content"] == "Generated content"
        assert result["word_count"] == 1000
    
    def test_validate_input_data(self, blog_writer_service):
        # Test input validation
        with pytest.raises(ValidationError):
            blog_writer_service.validate_input({
                "topic": "",  # Empty topic
                "word_count": 50  # Too short
            })
```

### Integration Tests
```python
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_blog_generation_endpoint():
    response = client.post(
        "/api/blog-writer/generate",
        json={
            "topic": "AI in Digital Marketing",
            "audience": "Marketing professionals",
            "word_count": 1000,
            "tone": "professional"
        },
        headers={"Authorization": "Bearer test_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "content" in data["data"]
```

## Deployment Configuration

### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
```bash
# .env
DATABASE_URL=postgresql://user:password@localhost/alwrity
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
SERPER_API_KEY=your_serper_api_key
METAPHOR_API_KEY=your_metaphor_api_key
STABILITY_API_KEY=your_stability_api_key
SECRET_KEY=your_secret_key
CORS_ORIGINS=http://localhost:3000
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-writer-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-writer-api
  template:
    metadata:
      labels:
        app: blog-writer-api
    spec:
      containers:
      - name: blog-writer-api
        image: alwrity/blog-writer-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: alwrity-secrets
              key: database-url
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: alwrity-secrets
              key: gemini-api-key
```

---

*This implementation specification provides the technical foundation for building a robust, scalable Blog Writer feature. For more details on specific components, refer to the individual feature documentation.*
