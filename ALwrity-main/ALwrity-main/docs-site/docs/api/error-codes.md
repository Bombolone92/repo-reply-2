# API Error Codes

This comprehensive reference covers all error codes returned by the ALwrity API, including descriptions, possible causes, and recommended solutions.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details",
      "suggestion": "Recommended action"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

## HTTP Status Codes

### 4xx Client Errors

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid request format |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |

### 5xx Server Errors

| Status | Description |
|--------|-------------|
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - Upstream service error |
| 503 | Service Unavailable - Service temporarily down |
| 504 | Gateway Timeout - Request timeout |

## Authentication Errors

### INVALID_API_KEY

**Status**: 401 Unauthorized

**Description**: The provided API key is invalid, expired, or malformed.

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired",
    "details": {
      "key_id": "key_123456789",
      "suggestion": "Please check your API key or generate a new one"
    }
  }
}
```

**Causes**:
- API key is incorrect
- API key has expired
- API key format is invalid

**Solutions**:
- Verify API key is correct
- Generate a new API key
- Check API key format

### MISSING_API_KEY

**Status**: 401 Unauthorized

**Description**: No API key provided in the request.

```json
{
  "error": {
    "code": "MISSING_API_KEY",
    "message": "API key is required for authentication",
    "details": {
      "header": "Authorization: Bearer YOUR_API_KEY",
      "suggestion": "Include your API key in the Authorization header"
    }
  }
}
```

**Causes**:
- Missing Authorization header
- Incorrect header format

**Solutions**:
- Add Authorization header
- Use correct Bearer token format

### INSUFFICIENT_PERMISSIONS

**Status**: 403 Forbidden

**Description**: API key doesn't have required permissions.

```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "API key does not have required permissions",
    "details": {
      "required": ["write"],
      "granted": ["read"],
      "suggestion": "Upgrade your API key permissions or use a different key"
    }
  }
}
```

**Causes**:
- API key has read-only permissions
- Trying to perform write operation
- Key doesn't have specific feature access

**Solutions**:
- Use API key with write permissions
- Request permission upgrade
- Use appropriate key for operation

## Rate Limiting Errors

### RATE_LIMIT_EXCEEDED

**Status**: 429 Too Many Requests

**Description**: Request rate limit exceeded.

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 60,
      "remaining": 0,
      "reset_time": "2024-01-15T10:31:00Z",
      "retry_after": 60,
      "suggestion": "Wait 60 seconds before retrying or upgrade your plan"
    }
  }
}
```

**Causes**:
- Too many requests in time window
- Exceeded daily quota
- High resource usage

**Solutions**:
- Wait for rate limit reset
- Implement exponential backoff
- Upgrade to higher plan
- Optimize request frequency

### QUOTA_EXCEEDED

**Status**: 429 Too Many Requests

**Description**: Daily or monthly quota exceeded.

```json
{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Daily quota exceeded",
    "details": {
      "quota_type": "daily",
      "limit": 1000,
      "used": 1000,
      "reset_time": "2024-01-16T00:00:00Z",
      "suggestion": "Wait until quota resets or upgrade your plan"
    }
  }
}
```

**Causes**:
- Daily request limit reached
- Monthly quota exceeded
- Feature-specific quota exceeded

**Solutions**:
- Wait for quota reset
- Upgrade plan for higher limits
- Optimize API usage
- Use caching to reduce requests

## Validation Errors

### VALIDATION_ERROR

**Status**: 422 Unprocessable Entity

