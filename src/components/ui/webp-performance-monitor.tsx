import { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { useWebPPerformance, useWebPMonitor } from '@/hooks/useWebPOptimizer';
import { webpConverter, WebPUtils } from '@/lib/webp-auto-converter';
import { Monitor, Zap, Package, TrendingUp, RefreshCw, X, Eye, EyeOff } from 'lucide-react';

interface WebPPerformanceMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoHide?: boolean;
}

/**
 * WebP Performance Monitor - Development Tool
 * Hiển thị real-time performance metrics và conversion logs
 */
export const WebPPerformanceMonitor = ({ 
  position = 'bottom-right',
  autoHide = false 
}: WebPPerformanceMonitorProps) => {
  const [isVisible, setIsVisible] = useState(!autoHide);
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics, clearCache, refresh } = useWebPPerformance();
  const { logs, clearLogs, isEnabled } = useWebPMonitor();

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !isEnabled) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className={`fixed ${positionClasses[position]} z-[9999] w-12 h-12 rounded-full bg-green-500/80 hover:bg-green-500 backdrop-blur-sm border border-green-400/50 p-0`}
        title="Show WebP Monitor"
      >
        <Package className="w-5 h-5 text-white" />
      </Button>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] w-80`}>
      <Card className="bg-gray-900/95 backdrop-blur-lg border-green-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Package className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">WebP Monitor</h3>
            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
              DEV
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="text-xs text-gray-400">Processed</div>
              <div className="text-lg font-bold text-green-400">{metrics.totalProcessed}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="text-xs text-gray-400">Savings</div>
              <div className="text-lg font-bold text-blue-400">{metrics.totalSavings}</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Load Time</span>
              <span className="text-green-400 font-medium">{metrics.avgLoadTime}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Cache Hit</span>
              <span className="text-blue-400 font-medium">{metrics.cacheHitRate}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Format</span>
              <span className="text-purple-400 font-medium">WebP Only</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-1">
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs border-gray-600 hover:border-gray-500"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={clearCache}
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs border-red-600/50 hover:border-red-500 text-red-400 hover:text-red-300"
            >
              Clear Cache
            </Button>
          </div>

          {/* Expanded View - Conversion Logs */}
          {isExpanded && (
            <div className="border-t border-gray-700/50 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-white">Recent Conversions</h4>
                <Button
                  onClick={clearLogs}
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1">
                {logs.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-2">
                    No conversions yet
                  </div>
                ) : (
                  logs.slice(0, 10).map((log, index) => (
                    <div 
                      key={index}
                      className={`text-xs p-2 rounded border-l-2 ${
                        log.action === 'convert' 
                          ? 'bg-green-500/10 border-green-500/50 text-green-300'
                          : log.action === 'error'
                          ? 'bg-red-500/10 border-red-500/50 text-red-300'
                          : 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">
                          {log.original.split('/').pop()}
                        </span>
                        <span className="text-xs opacity-60">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {log.action === 'convert' && (
                        <div className="text-xs opacity-75 mt-1">
                          → {log.optimized.split('/').pop()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* WebP Info */}
          <div className="border-t border-gray-700/50 pt-2">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Compression</span>
                <span className="text-green-400">85% quality</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Reduction</span>
                <span className="text-blue-400">79.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Browser Support</span>
                <span className="text-purple-400">95%+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * WebP Status Badge - Compact indicator
 */
export const WebPStatusBadge = () => {
  const { metrics } = useWebPPerformance();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9998]">
      <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-3 py-2 flex items-center space-x-2">
        <Package className="w-4 h-4 text-green-400" />
        <div className="text-xs text-green-300">
          <span className="font-medium">{metrics.totalProcessed}</span> WebP images
        </div>
        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
          -{WebPUtils.estimatedSavings()}
        </Badge>
      </div>
    </div>
  );
}; 