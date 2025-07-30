import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Zap, 
  Database, 
  Image, 
  Clock, 
  HardDrive, 
  Wifi, 
  Eye, 
  EyeOff,
  RefreshCw,
  Gauge,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  getMemoryUsage, 
  analyzeBundleSize, 
  imagePreloader, 
  requestOptimizer, 
  performanceMetrics 
} from '@/lib/performance-utils';

interface PerformanceData {
  memory: ReturnType<typeof getMemoryUsage>;
  bundle: ReturnType<typeof analyzeBundleSize>;
  imageStats: ReturnType<typeof imagePreloader.getStats>;
  cacheStats: ReturnType<typeof requestOptimizer.getCacheStats>;
  renderTime: number;
  fps: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible: initialVisible = false,
  position = 'bottom-right',
  compact = false,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(compact);

  // FPS calculation
  const [fps, setFps] = useState(60);
  const [lastTime, setLastTime] = useState(performance.now());
  const [frameCount, setFrameCount] = useState(0);

  // Calculate FPS
  useEffect(() => {
    let animationId: number;
    
    const calculateFPS = (currentTime: number) => {
      setFrameCount(prev => prev + 1);
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        setFrameCount(0);
        setLastTime(currentTime);
      }
      
      animationId = requestAnimationFrame(calculateFPS);
    };
    
    if (isVisible) {
      animationId = requestAnimationFrame(calculateFPS);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, lastTime, frameCount]);

  // Collect performance data
  useEffect(() => {
    if (!isVisible) return;

    const collectData = () => {
      const startTime = performance.now();
      
      const newData: PerformanceData = {
        memory: getMemoryUsage(),
        bundle: analyzeBundleSize(),
        imageStats: imagePreloader.getStats(),
        cacheStats: requestOptimizer.getCacheStats(),
        renderTime: performance.now() - startTime,
        fps,
      };
      
      setData(newData);
    };

    collectData();
    const interval = setInterval(collectData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isVisible, fps]);

  const getPositionClasses = () => {
    const base = 'fixed z-[9999] m-4';
    
    switch (position) {
      case 'top-left': return `${base} top-0 left-0`;
      case 'top-right': return `${base} top-0 right-0`;
      case 'bottom-left': return `${base} bottom-0 left-0`;
      case 'bottom-right': return `${base} bottom-0 right-0`;
      default: return `${base} bottom-0 right-0`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const calculatePerformanceScore = (): number => {
    if (!data) return 0;
    
    let score = 100;
    
    // Memory usage impact
    if (data.memory) {
      const memoryUsage = (data.memory.used / data.memory.total) * 100;
      if (memoryUsage > 80) score -= 20;
      else if (memoryUsage > 60) score -= 10;
    }
    
    // FPS impact
    if (data.fps < 30) score -= 30;
    else if (data.fps < 50) score -= 15;
    
    // Bundle size impact
    const bundleSizeMB = data.bundle.totalSize / 1024 / 1024;
    if (bundleSizeMB > 5) score -= 20;
    else if (bundleSizeMB > 3) score -= 10;
    
    return Math.max(0, Math.round(score));
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        size="sm"
        className={`${getPositionClasses()} bg-gray-800/90 hover:bg-gray-700/90 text-white border border-gray-600`}
      >
        <Monitor className="w-4 h-4" />
      </Button>
    );
  }

  if (isCollapsed) {
    const score = calculatePerformanceScore();
    
    return (
      <div className={getPositionClasses()}>
        <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Gauge className={`w-4 h-4 ${getScoreColor(score)}`} />
              <span className={`font-mono text-sm ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-gray-400 text-xs">
                {data?.fps || 0} FPS
              </span>
              <Button
                onClick={() => setIsCollapsed(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={getPositionClasses()}>
      <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm w-80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Performance Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className={`text-xs ${getScoreColor(calculatePerformanceScore())}`}>
                Score: {calculatePerformanceScore()}
              </Badge>
              <Button
                onClick={() => setIsCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 text-xs">
          {/* FPS & Render Performance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-300">FPS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
                {data?.fps || 0}
              </span>
              <span className="text-gray-500">/ 60</span>
            </div>
          </div>

          {/* Memory Usage */}
          {data?.memory && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300">Memory</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-400">{data.memory.used}MB</span>
                <span className="text-gray-500">/ {data.memory.total}MB</span>
              </div>
            </div>
          )}

          {/* Bundle Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-3 h-3 text-purple-400" />
              <span className="text-gray-300">Bundle</span>
            </div>
            <span className="text-purple-400">
              {(data?.bundle.totalSize / 1024 / 1024).toFixed(1)}MB
            </span>
          </div>

          {/* Image Loading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image className="w-3 h-3 text-green-400" />
              <span className="text-gray-300">Images</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-400">{data?.imageStats.loaded || 0}</span>
              <span className="text-gray-500">loaded</span>
              {(data?.imageStats.loading || 0) > 0 && (
                <span className="text-yellow-400">+{data?.imageStats.loading}</span>
              )}
            </div>
          </div>

          {/* Cache Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-300">Cache</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-cyan-400">{data?.cacheStats.size || 0}</span>
              <span className="text-gray-500">entries</span>
            </div>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-orange-400" />
              <span className="text-gray-300">Render</span>
            </div>
            <span className="text-orange-400">
              {data?.renderTime.toFixed(1)}ms
            </span>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  requestOptimizer.clearCache();
                  imagePreloader.getStats(); // Refresh stats
                }}
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-gray-600 text-gray-300 hover:text-white"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear Cache
              </Button>
              <Button
                onClick={() => {
                  if (window.gc) {
                    window.gc();
                  }
                }}
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-gray-600 text-gray-300 hover:text-white"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Force GC
              </Button>
            </div>
          </div>

          {/* Warnings */}
          {data && (
            <>
              {data.fps < 30 && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-2 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Low FPS detected</span>
                </div>
              )}
              
              {data.memory && (data.memory.used / data.memory.total) > 0.8 && (
                <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-500/10 p-2 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">High memory usage</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor; 