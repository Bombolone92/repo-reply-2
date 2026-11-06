# API Rate Limiting

ALwrity implements rate limiting to ensure fair usage and maintain service quality for all users. This guide explains how rate limiting works and how to handle rate limits in your applications.

## Rate Limiting Overview

### Purpose

Rate limiting helps:
- **Prevent abuse**: Protect against excessive API usage
- **Ensure fairness**: Provide equal access to all users
- **Maintain performance**: Keep the service responsive
- **Control costs**: Manage infrastructure costs

### How It Works

Rate limits are applied per API key and are based on:
- **Time windows**: Requests per minute, hour, or day
- **User plan**: Different limits for different subscription tiers
- **Endpoint type**: Some endpoints have specific limits
- **Resource usage**: Limits based on computational resources

## Rate Limit Types

### Request Rate Limits

#### Per Minute Limits
- **Free Plan**: 10 requests per minute
- **Basic Plan**: 60 requests per minute
- **Pro Plan**: 300 requests per minute
- **Enterprise Plan**: 1,000 requests per minute

#### Per Day Limits
- **Free Plan**: 100 requests per day
- **Basic Plan**: 1,000 requests per day
- **Pro Plan**: 10,000 requests per day
- **Enterprise Plan**: 100,000 requests per day

### Resource-Based Limits

#### Content Generation
- **Word Count**: Limits based on content length
- **Processing Time**: Limits based on computational complexity
- **Concurrent Requests**: Limits on simultaneous processing

#### Data Usage
- **Research Queries**: Limits on research API calls
- **Image Generation**: Limits on image processing
- **SEO Analysis**: Limits on analysis requests

## Rate Limit Headers

### Standard Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60
```

### Header Descriptions

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `X-RateLimit-Window` | Time window in seconds |

### Example Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60

{
  "success": true,
  "data": {
    "content": "Generated content here..."
  }
}
```

## Rate Limit Responses

### 429 Too Many Requests

When rate limits are exceeded, the API returns a 429 status code:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 60,
      "remaining": 0,
      "reset_time": "2024-01-15T10:31:00Z",
      "retry_after": 60
    }
  }
}
```

### Retry-After Header

The `Retry-After` header indicates when you can retry:

```http
Retry-After: 60  # Seconds until retry
```

## Handling Rate Limits

### Exponential Backoff

Implement exponential backoff for retries:

```python
import time
import random
import requests

def make_request_with_backoff(url, headers, data, max_retries=3):
    base_delay = 1
    max_delay = 60
    
    for attempt in range(max_retries):
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 429:
            # Get retry delay from header or calculate
            retry_after = int(response.headers.get('Retry-After', base_delay))
            
            # Add jitter to prevent thundering herd
            jitter = random.uniform(0.1, 0.5)
            delay = min(retry_after + jitter, max_delay)
            
            print(f"Rate limited. Retrying in {delay:.1f} seconds...")
            time.sleep(delay)
            
            # Exponential backoff for next attempt
            base_delay *= 2
        else:
            return response
    
    raise Exception("Max retries exceeded")
```

### Request Queuing

Implement request queuing to manage rate limits:

```python
import asyncio
import aiohttp
from asyncio import Semaphore

class RateLimitedClient:
    def __init__(self, rate_limit=60, time_window=60):
        self.semaphore = Semaphore(rate_limit)
        self.time_window = time_window
        self.requests = []
    
    async def make_request(self, url, headers, data):
        async with self.semaphore:
            # Clean old requests
            current_time = time.time()
            self.requests = [req_time for req_time in self.requests 
                           if current_time - req_time < self.time_window]
            
            # Wait if at limit
            if len(self.requests) >= self.semaphore._value:
                sleep_time = self.time_window - (current_time - self.requests[0])
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
            
            # Make request
            self.requests.append(current_time)
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=data) as response:
                    return await response.json()
```

### Caching Responses

Cache responses to reduce API calls:

```python
import time
from functools import wraps

def cache_with_ttl(ttl_seconds):
    def decorator(func):
        cache = {}
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key
            key = str(args) + str(sorted(kwargs.items()))
            
            # Check cache
            if key in cache:
                data, timestamp = cache[key]
                if time.time() - timestamp < ttl_seconds:
                    return data
            
            # Make API call
            result = func(*args, **kwargs)
            
            # Cache result
            cache[key] = (result, time.time())
            
            return result
        
        return wrapper
    return decorator

# Usage
@cache_with_ttl(300)  # Cache for 5 minutes
def get_blog_content(topic, word_count):
    # API call here
    pass
