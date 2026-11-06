"""
WordPress Content Management Module
Handles content creation, media upload, and publishing to WordPress sites.
"""

import os
import json
import base64
import mimetypes
import tempfile
from typing import Optional, Dict, List, Any, Union
from datetime import datetime
import requests
from requests.auth import HTTPBasicAuth
from PIL import Image
from loguru import logger


class WordPressContentManager:
    """Manages WordPress content operations including posts, media, and taxonomies."""
    
    def __init__(self, site_url: str, username: str, app_password: str):
        """Initialize with WordPress site credentials."""
        self.site_url = site_url.rstrip('/')
        self.username = username
        self.app_password = app_password
        self.api_base = f"{self.site_url}/wp-json/wp/v2"
        self.auth = HTTPBasicAuth(username, app_password)
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Make authenticated request to WordPress API."""
        try:
            url = f"{self.api_base}/{endpoint.lstrip('/')}"
            response = requests.request(method, url, auth=self.auth, **kwargs)
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"WordPress API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"WordPress API request error: {e}")
            return None
    
    def get_categories(self) -> List[Dict[str, Any]]:
        """Get all categories from WordPress site."""
        try:
            result = self._make_request('GET', 'categories', params={'per_page': 100})
            if result:
                logger.info(f"Retrieved {len(result)} categories from {self.site_url}")
                return result
            return []
            
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return []
    
    def get_tags(self) -> List[Dict[str, Any]]:
        """Get all tags from WordPress site."""
        try:
            result = self._make_request('GET', 'tags', params={'per_page': 100})
            if result:
                logger.info(f"Retrieved {len(result)} tags from {self.site_url}")
                return result
            return []
            
        except Exception as e:
            logger.error(f"Error getting tags: {e}")
            return []
    
    def create_category(self, name: str, description: str = "") -> Optional[Dict[str, Any]]:
        """Create a new category."""
        try:
            data = {
                'name': name,
                'description': description
            }
            result = self._make_request('POST', 'categories', json=data)
            if result:
                logger.info(f"Created category: {name}")
            return result
            
        except Exception as e:
            logger.error(f"Error creating category {name}: {e}")
            return None
    
    def create_tag(self, name: str, description: str = "") -> Optional[Dict[str, Any]]:
        """Create a new tag."""
        try:
            data = {
                'name': name,
                'description': description
            }
            result = self._make_request('POST', 'tags', json=data)
            if result:
                logger.info(f"Created tag: {name}")
            return result
            
        except Exception as e:
            logger.error(f"Error creating tag {name}: {e}")
            return None
    
    def get_or_create_category(self, name: str, description: str = "") -> Optional[int]:
        """Get existing category or create new one."""
        try:
            # First, try to find existing category
            categories = self.get_categories()
            for category in categories:
                if category['name'].lower() == name.lower():
                    logger.info(f"Found existing category: {name}")
                    return category['id']
            
            # Create new category if not found
            new_category = self.create_category(name, description)
            if new_category:
                return new_category['id']
            return None
            
        except Exception as e:
            logger.error(f"Error getting or creating category {name}: {e}")
            return None
    
    def get_or_create_tag(self, name: str, description: str = "") -> Optional[int]:
        """Get existing tag or create new one."""
        try:
            # First, try to find existing tag
            tags = self.get_tags()
            for tag in tags:
                if tag['name'].lower() == name.lower():
                    logger.info(f"Found existing tag: {name}")
                    return tag['id']
            
            # Create new tag if not found
            new_tag = self.create_tag(name, description)
            if new_tag:
                return new_tag['id']
            return None
            
        except Exception as e:
            logger.error(f"Error getting or creating tag {name}: {e}")
            return None
    
    def upload_media(self, file_path: str, alt_text: str = "", title: str = "", caption: str = "", description: str = "") -> Optional[Dict[str, Any]]:
        """Upload media file to WordPress."""
        try:
            if not os.path.exists(file_path):
                logger.error(f"Media file not found: {file_path}")
                return None
            
            # Get file info
            file_name = os.path.basename(file_path)
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                logger.error(f"Unable to determine MIME type for: {file_path}")
                return None
            
            # Prepare headers
            headers = {
                'Content-Disposition': f'attachment; filename="{file_name}"'
            }
            
            # Upload file
            with open(file_path, 'rb') as file:
                files = {'file': (file_name, file, mime_type)}
                response = requests.post(
                    f"{self.api_base}/media",
                    auth=self.auth,
                    headers=headers,
                    files=files
                )
            
            if response.status_code == 201:
                media_data = response.json()
                media_id = media_data['id']
                
                # Update media with metadata
                update_data = {
                    'alt_text': alt_text,
                    'title': title,
                    'caption': caption,
                    'description': description
                }
                
                update_response = requests.post(
                    f"{self.api_base}/media/{media_id}",
                    auth=self.auth,
                    json=update_data
                )
                
                if update_response.status_code == 200:
                    logger.info(f"Media uploaded successfully: {file_name}")
                    return update_response.json()
                else:
                    logger.warning(f"Media uploaded but metadata update failed: {update_response.text}")
                    return media_data
            else:
                logger.error(f"Media upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error uploading media {file_path}: {e}")
            return None
    
    def compress_image(self, image_path: str, quality: int = 85) -> str:
        """Compress image for better upload performance."""
        try:
            if not os.path.exists(image_path):
                raise ValueError(f"Image file not found: {image_path}")
            
            original_size = os.path.getsize(image_path)
            
            with Image.open(image_path) as img:
                img_format = img.format or 'JPEG'
                
                # Create temporary file
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f'.{img_format.lower()}')
                
                # Save with compression
                img.save(temp_file, format=img_format, quality=quality, optimize=True)
                compressed_size = os.path.getsize(temp_file.name)
                
                reduction = (1 - (compressed_size / original_size)) * 100
                logger.info(f"Image compressed: {original_size/1024:.2f}KB -> {compressed_size/1024:.2f}KB ({reduction:.1f}% reduction)")
                
                return temp_file.name
                
        except Exception as e:
            logger.error(f"Error compressing image {image_path}: {e}")
            return image_path  # Return original if compression fails
    
    def _test_connection(self) -> bool:
        """Test WordPress site connection."""
        try:
            # Test with a simple API call
            api_url = f"{self.api_base}/users/me"
            response = requests.get(api_url, auth=self.auth, timeout=10)
            
            if response.status_code == 200:
                logger.info(f"WordPress connection test successful for {self.site_url}")
                return True
            else:
                logger.warning(f"WordPress connection test failed for {self.site_url}: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"WordPress connection test error for {self.site_url}: {e}")
            return False
    
    def create_post(self, title: str, content: str, excerpt: str = "", 
                   featured_media_id: Optional[int] = None, 
                   categories: Optional[List[int]] = None,
                   tags: Optional[List[int]] = None,
                   status: str = 'draft',
                   meta: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Create a new WordPress post."""
        try:
            post_data = {
                'title': title,
                'content': content,
                'excerpt': excerpt,
                'status': status
            }
            
            if featured_media_id:
                post_data['featured_media'] = featured_media_id
            
            if categories:
                post_data['categories'] = categories
            
            if tags:
                post_data['tags'] = tags
            
            if meta:
                post_data['meta'] = meta
            
            result = self._make_request('POST', 'posts', json=post_data)
            if result:
                logger.info(f"Post created successfully: {title}")
            return result
            
        except Exception as e:
            logger.error(f"Error creating post {title}: {e}")
            return None
    
    def update_post(self, post_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        """Update an existing WordPress post."""
        try:
            result = self._make_request('POST', f'posts/{post_id}', json=kwargs)
            if result:
                logger.info(f"Post {post_id} updated successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error updating post {post_id}: {e}")
            return None
    
    def get_post(self, post_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific WordPress post."""
        try:
            result = self._make_request('GET', f'posts/{post_id}')
            return result
            
        except Exception as e:
            logger.error(f"Error getting post {post_id}: {e}")
            return None
    
    def delete_post(self, post_id: int, force: bool = False) -> bool:
        """Delete a WordPress post."""
        try:
            params = {'force': force} if force else {}
            result = self._make_request('DELETE', f'posts/{post_id}', params=params)
            if result:
                logger.info(f"Post {post_id} deleted successfully")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting post {post_id}: {e}")
            return False
