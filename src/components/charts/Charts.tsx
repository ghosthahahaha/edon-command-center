import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = {
  stroke: "var(--color-border-strong)",
  tick: { fill: "var(--color-muted-foreground)", fontSize: 11 },
  tickLine: false,
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    fontSize: 12,
    boxShadow: "var(--shadow-panel)",
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)", fontSize: 11 },
};

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function TrendLine({
  data,
  xKey,
  series,
  height = 240,
  domain,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
  domain?: [number | "auto", number | "auto"];
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey={xKey} {...axis} interval="preserveStartEnd" minTickGap={24} />
          <YAxis {...axis} domain={domain ?? ["auto", "auto"]} width={48} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} iconType="plainline" />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaTrend({
  data,
  xKey,
  dataKey,
  label,
  height = 180,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  label: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey={xKey} {...axis} interval="preserveStartEnd" minTickGap={28} />
          <YAxis {...axis} width={44} />
          <Tooltip {...tooltipStyle} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke="var(--color-chart-1)"
            strokeWidth={1.75}
            fill={`url(#grad-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StackedBars({
  data,
  xKey,
  series,
  height = 260,
  vertical,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; label: string; color: string }[];
  height?: number;
  vertical?: boolean;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={vertical ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 8, left: vertical ? 24 : -18, bottom: 0 }}
          barSize={vertical ? 12 : 18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={!!vertical} horizontal={!vertical} />
          {vertical ? (
            <>
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey={xKey} {...axis} width={96} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axis} interval={0} angle={-16} textAnchor="end" height={52} />
              <YAxis {...axis} width={44} />
            </>
          )}
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--color-surface)" />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
