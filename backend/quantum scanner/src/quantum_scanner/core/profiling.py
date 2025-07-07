"""
Advanced profiling and monitoring system for performance optimization.

This module provides comprehensive performance monitoring, profiling,
and alerting capabilities for the quantum scanner platform.
"""

import asyncio
import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Callable
from functools import wraps
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from collections import defaultdict, deque

from ..core.logging import get_logger

logger = get_logger(__name__)


class MetricType(str):
    """Metric type constants."""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"


@dataclass
class Metric:
    """Performance metric data point."""
    name: str
    value: float
    metric_type: MetricType
    timestamp: datetime = field(default_factory=datetime.utcnow)
    tags: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metric to dictionary."""
        return {
            "name": self.name,
            "value": self.value,
            "type": self.metric_type,
            "timestamp": self.timestamp.isoformat(),
            "tags": self.tags
        }


@dataclass
class ProfileResult:
    """Function profiling result."""
    function_name: str
    execution_time: float
    memory_delta: float
    cpu_percent: float
    call_count: int
    min_time: float
    max_time: float
    avg_time: float
    timestamp: datetime = field(default_factory=datetime.utcnow)


class PerformanceMonitor:
    """Comprehensive performance monitoring system."""
    
    def __init__(self, max_history: int = 10000):
        """Initialize performance monitor."""
        self.max_history = max_history
        self._metrics: deque = deque(maxlen=max_history)
        self._profiles: Dict[str, List[float]] = defaultdict(list)
        self._counters: Dict[str, float] = defaultdict(float)
        self._gauges: Dict[str, float] = {}
        self._timers: Dict[str, List[float]] = defaultdict(list)
        
        # System monitoring
        self._system_metrics_enabled = True
        self._system_monitor_task: Optional[asyncio.Task] = None
        self._monitor_interval = 30  # seconds
        
        # Alert thresholds
        self.alert_thresholds = {
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "avg_response_time": 5.0,  # seconds
            "error_rate": 0.05  # 5%
        }
        
        # Lock for thread safety
        self._lock = threading.RLock()
    
    def start_system_monitoring(self):
        """Start system resource monitoring."""
        if self._system_monitor_task is None:
            self._system_monitor_task = asyncio.create_task(
                self._system_monitor_loop()
            )
            logger.info("System monitoring started")
    
    async def stop_system_monitoring(self):
        """Stop system resource monitoring."""
        if self._system_monitor_task:
            self._system_monitor_task.cancel()
            try:
                await self._system_monitor_task
            except asyncio.CancelledError:
                pass
            self._system_monitor_task = None
            logger.info("System monitoring stopped")
    
    async def _system_monitor_loop(self):
        """System monitoring loop."""
        while True:
            try:
                await self._collect_system_metrics()
                await asyncio.sleep(self._monitor_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"System monitoring error: {e}")
                await asyncio.sleep(self._monitor_interval)
    
    async def _collect_system_metrics(self):
        """Collect system resource metrics."""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            self.record_gauge("system.cpu.percent", cpu_percent)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            self.record_gauge("system.memory.percent", memory.percent)
            self.record_gauge("system.memory.available", memory.available)
            self.record_gauge("system.memory.used", memory.used)
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            self.record_gauge("system.disk.percent", disk.percent)
            self.record_gauge("system.disk.free", disk.free)
            
            # Network metrics (if available)
            try:
                network = psutil.net_io_counters()
                self.record_gauge("system.network.bytes_sent", network.bytes_sent)
                self.record_gauge("system.network.bytes_recv", network.bytes_recv)
            except Exception:
                pass  # Network stats may not be available
            
            # Process metrics
            process = psutil.Process()
            process_memory = process.memory_info()
            self.record_gauge("process.memory.rss", process_memory.rss)
            self.record_gauge("process.memory.vms", process_memory.vms)
            self.record_gauge("process.cpu.percent", process.cpu_percent())
            self.record_gauge("process.threads", process.num_threads())
            
            # Check alerts
            await self._check_alerts()
            
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
    
    async def _check_alerts(self):
        """Check for alert conditions."""
        # CPU alert
        cpu_percent = self._gauges.get("system.cpu.percent", 0)
        if cpu_percent > self.alert_thresholds["cpu_percent"]:
            logger.warning(f"High CPU usage: {cpu_percent:.1f}%")
        
        # Memory alert
        memory_percent = self._gauges.get("system.memory.percent", 0)
        if memory_percent > self.alert_thresholds["memory_percent"]:
            logger.warning(f"High memory usage: {memory_percent:.1f}%")
        
        # Response time alert
        scan_times = self._timers.get("scan.execution_time", [])
        if scan_times:
            avg_time = sum(scan_times[-10:]) / len(scan_times[-10:])  # Last 10
            if avg_time > self.alert_thresholds["avg_response_time"]:
                logger.warning(f"High average scan time: {avg_time:.2f}s")
    
    def record_metric(self, metric: Metric):
        """Record a performance metric."""
        with self._lock:
            self._metrics.append(metric)
            
            if metric.metric_type == MetricType.COUNTER:
                self._counters[metric.name] += metric.value
            elif metric.metric_type == MetricType.GAUGE:
                self._gauges[metric.name] = metric.value
            elif metric.metric_type == MetricType.TIMER:
                self._timers[metric.name].append(metric.value)
                # Keep only recent timer values
                if len(self._timers[metric.name]) > 1000:
                    self._timers[metric.name] = self._timers[metric.name][-500:]
    
    def record_counter(self, name: str, value: float = 1.0, tags: Optional[Dict[str, str]] = None):
        """Record a counter metric."""
        metric = Metric(name, value, MetricType.COUNTER, tags=tags or {})
        self.record_metric(metric)
    
    def record_gauge(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """Record a gauge metric."""
        metric = Metric(name, value, MetricType.GAUGE, tags=tags or {})
        self.record_metric(metric)
    
    def record_timer(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """Record a timer metric."""
        metric = Metric(name, value, MetricType.TIMER, tags=tags or {})
        self.record_metric(metric)
    
    def get_metrics(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get metrics since specified time."""
        with self._lock:
            if since is None:
                return [metric.to_dict() for metric in self._metrics]
            else:
                return [
                    metric.to_dict() for metric in self._metrics
                    if metric.timestamp >= since
                ]
    
    def get_summary(self) -> Dict[str, Any]:
        """Get performance summary."""
        with self._lock:
            summary = {
                "timestamp": datetime.utcnow().isoformat(),
                "counters": dict(self._counters),
                "gauges": dict(self._gauges),
                "timers": {}
            }
            
            # Calculate timer statistics
            for name, values in self._timers.items():
                if values:
                    summary["timers"][name] = {
                        "count": len(values),
                        "min": min(values),
                        "max": max(values),
                        "avg": sum(values) / len(values),
                        "recent_avg": sum(values[-10:]) / len(values[-10:]) if len(values) >= 10 else sum(values) / len(values)
                    }
            
            return summary
    
    def get_profile_summary(self) -> Dict[str, Any]:
        """Get function profiling summary."""
        with self._lock:
            profiles = {}
            for func_name, times in self._profiles.items():
                if times:
                    profiles[func_name] = {
                        "call_count": len(times),
                        "total_time": sum(times),
                        "avg_time": sum(times) / len(times),
                        "min_time": min(times),
                        "max_time": max(times)
                    }
            return profiles
    
    def clear_metrics(self):
        """Clear all stored metrics."""
        with self._lock:
            self._metrics.clear()
            self._counters.clear()
            self._gauges.clear()
            self._timers.clear()
            self._profiles.clear()


