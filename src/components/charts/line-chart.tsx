export type LinePoint = {
  label: string;
  value: number;
  meta?: string;
};

/**
 * Line chart with a soft area fill. Used for cumulative/concentration trends
 * where the x axis is ordered (item rank, floor order, etc.).
 */
export function LineChart({
  points,
  max,
  suffix = "%",
  unitLabel = "share",
  height = 260,
}: {
  points: LinePoint[];
  max?: number;
  suffix?: string;
  unitLabel?: string;
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-xs text-ink-400">
        Not enough data to chart.
      </p>
    );
  }

  const width = 720;
  const margin = { top: 24, right: 24, bottom: 40, left: 46 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const yMax = max ?? Math.max(...points.map((point) => point.value), 1) * 1.1;

  const xAt = (index: number) =>
    margin.left + (index / (points.length - 1)) * innerWidth;
  const yAt = (value: number) =>
    margin.top + innerHeight - (value / yMax) * innerHeight;

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index)} ${yAt(point.value)}`)
    .join(" ");
  const area = `${line} L ${xAt(points.length - 1)} ${
    margin.top + innerHeight
  } L ${xAt(0)} ${margin.top + innerHeight} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => yMax * step);
  const labelEvery = Math.max(1, Math.ceil(points.length / 10));
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Line chart of cumulative ${unitLabel}`}
    >
      <text
        x={margin.left}
        y={12}
        fontSize={9.5}
        fontWeight={700}
        letterSpacing={1.4}
        fill="#a6b5d1"
        className="hidden sm:block"
      >
        {`CUMULATIVE ${unitLabel.toUpperCase()}`}
      </text>

      {ticks.map((tick) => {
        const y = yAt(tick);
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
              className="hidden sm:block"
            >
              {Math.round(tick)}
              {suffix}
            </text>
          </g>
        );
      })}

      <path d={area} fill="#3d557e" fillOpacity={0.08} />
      <path
        d={line}
        fill="none"
        stroke="#1c2740"
        strokeWidth={2.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((point, index) => (
        <g key={`${point.label}-${index}`}>
          <title>
            {`${point.label}: ${point.value}${suffix}${
              point.meta ? ` · ${point.meta}` : ""
            }`}
          </title>
          <circle
            cx={xAt(index)}
            cy={yAt(point.value)}
            r={index === points.length - 1 ? 4.5 : 3.25}
            fill={index === points.length - 1 ? "#c98a1c" : "#ffffff"}
            stroke={index === points.length - 1 ? "#c98a1c" : "#1c2740"}
            strokeWidth={1.75}
          />
          {index % labelEvery === 0 || index === points.length - 1 ? (
            <text
              x={xAt(index)}
              y={height - margin.bottom + 16}
              textAnchor="middle"
              fontSize={9.5}
              fill="#748cb4"
              className="hidden sm:block"
            >
              {point.label}
            </text>
          ) : null}
        </g>
      ))}

      <text
        x={xAt(points.length - 1) - 6}
        y={yAt(last.value) - 10}
        textAnchor="end"
        fontSize={11}
        fontWeight={700}
        fill="#a96a15"
      >
        {`${last.value}${suffix}`}
      </text>

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
