# WordPress Integration Service

A comprehensive WordPress integration service for ALwrity that enables seamless content publishing to WordPress sites.

## Architecture

### Core Components

1. **WordPressService** (`wordpress_service.py`)
   - Manages WordPress site connections
   - Handles site credentials and authentication
   - Provides site management operations

2. **WordPressContentManager** (`wordpress_content.py`)
   - Manages WordPress content operations
   - Handles media uploads and compression
   - Manages categories, tags, and posts
   - Provides WordPress REST API interactions

3. **WordPressPublisher** (`wordpress_publisher.py`)
   - High-level publishing service
   - Orchestrates content creation and publishing
   - Manages post references and tracking

## Features

### Site Management
- ✅ Connect multiple WordPress sites
- ✅ Site credential management
- ✅ Connection testing and validation
- ✅ Site disconnection

### Content Publishing
- ✅ Blog post creation and publishing
- ✅ Media upload with compression
- ✅ Category and tag management
- ✅ Featured image support
- ✅ SEO metadata (meta descriptions)
- ✅ Draft and published status control

### Advanced Features
- ✅ Image compression for better performance
- ✅ Automatic category/tag creation
- ✅ Post status management
- ✅ Post deletion and updates
- ✅ Publishing history tracking

## Database Schema

### WordPress Sites Table
```sql
CREATE TABLE wordpress_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    site_url TEXT NOT NULL,
    site_name TEXT,
    username TEXT NOT NULL,
    app_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, site_url)
);
```

### WordPress Posts Table
```sql
CREATE TABLE wordpress_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    site_id INTEGER NOT NULL,
    wp_post_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES wordpress_sites (id)
);
```

## Usage Examples

### Basic Site Connection
```python
from backend.services.integrations import WordPressService

wp_service = WordPressService()
success = wp_service.add_site(
    user_id="user123",
    site_url="https://mysite.com",
    site_name="My Blog",
    username="admin",
    app_password="xxxx-xxxx-xxxx-xxxx"
)
```

### Publishing Content
```python
from backend.services.integrations import WordPressPublisher

publisher = WordPressPublisher()
result = publisher.publish_blog_post(
    user_id="user123",
    site_id=1,
    title="My Blog Post",
    content="<p>This is my blog post content.</p>",
    excerpt="A brief excerpt",
    featured_image_path="/path/to/image.jpg",
    categories=["Technology", "AI"],
    tags=["wordpress", "automation"],
    status="publish"
)
```

### Content Management
```python
from backend.services.integrations import WordPressContentManager

content_manager = WordPressContentManager(
    site_url="https://mysite.com",
    username="admin",
    app_password="xxxx-xxxx-xxxx-xxxx"
)

# Upload media
media = content_manager.upload_media(
    file_path="/path/to/image.jpg",
    alt_text="Description",
    title="Image Title"
)

# Create post
post = content_manager.create_post(
    title="Post Title",
    content="<p>Post content</p>",
    featured_media_id=media['id'],
    status="draft"
)
```

## Authentication

WordPress integration uses **Application Passwords** for authentication:

1. Go to WordPress Admin → Users → Profile
2. Scroll down to "Application Passwords"
3. Create a new application password
4. Use the generated password for authentication

## Error Handling

All services include comprehensive error handling:
- Connection validation
- API response checking
- Graceful failure handling
- Detailed logging

## Logging

The service uses structured logging with different levels:
- `INFO`: Successful operations
- `WARNING`: Non-critical issues
- `ERROR`: Failed operations

## Security

- Credentials are stored securely in the database
- Application passwords are used instead of main passwords
- Connection testing before credential storage
- Proper authentication for all API calls
