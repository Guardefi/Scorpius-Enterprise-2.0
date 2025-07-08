import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";

interface LineConfig {
  dataKey: string;
  color: string;
  name: string;
}

interface EnhancedLineChartProps {
  data: any[];
  lines: LineConfig[];
  showGrid?: boolean;
  height?: number;
}

export const EnhancedLineChart = ({
  data,
  lines,
  showGrid = true,
  height = 300,
}: EnhancedLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0, 255, 255, 0.1)"
            className="opacity-30"
          />
        )}
        <XAxis
          dataKey="time"
          stroke="rgba(0, 255, 255, 0.7)"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
        />
        <YAxis
          stroke="rgba(0, 255, 255, 0.7)"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0, 255, 255, 0.2)",
            color: "#ffffff",
            fontFamily: "JetBrains Mono, monospace",
          }}
          labelStyle={{
            color: "#00ffff",
            fontWeight: 600,
          }}
        />
        <Legend
          wrapperStyle={{
            color: "rgba(0, 255, 255, 0.8)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        />
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
            name={line.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

interface AreaConfig {
  dataKey: string;
  color: string;
  name: string;
  fillOpacity?: number;
}

interface EnhancedAreaChartProps {
  data: any[];
  areas: AreaConfig[];
  showGrid?: boolean;
  height?: number;
}

export const EnhancedAreaChart = ({
  data,
  areas,
  showGrid = true,
  height = 300,
}: EnhancedAreaChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0, 255, 255, 0.1)"
            className="opacity-30"
          />
        )}
        <XAxis
          dataKey="time"
          stroke="rgba(0, 255, 255, 0.7)"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
        />
        <YAxis
          stroke="rgba(0, 255, 255, 0.7)"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0, 255, 255, 0.2)",
            color: "#ffffff",
            fontFamily: "JetBrains Mono, monospace",
          }}
          labelStyle={{
            color: "#00ffff",
            fontWeight: 600,
          }}
        />
        <Legend
          wrapperStyle={{
            color: "rgba(0, 255, 255, 0.8)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        />
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.color}
            fill={area.color}
            fillOpacity={area.fillOpacity || 0.3}
            strokeWidth={2}
            name={area.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface EnhancedDonutChartProps {
  data: DonutData[];
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
}

export const EnhancedDonutChart = ({
  data,
  innerRadius = 60,
  outerRadius = 100,
  height = 300,
}: EnhancedDonutChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0, 255, 255, 0.2)",
            color: "#ffffff",
            fontFamily: "JetBrains Mono, monospace",
          }}
          formatter={(value: any, name: string) => [`${value}%`, name]}
        />
        <Legend
          wrapperStyle={{
            color: "rgba(0, 255, 255, 0.8)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface BarConfig {
  dataKey: string;
  color: string;
  name: string;
}

interface EnhancedComposedChartProps {
  data: any[];
  bars: BarConfig[];
  lines: LineConfig[];
  height?: number;
}

export const EnhancedComposedChart = ({
  data,
  bars,
  lines,
  height = 300,
}: EnhancedComposedChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(0, 255, 255, 0.1)"
          className="opacity-30"
        />
        <XAxis
          dataKey="name"
          stroke="rgba(0, 255, 255, 0.7)"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
        />
        <YAxis
          stroke="rgba(0, 255, 255, 0.7)"
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0, 255, 255, 0.2)",
            color: "#ffffff",
            fontFamily: "JetBrains Mono, monospace",
          }}
          labelStyle={{
            color: "#00ffff",
            fontWeight: 600,
          }}
        />
        <Legend
          wrapperStyle={{
            color: "rgba(0, 255, 255, 0.8)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            name={bar.name}
            radius={[2, 2, 0, 0]}
          />
        ))}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
            name={line.name}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

interface RadialData {
  name: string;
  value: number;
  color: string;
}

interface EnhancedRadialChartProps {
  data: RadialData[];
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
}

export const EnhancedRadialChart = ({
  data,
  innerRadius = 40,
  outerRadius = 80,
  height = 300,
}: EnhancedRadialChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar
          dataKey="value"
          cornerRadius={4}
          fill={(entry: any) => entry.color}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </RadialBar>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0, 255, 255, 0.2)",
            color: "#ffffff",
            fontFamily: "JetBrains Mono, monospace",
          }}
          formatter={(value: any, name: string) => [`${value}%`, name]}
        />
        <Legend
          wrapperStyle={{
            color: "rgba(0, 255, 255, 0.8)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};
