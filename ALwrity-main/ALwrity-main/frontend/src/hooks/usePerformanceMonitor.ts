import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor memory usage if available
    const getMemoryUsage = () => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
      }
      return undefined;
    };

    const measurePerformance = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      setMetrics({
        loadTime,
        renderTime: loadTime,
        memoryUsage: getMemoryUsage()
      });

      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance metrics for ${componentName}:`, {
          loadTime: `${loadTime.toFixed(2)}ms`,
          memoryUsage: getMemoryUsage() ? `${getMemoryUsage()?.toFixed(2)}MB` : 'N/A'
        });
      }
    };

    // Use requestAnimationFrame to measure after render
    const rafId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [componentName]);

  return metrics;
};

export default usePerformanceMonitor;
