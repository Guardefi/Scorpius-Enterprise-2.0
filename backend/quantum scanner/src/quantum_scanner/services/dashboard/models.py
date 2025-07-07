"""
Dashboard Service Data Models

Models for executive dashboards and risk visualization.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class WidgetType(str, Enum):
    """Types of dashboard widgets."""
    CHART = "chart"
    METRIC = "metric"
    TABLE = "table"
    GAUGE = "gauge"
    MAP = "map"
    TIMELINE = "timeline"
    ALERT = "alert"
    TREND = "trend"


class ChartType(str, Enum):
    """Types of charts for visualization."""
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    DONUT = "donut"
    SCATTER = "scatter"
    HEATMAP = "heatmap"
    AREA = "area"
    HISTOGRAM = "histogram"


class RiskLevel(str, Enum):
    """Risk level classifications."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    MINIMAL = "minimal"


class TrendDirection(str, Enum):
    """Trend direction indicators."""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"
    UNKNOWN = "unknown"


class WidgetConfig(BaseModel):
    """Configuration for a dashboard widget."""
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Widget title")
    widget_type: WidgetType = Field(..., description="Type of widget")
    chart_type: Optional[ChartType] = Field(None, description="Chart type if applicable")
    position: Dict[str, int] = Field(..., description="Widget position (x, y, width, height)")
    data_source: str = Field(..., description="Data source identifier")
    refresh_interval: int = Field(default=300, description="Refresh interval in seconds")
    configuration: Dict[str, Any] = Field(
        default_factory=dict,
        description="Widget-specific configuration"
    )
    filters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Data filters"
    )
    styling: Dict[str, Any] = Field(
        default_factory=dict,
        description="Widget styling options"
    )


