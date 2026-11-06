"""
Analytics Data Models

Core data structures for analytics data across all platforms.
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional


@dataclass
class AnalyticsData:
    """Standardized analytics data structure for all platforms"""
    platform: str
    metrics: Dict[str, Any]
    date_range: Dict[str, str]
    last_updated: str
    status: str  # 'success', 'error', 'partial'
    error_message: Optional[str] = None
    
    def is_successful(self) -> bool:
        """Check if the analytics data was successfully retrieved"""
        return self.status == 'success'
    
    def is_partial(self) -> bool:
        """Check if the analytics data is partially available"""
        return self.status == 'partial'
    
    def has_error(self) -> bool:
        """Check if there was an error retrieving analytics data"""
        return self.status == 'error'
    
    def get_metric(self, key: str, default: Any = None) -> Any:
        """Get a specific metric value with fallback"""
        return self.metrics.get(key, default)
    
    def get_total_clicks(self) -> int:
        """Get total clicks across all platforms"""
        return self.get_metric('total_clicks', 0)
    
    def get_total_impressions(self) -> int:
        """Get total impressions across all platforms"""
        return self.get_metric('total_impressions', 0)
    
    def get_avg_ctr(self) -> float:
        """Get average click-through rate"""
        return self.get_metric('avg_ctr', 0.0)
    
    def get_avg_position(self) -> float:
        """Get average position in search results"""
        return self.get_metric('avg_position', 0.0)
