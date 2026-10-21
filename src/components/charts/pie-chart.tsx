import { CHART_COLORS } from "@/components/ui/primitives";
import { formatNumber, percent } from "@/lib/utils";

export type PieDatum = {
  label: string;
  value: number;
};

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

/**
 * True pie chart (full-radius slices) with a legend. Pure SVG so it renders in
 * React Server Components with no hydration cost.
 */
export function PieChart({
  data,
  unitLabel = "units",
  size = 240,
}: {
  data: PieDatum[];
  unitLabel?: string;
  size?: number;
}) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-xs text-ink-400">No data to chart.</p>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 6;
  let angle = 0;

  const slices = data.map((entry, index) => {
    const sweep = (entry.value / total) * 360;
    const start = angle;
    angle += sweep;
    return {
      ...entry,
      start,
      end: angle,
      color: CHART_COLORS[index % CHART_COLORS.length],
      share: percent(entry.value, total),
    };
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-[200px] w-[200px] shrink-0"
        role="img"
        aria-label={`Pie chart of ${unitLabel} by category`}
      >
        {slices.map((slice) => {
          const fullCircle = slice.end - slice.start >= 359.99;
          if (fullCircle) {
            return (
              <circle
                key={slice.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill={slice.color}
              >
                <title>
                  {`${slice.label}: ${formatNumber(slice.value)} ${unitLabel} (100%)`}
                </title>
              </circle>
            );
          }

          const [x1, y1] = polar(cx, cy, radius, slice.start);
          const [x2, y2] = polar(cx, cy, radius, slice.end);
          const largeArc = slice.end - slice.start > 180 ? 1 : 0;
          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={slice.label}
              d={path}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinejoin="round"
            >
              <title>
                {`${slice.label}: ${formatNumber(slice.value)} ${unitLabel} (${slice.share}%)`}
              </title>
            </path>
          );
        })}
        <circle cx={cx} cy={cy} r={2.5} fill="#ffffff" opacity={0.9} />
      </svg>

      <ul className="w-full space-y-1.5">
        {slices.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2 text-ink-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink-400">
              {formatNumber(slice.value)}
              <span className="ml-1.5 text-ink-300">{slice.share}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
