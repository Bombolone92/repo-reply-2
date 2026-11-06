# Self-Host Setup - Developers

Get ALwrity running on your local machine in just 2 hours. This guide will help you set up the development environment and understand the self-hosted architecture.

## 🎯 What You'll Accomplish

By the end of this guide, you'll have:
- ✅ ALwrity running locally on your machine
- ✅ Backend API server accessible at localhost:8000
- ✅ Frontend dashboard accessible at localhost:3000
- ✅ Configured API keys for AI services
- ✅ Made your first API call to test the setup

## ⏱️ Time Required: 2 hours

## 🚀 Step-by-Step Setup

### Step 1: Prerequisites Check (10 minutes)

Before we start, ensure you have the following installed:

#### Required Software
- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/downloads)

#### Verify Installation
```bash
# Check Python version
python --version
# Should show Python 3.8 or higher

# Check Node.js version
node --version
# Should show v18 or higher

# Check Git
git --version
# Should show Git version
```

### Step 2: Clone ALwrity Repository (5 minutes)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AJaySi/ALwrity.git
   cd ALwrity
   ```

2. **Verify the download**:
   You should see folders: `backend`, `frontend`, `docs`, etc.

3. **Check the structure**:
   ```bash
   ls -la
   # Should show backend/, frontend/, docs/, etc.
   ```

### Step 3: Backend Setup (30 minutes)

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
1. **Copy the template**:
   ```bash
   cp env_template.txt .env
   ```

2. **Edit the `.env` file** with your API keys:
   ```bash
   # Required API Keys
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional but recommended
   TAVILY_API_KEY=your_tavily_api_key_here
   SERPER_API_KEY=your_serper_api_key_here
   
   # Database (default is fine)
   DATABASE_URL=sqlite:///./alwrity.db
   
   # Security
   SECRET_KEY=your_secret_key_here
   ```

#### Get Your API Keys

**Gemini API Key** (Required):
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into your `.env` file

**OpenAI API Key** (Required):
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste into your `.env` file

#### Start the Backend Server
```bash
python start_alwrity_backend.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 4: Make Your First API Call (10 minutes)

#### Option A: Using cURL

```bash
# Test API connection
curl -X GET "https://api.alwrity.com/v1/health" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

#### Option B: Using Python

```python
import requests

# Set up your API key
API_KEY = "your_api_key_here"
BASE_URL = "https://api.alwrity.com/v1"