```

## Rate Limit Monitoring

### Track Usage

Monitor your rate limit usage:

```python
class RateLimitMonitor:
    def __init__(self):
        self.usage_history = []
    
    def track_request(self, response):
        headers = response.headers
        
        usage = {
            'timestamp': time.time(),
            'limit': int(headers.get('X-RateLimit-Limit', 0)),
            'remaining': int(headers.get('X-RateLimit-Remaining', 0)),
            'reset': int(headers.get('X-RateLimit-Reset', 0))
        }
        
        self.usage_history.append(usage)
        
        # Alert if approaching limit
        if usage['remaining'] < usage['limit'] * 0.1:  # Less than 10% remaining
            self.send_alert(usage)
    
    def send_alert(self, usage):
        print(f"Warning: Only {usage['remaining']} requests remaining!")
```

### Usage Analytics

Analyze your API usage patterns:

```python
def analyze_usage(usage_history):
    if not usage_history:
        return
    
    # Calculate average usage
    total_requests = sum(1 for _ in usage_history)
    avg_remaining = sum(u['remaining'] for u in usage_history) / len(usage_history)
    
    # Find peak usage times
    peak_times = [u['timestamp'] for u in usage_history if u['remaining'] < 10]
    
    # Calculate utilization
    utilization = (usage_history[0]['limit'] - avg_remaining) / usage_history[0]['limit']
    
    return {
        'total_requests': total_requests,
        'average_remaining': avg_remaining,
        'peak_times': peak_times,
        'utilization_percentage': utilization * 100
    }
```

## Best Practices

### Efficient API Usage

1. **Batch Requests**: Combine multiple operations when possible
2. **Cache Responses**: Cache frequently accessed data
3. **Optimize Queries**: Use specific parameters to reduce processing
4. **Monitor Usage**: Track your rate limit consumption
5. **Plan Ahead**: Consider rate limits in your application design

### Error Handling

1. **Implement Backoff**: Use exponential backoff for retries
2. **Handle 429 Errors**: Properly handle rate limit responses
3. **Monitor Headers**: Check rate limit headers in responses
4. **Queue Requests**: Implement request queuing for high-volume usage
5. **Graceful Degradation**: Provide fallbacks when rate limited

### Application Design

1. **Async Processing**: Use asynchronous requests when possible
2. **Request Prioritization**: Prioritize important requests
3. **Load Balancing**: Distribute requests across time
4. **Circuit Breakers**: Implement circuit breakers for failures
5. **Monitoring**: Monitor rate limit usage and errors

## Rate Limit by Endpoint

### Content Generation Endpoints

| Endpoint | Free | Basic | Pro | Enterprise |
|----------|------|-------|-----|------------|
| `/api/blog-writer` | 5/min | 30/min | 150/min | 500/min |
| `/api/linkedin-writer` | 5/min | 30/min | 150/min | 500/min |
| `/api/seo-dashboard/analyze` | 10/min | 60/min | 300/min | 1000/min |

### Research Endpoints

| Endpoint | Free | Basic | Pro | Enterprise |
|----------|------|-------|-----|------------|
| `/api/research` | 5/min | 20/min | 100/min | 300/min |
| `/api/keywords/research` | 10/min | 50/min | 200/min | 500/min |

### Analytics Endpoints

| Endpoint | Free | Basic | Pro | Enterprise |
|----------|------|-------|-----|------------|
| `/api/analytics` | 20/min | 100/min | 500/min | 1000/min |
| `/api/performance` | 10/min | 50/min | 200/min | 500/min |

## Upgrading Plans

### When to Upgrade

Consider upgrading if you:
- **Hit rate limits frequently**: Consistently exceed your limits
- **Need higher throughput**: Require more requests per minute
- **Have growing usage**: Usage is increasing over time
- **Need priority support**: Require dedicated support

### Plan Comparison

| Feature | Free | Basic | Pro | Enterprise |
|---------|------|-------|-----|------------|
| Requests/min | 10 | 60 | 300 | 1,000 |
| Requests/day | 100 | 1,000 | 10,000 | 100,000 |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| Custom Limits | ❌ | ❌ | ❌ | ✅ |
| SLA | ❌ | ❌ | ✅ | ✅ |

## Troubleshooting

### Common Issues

#### Frequent Rate Limiting
- **Check usage patterns**: Analyze when you hit limits
- **Optimize requests**: Reduce unnecessary API calls
- **Implement caching**: Cache responses to reduce calls
- **Consider upgrading**: Evaluate if you need a higher plan

#### Inconsistent Limits
- **Check endpoint limits**: Some endpoints have different limits
- **Verify plan**: Ensure you're on the expected plan
- **Contact support**: Reach out if limits seem incorrect

#### Performance Issues
- **Monitor response times**: Check if rate limiting affects performance
- **Implement queuing**: Use request queuing for better performance
- **Optimize code**: Improve request efficiency

### Getting Help

- **Documentation**: Check API documentation for specific limits
- **Support**: Contact support for rate limit questions
- **Community**: Join developer community for best practices
- **Status Page**: Check for any service issues

---

*Need help with rate limiting? [Contact Support](https://support.alwrity.com) or [Upgrade Your Plan](https://dashboard.alwrity.com/billing) for higher limits!*
