/**
 * Analytics API Service
 * 
 * Handles communication with the backend analytics endpoints for retrieving
 * platform analytics data from connected services like GSC, Wix, and WordPress.
 */

import { apiClient } from './client';

// Types
export interface AnalyticsMetrics {
  total_clicks?: number;
  total_impressions?: number;
  avg_ctr?: number;
  avg_position?: number;
  total_queries?: number;
  top_queries?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  top_pages?: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
  // Additional properties for Bing analytics
  connection_status?: string;
  connected_sites?: number;
  sites?: Array<{
    id?: string;
    name?: string;
    url?: string;
    Url?: string;  // Bing API uses uppercase Url
    status?: string;
    [key: string]: any;  // Allow additional properties
  }>;
  connected_since?: string;
  scope?: string;
  insights?: any;
  note?: string;
}

export interface PlatformAnalytics {
  platform: string;
  metrics: AnalyticsMetrics;
  date_range: {
    start: string;
    end: string;
  };
  last_updated: string;
  status: 'success' | 'error' | 'partial';
  error_message?: string;
  // Additional properties that may be present in analytics data
  connection_status?: string;
  sites?: Array<{
    id?: string;
    name?: string;
    url?: string;
    Url?: string;  // Bing API uses uppercase Url
    status?: string;
    [key: string]: any;  // Allow additional properties
  }>;
  connected_sites?: number;
  connected_since?: string;
  scope?: string;
  insights?: any;
  note?: string;
}

export interface AnalyticsSummary {
  total_platforms: number;
  connected_platforms: number;
  successful_data: number;
  total_clicks: number;
  total_impressions: number;
  overall_ctr: number;
  platforms: Record<string, {
    status: string;
    last_updated: string;
    metrics_count?: number;
    error?: string;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  data: Record<string, PlatformAnalytics>;
  summary: AnalyticsSummary;
  error?: string;
}

export interface PlatformConnectionStatus {
  connected: boolean;
  sites_count: number;
  sites: Array<{
    siteUrl?: string;
    name?: string;
    [key: string]: any;
  }>;
  error?: string;
}

export interface PlatformStatusResponse {
  success: boolean;
  platforms: Record<string, PlatformConnectionStatus>;
  total_connected: number;
}

class AnalyticsAPI {
  private baseUrl = '/api/analytics';

  /**
   * Get connection status for all platforms
   */
  async getPlatformStatus(): Promise<PlatformStatusResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/platforms`);
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting platform status:', error);
      throw error;
    }
  }

  /**
   * Get analytics data from connected platforms
   */
  async getAnalyticsData(platforms?: string[]): Promise<AnalyticsResponse> {
    try {
      let url = `${this.baseUrl}/data`;
      
      if (platforms && platforms.length > 0) {
        const platformsParam = platforms.join(',');
        url += `?platforms=${encodeURIComponent(platformsParam)}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting analytics data:', error);
      throw error;
    }
  }

  /**
   * Get analytics data using POST method
   */
  async getAnalyticsDataPost(platforms?: string[]): Promise<AnalyticsResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/data`, {
        platforms,
        date_range: null // Could be extended to support custom date ranges
      });
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting analytics data (POST):', error);
      throw error;
    }
  }

  /**
   * Get Google Search Console analytics specifically
   */
  async getGSCAnalytics(): Promise<PlatformAnalytics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/gsc`);
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting GSC analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics summary across all platforms
   */
  async getAnalyticsSummary(): Promise<{
    success: boolean;
    summary: AnalyticsSummary;
    platforms_connected: number;
    platforms_total: number;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/summary`);
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting analytics summary:', error);
      throw error;
    }
  }

  /**
   * Test endpoint - Get platform status without authentication
   */
  async getTestPlatformStatus(): Promise<PlatformStatusResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/test/status`);
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting test platform status:', error);
      throw error;
    }
  }

  /**
   * Test endpoint - Get mock analytics data without authentication
   */
  async getTestAnalyticsData(): Promise<AnalyticsResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/test/data`);
      return response.data;
    } catch (error) {
      console.error('Analytics API: Error getting test analytics data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsAPI = new AnalyticsAPI();
export default analyticsAPI;
