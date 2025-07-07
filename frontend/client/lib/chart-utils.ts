import { format } from "date-fns";

export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
  [key: string]: any;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  name?: string;
  [key: string]: any;
}

// Chart color palette following our design system
export const chartColors = {
  primary: "hsl(220 100% 60%)",
  success: "hsl(142 76% 36%)",
  warning: "hsl(38 92% 50%)",
  destructive: "hsl(0 84% 60%)",
  purple: "hsl(270 95% 75%)",
  orange: "hsl(24 100% 50%)",
  teal: "hsl(173 80% 40%)",
  pink: "hsl(322 65% 55%)",
  indigo: "hsl(239 84% 67%)",
  lime: "hsl(84 81% 44%)",
} as const;

export const chartColorArray = Object.values(chartColors);

// Generate time series data for charts
export function generateTimeSeriesData(
  days: number = 7,
  baseValue: number = 100,
  volatility: number = 0.1,
  trend: number = 0,
): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const trendEffect = trend * (days - i - 1);
    const randomVariation = (Math.random() - 0.5) * 2 * volatility * baseValue;
    const value = Math.max(0, baseValue + trendEffect + randomVariation);

    data.push({
      timestamp: date.toISOString(),
      name: format(date, "MMM dd"),
      value: Math.round(value * 100) / 100,
    });
  }

  return data;
}

// Generate real-time data point
export function generateRealTimeDataPoint(
  lastValue: number,
  volatility: number = 0.05,
  trend: number = 0,
): TimeSeriesDataPoint {
  const now = new Date();
  const trendEffect = trend;
  const randomVariation = (Math.random() - 0.5) * 2 * volatility * lastValue;
  const value = Math.max(0, lastValue + trendEffect + randomVariation);

  return {
    timestamp: now.toISOString(),
    name: format(now, "HH:mm"),
    value: Math.round(value * 100) / 100,
  };
}

// Generate distribution data for pie/donut charts
export function generateDistributionData(
  categories: string[],
  total: number = 100,
): ChartDataPoint[] {
  const weights = categories.map(() => Math.random());
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return categories.map((category, index) => ({
    name: category,
    value: Math.round((weights[index] / weightSum) * total * 100) / 100,
  }));
}

// Format numbers for chart display
export function formatChartValue(
  value: number,
  type: "currency" | "percentage" | "number" | "bytes" = "number",
): string {
  switch (type) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);

    case "percentage":
      return `${value.toFixed(1)}%`;

    case "bytes":
      const units = ["B", "KB", "MB", "GB", "TB"];
      let size = value;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;

    case "number":
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
  }
}

// Chart theme configuration
export const chartTheme = {
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(25 8% 12%)",
      border: "1px solid hsl(25 8% 20%)",
      borderRadius: "8px",
      color: "hsl(25 8% 90%)",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
    },
    cursor: {
      stroke: "hsl(25 8% 30%)",
      strokeWidth: 1,
    },
  },
  grid: {
    stroke: "hsl(25 8% 20%)",
    strokeWidth: 0.5,
  },
  axis: {
    axisLine: {
      stroke: "hsl(25 8% 30%)",
    },
    tickLine: {
      stroke: "hsl(25 8% 30%)",
    },
    tick: {
      fill: "hsl(25 8% 65%)",
      fontSize: 12,
      fontFamily: "Inter, sans-serif",
    },
  },
  legend: {
    wrapperStyle: {
      color: "hsl(25 8% 85%)",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
    },
  },
} as const;

// Animation configurations
export const chartAnimations = {
  entry: {
    animationBegin: 0,
    animationDuration: 800,
    animationEasing: "ease-out",
  },
  update: {
    animationDuration: 400,
    animationEasing: "ease-in-out",
  },
} as const;

// Generate sample data for different chart types
export const generateSampleData = {
  lineChart: (points: number = 10) =>
    generateTimeSeriesData(points, 100, 0.15, 2),

  areaChart: (points: number = 20) =>
    generateTimeSeriesData(points, 75, 0.2, 1),

  barChart: (categories: string[]) =>
    categories.map((category) => ({
      name: category,
      value: Math.floor(Math.random() * 100) + 20,
    })),

  pieChart: (categories: string[]) => generateDistributionData(categories, 100),

  scatterChart: (points: number = 50) =>
    Array.from({ length: points }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      name: `Point ${i + 1}`,
    })),
};
