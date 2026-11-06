"""
Platform Types and Enums

Type definitions and constants for platform analytics.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from dataclasses import dataclass


class PlatformType(Enum):
    """Supported analytics platforms"""
    GSC = "gsc"
    BING = "bing"
    WORDPRESS = "wordpress"
    WIX = "wix"


class AnalyticsStatus(Enum):
    """Analytics data retrieval status"""
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"


@dataclass
class PlatformConnectionStatus:
    """Platform connection status information"""
    connected: bool
    sites_count: int
    sites: List[Dict[str, Any]]
    error: Optional[str] = None
    
    def has_sites(self) -> bool:
        """Check if platform has connected sites"""
        return self.sites_count > 0
    
    def get_first_site(self) -> Optional[Dict[str, Any]]:
        """Get the first connected site"""
        return self.sites[0] if self.sites else None


# Platform configuration constants
PLATFORM_CONFIG = {
    PlatformType.GSC: {
        "name": "Google Search Console",
        "description": "SEO performance and search analytics",
        "api_endpoint": "https://www.googleapis.com/webmasters/v3/sites",
        "cache_ttl": 3600,  # 1 hour
    },
    PlatformType.BING: {
        "name": "Bing Webmaster Tools", 
        "description": "Search performance and SEO insights",
        "api_endpoint": "https://ssl.bing.com/webmaster/api.svc/json",
        "cache_ttl": 3600,  # 1 hour
    },
    PlatformType.WORDPRESS: {
        "name": "WordPress.com",
        "description": "Content management and site analytics",
        "api_endpoint": "https://public-api.wordpress.com/rest/v1.1",
        "cache_ttl": 1800,  # 30 minutes
    },
    PlatformType.WIX: {
        "name": "Wix",
        "description": "Website builder and analytics",
        "api_endpoint": "https://www.wix.com/_api/wix-business-accounts",
        "cache_ttl": 1800,  # 30 minutes
    }
}

# Default platforms to include in comprehensive analytics
DEFAULT_PLATFORMS = [PlatformType.GSC, PlatformType.BING, PlatformType.WORDPRESS, PlatformType.WIX]

# Metrics that are common across platforms
COMMON_METRICS = [
    'total_clicks',
    'total_impressions', 
    'avg_ctr',
    'avg_position',
    'total_queries',
    'connection_status',
    'connected_sites',
    'last_updated'
]
