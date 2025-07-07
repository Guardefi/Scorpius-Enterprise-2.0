"""
Data Visualizer - Handles chart generation and data visualization formatting.
"""

from typing import Dict, List
from .models import ChartData, ChartType, ChartDataPoint


class DataVisualizer:
    """Handles data visualization and chart formatting."""
    
    def __init__(self):
        self.chart_colors = {
            "critical": "#FF4444",
            "high": "#FF8800", 
            "medium": "#FFAA00",
            "low": "#88DD00",
            "minimal": "#00AA00"
        }

    def format_chart_data(self, chart_data: ChartData) -> Dict:
        """Format chart data for frontend consumption."""
        return {
            "type": chart_data.chart_type.value,
            "name": chart_data.series_name,
            "data": [
                {
                    "x": self._format_x_value(point.x),
                    "y": point.y,
                    "label": point.label,
                    "color": point.color or self._get_default_color(point)
                }
                for point in chart_data.data_points
            ],
            "styling": chart_data.styling
        }

    def _format_x_value(self, x_value):
        """Format X-axis values appropriately."""
        if hasattr(x_value, 'isoformat'):  # datetime
            return x_value.isoformat()
        return x_value

    def _get_default_color(self, point: ChartDataPoint) -> str:
        """Get default color based on data point."""
        if isinstance(point.x, str):
            x_lower = point.x.lower()
            for risk_level, color in self.chart_colors.items():
                if risk_level in x_lower:
                    return color
        return "#0088CC"  # Default blue

    def generate_summary_charts(self, data) -> List[Dict]:
        """Generate standard summary charts."""
        return [
            {
                "type": "donut",
                "title": "Risk Distribution",
                "data": [
                    {"label": "Critical", "value": 23, "color": "#FF4444"},
                    {"label": "High", "value": 67, "color": "#FF8800"},
                    {"label": "Medium", "value": 156, "color": "#FFAA00"},
                    {"label": "Low", "value": 96, "color": "#88DD00"}
                ]
            },
            {
                "type": "bar",
                "title": "Compliance Scores",
                "data": [
                    {"label": "NIST", "value": 85.2},
                    {"label": "FIPS", "value": 72.1},
                    {"label": "SOX", "value": 91.3},
                    {"label": "HIPAA", "value": 68.7}
                ]
            }
        ]