class DashboardConfig(BaseModel):
    """Dashboard configuration and layout."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Dashboard name")
    description: str = Field(..., description="Dashboard description")
    target_audience: str = Field(..., description="Target audience (executive, technical, operational)")
    layout: str = Field(default="grid", description="Dashboard layout type")
    widgets: List[WidgetConfig] = Field(
        default_factory=list,
        description="Dashboard widgets"
    )
    auto_refresh: bool = Field(default=True, description="Enable auto-refresh")
    refresh_interval: int = Field(default=300, description="Global refresh interval")
    access_controls: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Role-based access controls"
    )
    created_by: str = Field(..., description="Dashboard creator")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_modified: datetime = Field(default_factory=datetime.utcnow)


class MetricValue(BaseModel):
    """Single metric value with metadata."""
    value: Union[int, float, str] = Field(..., description="Metric value")
    unit: Optional[str] = Field(None, description="Value unit")
    trend: Optional[TrendDirection] = Field(None, description="Trend direction")
    change_percentage: Optional[float] = Field(None, description="Percentage change")
    previous_value: Optional[Union[int, float]] = Field(None, description="Previous value for comparison")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChartDataPoint(BaseModel):
    """Single data point for charts."""
    x: Union[str, int, float, datetime] = Field(..., description="X-axis value")
    y: Union[int, float] = Field(..., description="Y-axis value")
    label: Optional[str] = Field(None, description="Data point label")
    color: Optional[str] = Field(None, description="Data point color")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ChartData(BaseModel):
    """Chart data structure."""
    series_name: str = Field(..., description="Data series name")
    data_points: List[ChartDataPoint] = Field(..., description="Chart data points")
    chart_type: ChartType = Field(..., description="Chart type")
    styling: Dict[str, Any] = Field(default_factory=dict, description="Chart styling")


class AlertItem(BaseModel):
    """Dashboard alert item."""
    id: UUID = Field(default_factory=uuid4)
    severity: RiskLevel = Field(..., description="Alert severity")
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Alert message")
    source: str = Field(..., description="Alert source")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = Field(default=False, description="Whether alert is acknowledged")
    action_required: bool = Field(default=False, description="Whether action is required")
    related_assets: List[str] = Field(default_factory=list, description="Related assets")


class ExecutiveSummary(BaseModel):
    """Executive-level summary metrics."""
    organization: str = Field(..., description="Organization name")
    report_date: datetime = Field(default_factory=datetime.utcnow)
    overall_risk_score: MetricValue = Field(..., description="Overall quantum risk score")
    assets_scanned: MetricValue = Field(..., description="Total assets scanned")
    vulnerabilities_found: MetricValue = Field(..., description="Total vulnerabilities found")
    critical_issues: MetricValue = Field(..., description="Critical issues requiring attention")
    compliance_score: MetricValue = Field(..., description="Overall compliance score")
    quantum_readiness: MetricValue = Field(..., description="Quantum readiness percentage")
    estimated_migration_effort: str = Field(..., description="Estimated PQC migration effort")
    key_recommendations: List[str] = Field(
        default_factory=list,
        description="Key recommendations for executives"
    )


class RiskMetrics(BaseModel):
    """Risk assessment metrics."""
    risk_distribution: Dict[RiskLevel, int] = Field(
        default_factory=dict,
        description="Distribution of risks by level"
    )
    quantum_vulnerable_assets: int = Field(..., description="Assets with quantum vulnerabilities")
    deprecated_crypto_count: int = Field(..., description="Count of deprecated crypto implementations")
    pqc_ready_assets: int = Field(..., description="Assets ready for post-quantum crypto")
    time_to_quantum_threat: MetricValue = Field(..., description="Estimated time to quantum threat")
    migration_progress: MetricValue = Field(..., description="PQC migration progress percentage")
    risk_trend: TrendDirection = Field(..., description="Overall risk trend")
    top_risk_categories: List[str] = Field(
        default_factory=list,
        description="Top risk categories"
    )


class ComplianceOverview(BaseModel):
    """Compliance status overview."""
    frameworks_assessed: int = Field(..., description="Number of frameworks assessed")
    overall_compliance_rate: MetricValue = Field(..., description="Overall compliance rate")
    compliant_frameworks: int = Field(..., description="Fully compliant frameworks")
    non_compliant_frameworks: int = Field(..., description="Non-compliant frameworks")
    critical_gaps: int = Field(..., description="Critical compliance gaps")
    remediation_actions: int = Field(..., description="Total remediation actions")
    upcoming_deadlines: List[str] = Field(
        default_factory=list,
        description="Upcoming compliance deadlines"
    )
    compliance_trends: Dict[str, TrendDirection] = Field(
        default_factory=dict,
        description="Compliance trends by framework"
    )


class TrendAnalysis(BaseModel):
    """Trend analysis data."""
    metric_name: str = Field(..., description="Metric being analyzed")
    time_period: str = Field(..., description="Analysis time period")
    trend_direction: TrendDirection = Field(..., description="Overall trend direction")
    percentage_change: float = Field(..., description="Percentage change over period")
    historical_data: List[ChartDataPoint] = Field(
        default_factory=list,
        description="Historical data points"
    )
    forecast_data: List[ChartDataPoint] = Field(
        default_factory=list,
        description="Forecasted data points"
    )
    key_insights: List[str] = Field(
        default_factory=list,
        description="Key insights from trend analysis"
    )


class DashboardData(BaseModel):
    """Complete dashboard data payload."""
    dashboard_id: UUID = Field(..., description="Dashboard ID")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    executive_summary: ExecutiveSummary = Field(..., description="Executive summary")
    risk_metrics: RiskMetrics = Field(..., description="Risk metrics")
    compliance_overview: ComplianceOverview = Field(..., description="Compliance overview")
    trend_analyses: List[TrendAnalysis] = Field(
        default_factory=list,
        description="Trend analyses"
    )
    alerts: List[AlertItem] = Field(
        default_factory=list,
        description="Active alerts"
    )
    charts: List[ChartData] = Field(
        default_factory=list,
        description="Chart data"
    )
    metrics: Dict[str, MetricValue] = Field(
        default_factory=dict,
        description="Additional metrics"
    )
    refresh_timestamp: datetime = Field(default_factory=datetime.utcnow)


class DashboardExport(BaseModel):
    """Dashboard export configuration."""
    dashboard_id: UUID = Field(..., description="Dashboard to export")
    format: str = Field(..., description="Export format (pdf, excel, png)")
    include_data: bool = Field(default=True, description="Include raw data")
    time_range: Optional[str] = Field(None, description="Time range for data")
    filters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Export filters"
    )
    styling: Dict[str, Any] = Field(
        default_factory=dict,
        description="Export styling options"
    )