# Global monitor instance
_monitor: Optional[PerformanceMonitor] = None


def get_monitor() -> PerformanceMonitor:
    """Get global performance monitor."""
    global _monitor
    if _monitor is None:
        _monitor = PerformanceMonitor()
        _monitor.start_system_monitoring()
    return _monitor


@asynccontextmanager
async def performance_timer(name: str, tags: Optional[Dict[str, str]] = None):
    """Context manager for timing operations."""
    start_time = time.time()
    monitor = get_monitor()
    
    try:
        yield
    finally:
        execution_time = time.time() - start_time
        monitor.record_timer(name, execution_time, tags)


def profile_function(name: Optional[str] = None, track_memory: bool = False):
    """
    Decorator for profiling function performance.
    
    Args:
        name: Custom metric name (defaults to function name)
        track_memory: Whether to track memory usage
    """
    def decorator(func: Callable):
        metric_name = name or f"{func.__module__}.{func.__name__}"
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            monitor = get_monitor()
            start_time = time.time()
            start_memory = 0
            
            if track_memory:
                try:
                    process = psutil.Process()
                    start_memory = process.memory_info().rss
                except Exception:
                    pass
            
            try:
                result = await func(*args, **kwargs)
                monitor.record_counter(f"{metric_name}.success")
                return result
            except Exception:
                monitor.record_counter(f"{metric_name}.error")
                raise
            finally:
                execution_time = time.time() - start_time
                monitor.record_timer(f"{metric_name}.execution_time", execution_time)
                
                if track_memory:
                    try:
                        process = psutil.Process()
                        end_memory = process.memory_info().rss
                        memory_delta = end_memory - start_memory
                        monitor.record_gauge(f"{metric_name}.memory_delta", memory_delta)
                    except Exception:
                        pass
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            monitor = get_monitor()
            start_time = time.time()
            start_memory = 0
            
            if track_memory:
                try:
                    process = psutil.Process()
                    start_memory = process.memory_info().rss
                except Exception:
                    pass
            
            try:
                result = func(*args, **kwargs)
                monitor.record_counter(f"{metric_name}.success")
                return result
            except Exception:
                monitor.record_counter(f"{metric_name}.error")
                raise
            finally:
                execution_time = time.time() - start_time
                monitor.record_timer(f"{metric_name}.execution_time", execution_time)
                
                if track_memory:
                    try:
                        process = psutil.Process()
                        end_memory = process.memory_info().rss
                        memory_delta = end_memory - start_memory
                        monitor.record_gauge(f"{metric_name}.memory_delta", memory_delta)
                    except Exception:
                        pass
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator


class PerformanceReport:
    """Generate comprehensive performance reports."""
    
    def __init__(self, monitor: PerformanceMonitor):
        self.monitor = monitor
    
    def generate_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate performance report for specified time period."""
        since = datetime.utcnow() - timedelta(hours=hours)
        metrics = self.monitor.get_metrics(since)
        summary = self.monitor.get_summary()
        profiles = self.monitor.get_profile_summary()
        
        # Analyze trends
        trends = self._analyze_trends(metrics)
        
        # Identify bottlenecks
        bottlenecks = self._identify_bottlenecks(profiles, summary)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(trends, bottlenecks, summary)
        
        return {
            "report_timestamp": datetime.utcnow().isoformat(),
            "period_hours": hours,
            "summary": summary,
            "profiles": profiles,
            "trends": trends,
            "bottlenecks": bottlenecks,
            "recommendations": recommendations,
            "metrics_count": len(metrics)
        }
    
    def _analyze_trends(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance trends."""
        trends = {}
        
        # Group metrics by name and type
        metric_groups = defaultdict(list)
        for metric in metrics:
            key = f"{metric['name']}:{metric['type']}"
            metric_groups[key].append({
                "value": metric["value"],
                "timestamp": datetime.fromisoformat(metric["timestamp"])
            })
        
        # Calculate trends for each metric
        for key, values in metric_groups.items():
            if len(values) < 2:
                continue
            
            # Sort by timestamp
            values.sort(key=lambda x: x["timestamp"])
            
            # Calculate trend (simple linear regression)
            n = len(values)
            sum_x = sum(i for i in range(n))
            sum_y = sum(v["value"] for v in values)
            sum_xy = sum(i * v["value"] for i, v in enumerate(values))
            sum_x2 = sum(i * i for i in range(n))
            
            if n * sum_x2 - sum_x * sum_x != 0:
                slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
                trends[key] = {
                    "slope": slope,
                    "direction": "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable",
                    "sample_count": n,
                    "latest_value": values[-1]["value"],
                    "earliest_value": values[0]["value"]
                }
        
        return trends
    
    def _identify_bottlenecks(self, profiles: Dict[str, Any], summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify performance bottlenecks."""
        bottlenecks = []
        
        # Check for slow functions
        for func_name, stats in profiles.items():
            if stats["avg_time"] > 1.0:  # Functions taking > 1 second
                bottlenecks.append({
                    "type": "slow_function",
                    "function": func_name,
                    "avg_time": stats["avg_time"],
                    "call_count": stats["call_count"],
                    "total_time": stats["total_time"],
                    "severity": "high" if stats["avg_time"] > 5.0 else "medium"
                })
        
        # Check system resources
        gauges = summary.get("gauges", {})
        
        if gauges.get("system.cpu.percent", 0) > 80:
            bottlenecks.append({
                "type": "high_cpu",
                "value": gauges["system.cpu.percent"],
                "severity": "high"
            })
        
        if gauges.get("system.memory.percent", 0) > 85:
            bottlenecks.append({
                "type": "high_memory",
                "value": gauges["system.memory.percent"],
                "severity": "high"
            })
        
        return bottlenecks
    
    def _generate_recommendations(
        self, 
        trends: Dict[str, Any], 
        bottlenecks: List[Dict[str, Any]], 
        summary: Dict[str, Any]
    ) -> List[str]:
        """Generate performance recommendations."""
        recommendations = []
        
        # Recommendations based on bottlenecks
        for bottleneck in bottlenecks:
            if bottleneck["type"] == "slow_function":
                recommendations.append(
                    f"Optimize function '{bottleneck['function']}' - "
                    f"average execution time: {bottleneck['avg_time']:.2f}s"
                )
            elif bottleneck["type"] == "high_cpu":
                recommendations.append(
                    f"CPU usage is high ({bottleneck['value']:.1f}%) - "
                    "consider optimizing algorithms or scaling horizontally"
                )
            elif bottleneck["type"] == "high_memory":
                recommendations.append(
                    f"Memory usage is high ({bottleneck['value']:.1f}%) - "
                    "consider implementing caching optimizations or adding memory"
                )
        
        # Recommendations based on trends
        for metric_key, trend in trends.items():
            if trend["direction"] == "increasing" and "error" in metric_key.lower():
                recommendations.append(
                    f"Error rate is increasing for {metric_key} - investigate root cause"
                )
            elif trend["direction"] == "increasing" and "execution_time" in metric_key:
                recommendations.append(
                    f"Response time is increasing for {metric_key} - review performance"
                )
        
        # General recommendations
        if not recommendations:
            recommendations.append("System performance appears stable")
        
        return recommendations


async def generate_performance_report(hours: int = 24) -> Dict[str, Any]:
    """Generate a comprehensive performance report."""
    monitor = get_monitor()
    report_generator = PerformanceReport(monitor)
    return report_generator.generate_report(hours)


async def shutdown_monitoring():
    """Shutdown performance monitoring."""
    global _monitor
    if _monitor:
        await _monitor.stop_system_monitoring()
        _monitor = None