# Test API connection
response = requests.get(
    f"{BASE_URL}/health",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

#### Option C: Using JavaScript

```javascript
// Set up your API key
const API_KEY = "your_api_key_here";
const BASE_URL = "https://api.alwrity.com/v1";

// Test API connection
fetch(`${BASE_URL}/health`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));
```

### Step 5: Create Your First Content (8 minutes)

#### Generate a Blog Post

```python
import requests

# Set up your API key
API_KEY = "your_api_key_here"
BASE_URL = "https://api.alwrity.com/v1"

# Create content request
content_request = {
    "type": "blog_post",
    "topic": "Getting Started with ALwrity API",
    "key_points": [
        "What is ALwrity API",
        "How to get started",
        "Basic API usage",
        "Next steps"
    ],
    "tone": "professional",
    "length": "medium",
    "seo_optimized": True
}

# Make API call
response = requests.post(
    f"{BASE_URL}/content/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json=content_request
)

if response.status_code == 200:
    content = response.json()
    print("Generated content:")
    print(content["data"]["content"])
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

#### Generate Social Media Content

```python
# Create social media content request
social_request = {
    "type": "social_media",
    "platform": "linkedin",
    "topic": "ALwrity API Launch",
    "tone": "professional",
    "include_hashtags": True,
    "include_cta": True
}

# Make API call
response = requests.post(
    f"{BASE_URL}/content/generate",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json=social_request
)

if response.status_code == 200:
    content = response.json()
    print("Generated social media content:")
    print(content["data"]["content"])
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

## 🔧 API Structure Overview

### Base URL
```
https://api.alwrity.com/v1
```

### Authentication
All API requests require authentication using your API key:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Common Endpoints

#### Content Generation
```bash
POST /content/generate
POST /content/generate/batch
GET /content/{content_id}
PUT /content/{content_id}
DELETE /content/{content_id}
```

#### Persona Management
```bash
GET /personas
POST /personas
GET /personas/{persona_id}
PUT /personas/{persona_id}
DELETE /personas/{persona_id}
```

#### Analytics
```bash
GET /analytics/usage
GET /analytics/performance
GET /analytics/content/{content_id}
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "request_id": "req_1234567890",
    "timestamp": "2024-01-15T10:30:00Z",
    "rate_limit": {
      "limit": 1000,
      "remaining": 999,
      "reset": 1642248600
    }
  }
}
```

## 🎯 Common Use Cases

### 1. Automated Blog Post Generation

```python
def generate_blog_post(topic, key_points):
    request_data = {
        "type": "blog_post",
        "topic": topic,
        "key_points": key_points,
        "tone": "professional",
        "length": "long",
        "seo_optimized": True,
        "include_research": True
    }
    
    response = requests.post(
        f"{BASE_URL}/content/generate",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=request_data
    )
    
    return response.json()["data"]["content"]
```

### 2. Social Media Content Automation

```python
def generate_social_content(platform, topic):
    request_data = {
        "type": "social_media",
        "platform": platform,
        "topic": topic,
        "tone": "engaging",
        "include_hashtags": True,
        "include_cta": True
    }
    
    response = requests.post(
        f"{BASE_URL}/content/generate",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=request_data
    )
    
    return response.json()["data"]["content"]
```

### 3. Batch Content Generation

```python
def generate_multiple_posts(topics):
    request_data = {
        "type": "blog_post",
        "topics": topics,
        "tone": "professional",
        "length": "medium",
        "seo_optimized": True
    }
    
    response = requests.post(
        f"{BASE_URL}/content/generate/batch",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=request_data
    )
    
    return response.json()["data"]["content"]
```

## 🚨 Error Handling

### Common Error Codes

```python
def handle_api_response(response):
    if response.status_code == 200:
        return response.json()["data"]
    elif response.status_code == 401:
        raise Exception("Invalid API key")
    elif response.status_code == 429:
        raise Exception("Rate limit exceeded")
    elif response.status_code == 400:
        raise Exception(f"Bad request: {response.json()['error']}")
    elif response.status_code == 500:
        raise Exception("Internal server error")
    else:
        raise Exception(f"Unexpected error: {response.status_code}")
```

### Rate Limiting

ALwrity API has rate limits to ensure fair usage:

- **Free tier**: 100 requests per hour
- **Pro tier**: 1,000 requests per hour
- **Enterprise**: Custom limits

```python
import time

def make_api_call_with_retry(request_data, max_retries=3):
    for attempt in range(max_retries):
        response = requests.post(
            f"{BASE_URL}/content/generate",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=request_data
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            # Rate limited, wait and retry
            time.sleep(60)
            continue
        else:
            raise Exception(f"API error: {response.status_code}")
    
    raise Exception("Max retries exceeded")
```

## 🎉 Congratulations!

You've successfully:
- ✅ Set up your developer account
- ✅ Obtained your API keys
- ✅ Made your first API call
- ✅ Generated content via API
- ✅ Understood the API structure

## 🚀 Next Steps

### Immediate Actions (Today)
1. **[Build your first integration](integration-guide.md)** - Create a complete integration
2. **Test different content types** - Try blog posts, social media, emails
3. **Explore advanced features** - Use personas, analytics, webhooks
4. **Join the developer community** - Connect with other developers

### This Week
1. **[Implement advanced features](advanced-usage.md)** - Use webhooks and real-time updates
2. **Build error handling** - Implement robust error handling
3. **Add monitoring** - Track API usage and performance
4. **Test in staging** - Deploy to a staging environment

### This Month
1. **[Deploy to production](deployment.md)** - Deploy your integration
2. **[Optimize performance](performance-optimization.md)** - Improve speed and efficiency
3. **[Scale your integration](scaling.md)** - Handle more users and content
4. **[Contribute to the community](contributing.md)** - Share your integrations

## 🆘 Need Help?

### Common Questions

**Q: How do I handle API errors?**
A: Check the status code and error message. Implement retry logic for rate limits and temporary errors.

**Q: What's the difference between development and production API keys?**
A: Development keys have lower rate limits and are for testing. Production keys are for live applications.

**Q: How do I monitor my API usage?**
A: Use the `/analytics/usage` endpoint to track your API usage and remaining quota.

**Q: Can I use webhooks for real-time updates?**
A: Yes! ALwrity supports webhooks for real-time notifications about content generation and updates.

### Getting Support
- **[API Documentation](https://docs.alwrity.com/api)** - Complete API reference
- **[Code Examples](https://github.com/alwrity/examples)** - Sample integrations
- **[Developer Community](https://github.com/AJaySi/ALwrity/discussions)** - Ask questions and get help
- **[Email Support](mailto:developers@alwrity.com)** - Get personalized help

## 🎯 Success Tips

### For Best Results
1. **Use appropriate rate limiting** - Don't exceed your quota
2. **Implement error handling** - Handle all possible error cases
3. **Cache responses** - Cache content to reduce API calls
4. **Monitor usage** - Track your API usage and costs

### Common Mistakes to Avoid
1. **Don't hardcode API keys** - Use environment variables
2. **Don't ignore rate limits** - Implement proper rate limiting
3. **Don't skip error handling** - Always handle API errors
4. **Don't forget to test** - Test your integration thoroughly

## 🎉 Ready for More?

**[Build your first integration →](integration-guide.md)**

---

*Questions? [Join our developer community](https://github.com/AJaySi/ALwrity/discussions) or [contact developer support](mailto:developers@alwrity.com)!*
