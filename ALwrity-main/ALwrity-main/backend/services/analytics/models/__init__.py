"""
Analytics Models Package

Contains data models and type definitions for the analytics system.
"""

from .analytics_data import AnalyticsData
from .platform_types import PlatformType, AnalyticsStatus, PlatformConnectionStatus

__all__ = [
    'AnalyticsData',
    'PlatformType', 
    'AnalyticsStatus',
    'PlatformConnectionStatus'
]