**Description**: Request validation failed.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "topic",
      "message": "Topic is required and must be at least 3 characters",
      "suggestion": "Provide a valid topic with at least 3 characters"
    }
  }
}
```

**Causes**:
- Missing required fields
- Invalid field values
- Field format errors
- Value constraints violated

**Solutions**:
- Check required fields
- Validate field formats
- Ensure values meet constraints
- Review API documentation

### INVALID_REQUEST_FORMAT

**Status**: 400 Bad Request

**Description**: Request format is invalid.

```json
{
  "error": {
    "code": "INVALID_REQUEST_FORMAT",
    "message": "Request body must be valid JSON",
    "details": {
      "content_type": "application/json",
      "suggestion": "Ensure request body is valid JSON with correct Content-Type header"
    }
  }
}
```

**Causes**:
- Invalid JSON format
- Missing Content-Type header
- Incorrect content type
- Malformed request body

**Solutions**:
- Validate JSON format
- Set correct Content-Type header
- Check request body structure
- Use proper encoding

## Content Generation Errors

### CONTENT_GENERATION_FAILED

**Status**: 500 Internal Server Error

**Description**: Content generation process failed.

```json
{
  "error": {
    "code": "CONTENT_GENERATION_FAILED",
    "message": "Failed to generate content",
    "details": {
      "reason": "AI service timeout",
      "suggestion": "Try again with a shorter content length or contact support"
    }
  }
}
```

**Causes**:
- AI service timeout
- Content too long
- Invalid parameters
- Service overload

**Solutions**:
- Reduce content length
- Retry request
- Check parameters
- Contact support

### CONTENT_TOO_LONG

**Status**: 422 Unprocessable Entity

**Description**: Content exceeds maximum length limit.

```json
{
  "error": {
    "code": "CONTENT_TOO_LONG",
    "message": "Content exceeds maximum length limit",
    "details": {
      "max_length": 10000,
      "provided_length": 15000,
      "suggestion": "Reduce content length to 10,000 characters or less"
    }
  }
}
```

**Causes**:
- Content exceeds character limit
- Word count too high
- Input text too long

**Solutions**:
- Reduce content length
- Split into multiple requests
- Use appropriate limits
- Check content size

### INVALID_CONTENT_TYPE

**Status**: 422 Unprocessable Entity

**Description**: Invalid content type specified.

```json
{
  "error": {
    "code": "INVALID_CONTENT_TYPE",
    "message": "Invalid content type specified",
    "details": {
      "provided": "invalid_type",
      "valid_types": ["blog_post", "social_media", "email", "article"],
      "suggestion": "Use one of the valid content types"
    }
  }
}
```

**Causes**:
- Unsupported content type
- Typo in content type
- Missing content type

**Solutions**:
- Use valid content type
- Check spelling
- Review documentation
- Use default type

## Research and SEO Errors

### RESEARCH_FAILED

**Status**: 500 Internal Server Error

**Description**: Research process failed.

```json
{
  "error": {
    "code": "RESEARCH_FAILED",
    "message": "Failed to perform research",
    "details": {
      "reason": "External service unavailable",
      "suggestion": "Try again later or use cached research data"
    }
  }
}
```

**Causes**:
- External service down
- Network connectivity issues
- Research service timeout
- Invalid research parameters

**Solutions**:
- Retry request
- Check network connection
- Use cached data
- Contact support

### SEO_ANALYSIS_FAILED

**Status**: 500 Internal Server Error

**Description**: SEO analysis failed.

```json
{
  "error": {
    "code": "SEO_ANALYSIS_FAILED",
    "message": "Failed to perform SEO analysis",
    "details": {
      "reason": "Content parsing error",
      "suggestion": "Ensure content is properly formatted and try again"
    }
  }
}
```

**Causes**:
- Content parsing issues
- Invalid HTML format
- Missing content elements
- Analysis service error

**Solutions**:
- Check content format
- Ensure valid HTML
- Retry analysis
- Contact support

## Resource Errors

### RESOURCE_NOT_FOUND

**Status**: 404 Not Found

**Description**: Requested resource not found.

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Requested resource not found",
    "details": {
      "resource_type": "content",
      "resource_id": "content_123456789",
      "suggestion": "Check resource ID or create new resource"
    }
  }
}
```

**Causes**:
- Invalid resource ID
- Resource deleted
- Resource not accessible
- Wrong resource type

**Solutions**:
- Verify resource ID
- Check resource exists
- Ensure proper permissions
- Use correct resource type

### RESOURCE_CONFLICT

**Status**: 409 Conflict

**Description**: Resource conflict detected.

```json
{
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "Resource conflict detected",
    "details": {
      "conflict_type": "duplicate_name",
      "existing_resource": "content_123456789",
      "suggestion": "Use a different name or update existing resource"
    }
  }
}
```

