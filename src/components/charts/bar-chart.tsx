import { CHART_COLORS } from "@/components/ui/primitives";
import { formatNumber } from "@/lib/utils";

export type ChartDatum = {
  label: string;
  value: number;
  meta?: string;
};

function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const exponent = 10 ** Math.floor(Math.log10(value));
  const fraction = value / exponent;
  const strides = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const stride = strides.find((candidate) => fraction <= candidate) ?? 10;
  return stride * exponent;
}

/**
 * Vertical bar chart rendered as inline SVG — no client JS, scales with its
 * container, and exposes a native tooltip per bar.
 */
export function BarChart({
  data,
  unitLabel = "units",
  height = 260,
  valueSuffix = "",
}: {
  data: ChartDatum[];
  unitLabel?: string;
  height?: number;
  valueSuffix?: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-ink-400">No data to chart.</p>
    );
  }

  const width = 720;
  const margin = { top: 30, right: 12, bottom: 42, left: 48 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const max = niceCeiling(Math.max(...data.map((entry) => entry.value), 1));
  const band = innerWidth / data.length;
  const barWidth = Math.min(band * 0.5, 64);
  const peak = data.reduce(
    (best, entry, index) => (entry.value > data[best].value ? index : best),
    0,
  );
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => Math.round(max * step));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Bar chart of ${unitLabel} by category`}
    >
      <text
        x={margin.left}
        y={14}
        fontSize={9.5}
        fontWeight={700}
        letterSpacing={1.4}
        fill="#a6b5d1"
      >
        {unitLabel.toUpperCase()}
      </text>

      {ticks.map((tick) => {
        const y = margin.top + innerHeight - (tick / max) * innerHeight;
        return (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y}
              y2={y}
              stroke="#eef1f7"
              strokeWidth={1}
            />
            <text
              x={margin.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#748cb4"
            >
              {formatNumber(tick)}
            </text>
          </g>
        );
      })}

      {data.map((entry, index) => {
        const barHeight = Math.max(
          (entry.value / max) * innerHeight,
          entry.value > 0 ? 2 : 0,
        );
        const x = margin.left + band * index + (band - barWidth) / 2;
        const y = margin.top + innerHeight - barHeight;

        return (
          <g key={entry.label}>
            <title>
              {`${entry.label}: ${formatNumber(entry.value)} ${unitLabel}${
                entry.meta ? ` · ${entry.meta}` : ""
              }`}
            </title>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={5}
              fill={index === peak ? CHART_COLORS[3] : CHART_COLORS[1]}
            />
            <text
              x={x + barWidth / 2}
              y={y - 7}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#1c2740"
            >
              {formatNumber(entry.value)}
              {valueSuffix}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - margin.bottom + 17}
              textAnchor="middle"
              fontSize={10.5}
              fill="#526c99"
            >
              {entry.label}
            </text>
            {entry.meta ? (
              <text
                x={x + barWidth / 2}
                y={height - margin.bottom + 31}
                textAnchor="middle"
                fontSize={9}
                fill="#a6b5d1"
              >
                {entry.meta}
              </text>
            ) : null}
          </g>
        );
      })}

      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={margin.top + innerHeight}
        y2={margin.top + innerHeight}
        stroke="#cfd8e9"
        strokeWidth={1}
      />
    </svg>
  );
}
