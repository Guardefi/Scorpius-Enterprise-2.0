"""
Dashboard Generator - Creates executive dashboards and visualizations.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
from uuid import UUID

import structlog

from .models import (
    DashboardConfig,
    DashboardData,
    ExecutiveSummary,
    RiskMetrics,
    ComplianceOverview,
    TrendAnalysis,
    AlertItem,
    MetricValue,
    ChartData,
    ChartDataPoint,
    RiskLevel,
    TrendDirection,
    ChartType
)

logger = structlog.get_logger(__name__)


class DashboardGenerator:
    """Generates dashboard data and visualizations."""
    
    def __init__(self):
        self.data_cache = {}
        self.cache_ttl = 300  # 5 minutes

    async def generate_dashboard_data(self, dashboard_config: DashboardConfig) -> DashboardData:
        """Generate complete dashboard data."""
        logger.info("Generating dashboard data", dashboard_id=dashboard_config.id)
        
        # Simulate data generation with async operations
        executive_summary = await self._generate_executive_summary()
        risk_metrics = await self._generate_risk_metrics()
        compliance_overview = await self._generate_compliance_overview()
        trend_analyses = await self._generate_trend_analyses()
        alerts = await self._generate_alerts()
        charts = await self._generate_charts()
        
        return DashboardData(
            dashboard_id=dashboard_config.id,
            executive_summary=executive_summary,
            risk_metrics=risk_metrics,
            compliance_overview=compliance_overview,
            trend_analyses=trend_analyses,
            alerts=alerts,
            charts=charts,
            metrics=await self._generate_additional_metrics()
        )

    async def _generate_executive_summary(self) -> ExecutiveSummary:
        """Generate executive summary metrics."""
        await asyncio.sleep(0.1)
        
        return ExecutiveSummary(
            organization="Demo Organization",
            overall_risk_score=MetricValue(
                value=7.3,
                unit="score",
                trend=TrendDirection.DOWN,
                change_percentage=-12.5,
                previous_value=8.4
            ),
            assets_scanned=MetricValue(
                value=1247,
                trend=TrendDirection.UP,
                change_percentage=8.2,
                previous_value=1152
            ),
            vulnerabilities_found=MetricValue(
                value=342,
                trend=TrendDirection.DOWN,
                change_percentage=-15.3,
                previous_value=404
            ),
            critical_issues=MetricValue(
                value=23,
                trend=TrendDirection.DOWN,
                change_percentage=-30.3,
                previous_value=33
            ),
            compliance_score=MetricValue(
                value=78.4,
                unit="%",
                trend=TrendDirection.UP,
                change_percentage=5.7,
                previous_value=74.2
            ),
            quantum_readiness=MetricValue(
                value=34.2,
                unit="%",
                trend=TrendDirection.UP,
                change_percentage=12.1,
                previous_value=30.5
            ),
            estimated_migration_effort="18-24 months",
            key_recommendations=[
                "Prioritize migration of RSA implementations to ML-DSA",
                "Establish post-quantum cryptography pilot program",
                "Address 23 critical vulnerabilities in next 30 days",
                "Enhance compliance monitoring for NIST frameworks"
            ]
        )

    async def _generate_risk_metrics(self) -> RiskMetrics:
        """Generate risk assessment metrics."""
        await asyncio.sleep(0.1)
        
        return RiskMetrics(
            risk_distribution={
                RiskLevel.CRITICAL: 23,
                RiskLevel.HIGH: 67,
                RiskLevel.MEDIUM: 156,
                RiskLevel.LOW: 96,
                RiskLevel.MINIMAL: 12
            },
            quantum_vulnerable_assets=892,
            deprecated_crypto_count=145,
            pqc_ready_assets=78,
            time_to_quantum_threat=MetricValue(
                value=8.2,
                unit="years",
                trend=TrendDirection.DOWN
            ),
            migration_progress=MetricValue(
                value=34.2,
                unit="%",
                trend=TrendDirection.UP,
                change_percentage=12.1
            ),
            risk_trend=TrendDirection.DOWN,
            top_risk_categories=[
                "Quantum-vulnerable RSA implementations",
                "Deprecated TLS versions",
                "Weak certificate signatures",
                "Insufficient key sizes",
                "Custom crypto implementations"
            ]
        )

    async def _generate_compliance_overview(self) -> ComplianceOverview:
        """Generate compliance status overview."""
        await asyncio.sleep(0.1)
        
        return ComplianceOverview(
            frameworks_assessed=6,
            overall_compliance_rate=MetricValue(
                value=78.4,
                unit="%",
                trend=TrendDirection.UP,
                change_percentage=5.7
            ),
            compliant_frameworks=2,
            non_compliant_frameworks=3,
            critical_gaps=12,
            remediation_actions=45,
            upcoming_deadlines=[
                "NIST PQC compliance - Q2 2025",
                "FIPS 140-3 certification renewal - Q3 2024",
                "SOX audit - Q4 2024"
            ],
            compliance_trends={
                "NIST CSF": TrendDirection.UP,
                "FIPS 140": TrendDirection.STABLE,
                "SOX": TrendDirection.UP,
                "HIPAA": TrendDirection.STABLE
            }
        )

    async def _generate_trend_analyses(self) -> List[TrendAnalysis]:
        """Generate trend analysis data."""
        await asyncio.sleep(0.1)
        
        # Generate sample historical data
        base_date = datetime.now() - timedelta(days=365)
        historical_points = []
        for i in range(12):  # 12 months of data
            date = base_date + timedelta(days=30 * i)
            # Simulate improving risk score over time
            value = 9.5 - (i * 0.2) + (0.1 * (i % 3))  # Some variation
            historical_points.append(
                ChartDataPoint(x=date, y=value, label=f"Month {i+1}")
            )
        
        return [
            TrendAnalysis(
                metric_name="Overall Risk Score",
                time_period="12 months",
                trend_direction=TrendDirection.DOWN,
                percentage_change=-23.7,
                historical_data=historical_points,
                key_insights=[
                    "Risk score improved 23.7% over past year",
                    "Significant improvement after PQC pilot implementation",
                    "Seasonal variation observed in Q4 due to compliance cycles"
                ]
            ),
            TrendAnalysis(
                metric_name="Quantum Readiness",
                time_period="12 months",
                trend_direction=TrendDirection.UP,
                percentage_change=145.2,
                historical_data=[
                    ChartDataPoint(x=base_date + timedelta(days=30 * i), y=14 + (i * 2.5))
                    for i in range(12)
                ],
                key_insights=[
                    "Quantum readiness increased 145% year-over-year",
                    "Accelerated progress in Q3 due to dedicated PQC team",
                    "On track to meet 50% readiness target by end of year"
                ]
            )
        ]

    async def _generate_alerts(self) -> List[AlertItem]:
        """Generate active alerts."""
        await asyncio.sleep(0.1)
        
        return [
            AlertItem(
                severity=RiskLevel.CRITICAL,
                title="Critical RSA Vulnerability",
                message="23 critical RSA implementations identified in production systems",
                source="CBOM Engine",
                action_required=True,
                related_assets=["web-server-01", "api-gateway", "payment-system"]
            ),
            AlertItem(
                severity=RiskLevel.HIGH,
                title="FIPS Compliance Gap",
                message="12 systems not meeting FIPS 140-3 requirements",
                source="Compliance Mapper",
                action_required=True,
                related_assets=["hsm-cluster", "key-management"]
            ),
            AlertItem(
                severity=RiskLevel.MEDIUM,
                title="Certificate Expiration",
                message="15 SSL certificates expiring within 30 days",
                source="Firmware Scanner",
                action_required=False,
                related_assets=["iot-devices", "edge-gateways"]
            )
        ]

    async def _generate_charts(self) -> List[ChartData]:
        """Generate chart data for visualizations."""
        await asyncio.sleep(0.1)
        
        return [
            ChartData(
                series_name="Risk Distribution",
                chart_type=ChartType.PIE,
                data_points=[
                    ChartDataPoint(x="Critical", y=23, color="#FF4444"),
                    ChartDataPoint(x="High", y=67, color="#FF8800"),
                    ChartDataPoint(x="Medium", y=156, color="#FFAA00"),
                    ChartDataPoint(x="Low", y=96, color="#88DD00"),
                    ChartDataPoint(x="Minimal", y=12, color="#00AA00")
                ]
            ),
            ChartData(
                series_name="Compliance Scores",
                chart_type=ChartType.BAR,
                data_points=[
                    ChartDataPoint(x="NIST CSF", y=85.2),
                    ChartDataPoint(x="FIPS 140", y=72.1),
                    ChartDataPoint(x="SOX", y=91.3),
                    ChartDataPoint(x="HIPAA", y=68.7),
                    ChartDataPoint(x="GDPR", y=76.9),
                    ChartDataPoint(x="PCI DSS", y=82.4)
                ]
            ),
            ChartData(
                series_name="Quantum Migration Progress",
                chart_type=ChartType.LINE,
                data_points=[
                    ChartDataPoint(x=datetime.now() - timedelta(days=30 * i), y=10 + (i * 3))
                    for i in range(12, 0, -1)
                ]
            )
        ]

    async def _generate_additional_metrics(self) -> Dict[str, MetricValue]:
        """Generate additional dashboard metrics."""
        await asyncio.sleep(0.1)
        
        return {
            "mean_time_to_remediation": MetricValue(
                value=12.3,
                unit="days",
                trend=TrendDirection.DOWN,
                change_percentage=-18.2
            ),
            "security_team_efficiency": MetricValue(
                value=87.4,
                unit="%",
                trend=TrendDirection.UP,
                change_percentage=8.1
            ),
            "automated_remediation_rate": MetricValue(
                value=45.2,
                unit="%",
                trend=TrendDirection.UP,
                change_percentage=23.5
            ),
            "false_positive_rate": MetricValue(
                value=3.1,
                unit="%",
                trend=TrendDirection.DOWN,
                change_percentage=-41.2
            )
        }

    async def get_cached_data(self, dashboard_id: UUID) -> DashboardData:
        """Get cached dashboard data if available and not expired."""
        cache_key = str(dashboard_id)
        if cache_key in self.data_cache:
            cached_data, timestamp = self.data_cache[cache_key]
            if (datetime.now() - timestamp).seconds < self.cache_ttl:
                logger.info("Returning cached dashboard data", dashboard_id=dashboard_id)
                return cached_data
        
        return None

    def cache_data(self, dashboard_id: UUID, data: DashboardData):
        """Cache dashboard data."""
        cache_key = str(dashboard_id)
        self.data_cache[cache_key] = (data, datetime.now())
        logger.info("Cached dashboard data", dashboard_id=dashboard_id)