**Causes**:
- Duplicate resource name
- Concurrent modification
- Resource already exists
- Version conflict

**Solutions**:
- Use unique name
- Check for existing resources
- Handle concurrency
- Resolve version conflicts

## Service Errors

### SERVICE_UNAVAILABLE

**Status**: 503 Service Unavailable

**Description**: Service temporarily unavailable.

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable",
    "details": {
      "reason": "Maintenance in progress",
      "estimated_recovery": "2024-01-15T12:00:00Z",
      "suggestion": "Try again after the estimated recovery time"
    }
  }
}
```

**Causes**:
- Scheduled maintenance
- Service overload
- Infrastructure issues
- Planned downtime

**Solutions**:
- Wait for service recovery
- Check status page
- Retry after delay
- Contact support

### INTERNAL_SERVER_ERROR

**Status**: 500 Internal Server Error

**Description**: Internal server error occurred.

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An internal server error occurred",
    "details": {
      "request_id": "req_123456789",
      "suggestion": "Retry the request or contact support if the issue persists"
    }
  }
}
```

**Causes**:
- Unexpected server error
- Database issues
- Third-party service failure
- Configuration problems

**Solutions**:
- Retry request
- Check status page
- Contact support
- Provide request ID

## Error Handling Best Practices

### Client-Side Handling

```python
import requests
import time

def handle_api_error(response):
    """Handle API errors with appropriate actions."""
    
    if response.status_code == 401:
        # Authentication error
        print("Authentication failed. Check your API key.")
        return None
    
    elif response.status_code == 429:
        # Rate limit error
        retry_after = response.headers.get('Retry-After', 60)
        print(f"Rate limited. Retrying in {retry_after} seconds...")
        time.sleep(int(retry_after))
        return "retry"
    
    elif response.status_code == 422:
        # Validation error
        error_data = response.json()
        print(f"Validation error: {error_data['error']['message']}")
        return None
    
    elif response.status_code >= 500:
        # Server error
        print("Server error. Please try again later.")
        return "retry"
    
    else:
        # Other errors
        print(f"Unexpected error: {response.status_code}")
        return None
```

### Retry Logic

```python
def make_request_with_retry(url, headers, data, max_retries=3):
    """Make API request with retry logic."""
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                return response.json()
            
            # Handle specific errors
            result = handle_api_error(response)
            
            if result == "retry" and attempt < max_retries - 1:
                continue
            elif result is None:
                return None
            else:
                return response.json()
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise
    
    return None
```

### Logging and Monitoring

```python
import logging

def log_api_error(error_data, request_id=None):
    """Log API errors for monitoring and debugging."""
    
    logger = logging.getLogger('alwrity_api')
    
    error_info = {
        'error_code': error_data.get('code'),
        'error_message': error_data.get('message'),
        'request_id': request_id,
        'timestamp': error_data.get('timestamp')
    }
    
    logger.error(f"API Error: {error_info}")
    
    # Send to monitoring service
    send_to_monitoring(error_info)
```

## Troubleshooting Guide

### Common Issues

#### Authentication Problems
1. **Check API key format**: Ensure proper Bearer token format
2. **Verify key validity**: Check if key is active and not expired
3. **Check permissions**: Ensure key has required permissions
4. **Test with simple request**: Use health check endpoint

#### Rate Limiting Issues
1. **Monitor usage**: Track your API usage patterns
2. **Implement backoff**: Use exponential backoff for retries
3. **Optimize requests**: Reduce unnecessary API calls
4. **Consider upgrading**: Evaluate if you need higher limits

#### Validation Errors
1. **Check required fields**: Ensure all required fields are provided
2. **Validate formats**: Check field formats and constraints
3. **Review documentation**: Verify parameter requirements
4. **Test with minimal data**: Start with simple requests

### Getting Help

- **API Documentation**: Check endpoint-specific documentation
- **Status Page**: Monitor service status and incidents
- **Support**: Contact support for persistent issues
- **Community**: Join developer community for help
- **GitHub Issues**: Report bugs and request features

---

*Need help with API errors? [Contact Support](https://support.alwrity.com) or [Check our Status Page](https://status.alwrity.com) for service updates!*
