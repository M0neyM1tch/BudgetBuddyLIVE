import { useId, useMemo } from 'react';
import type { GrowthPoint } from '../types/calculator.types';

type WealthProjectionChartProps = {
  series: GrowthPoint[];
  years: number;
};

type ChartPoint = {
  year: number;
  balance: number;
  contributions: number;
};

function compactDollarLabel(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function WealthProjectionChart({ series, years }: WealthProjectionChartProps) {
  const baseId = useId().replace(/:/g, '');
  const growthFillId = `growth-fill-${baseId}`;
  const contributionFillId = `contrib-fill-${baseId}`;
  const points = useMemo<ChartPoint[]>(
    () =>
      series.map((point) => ({
        year: point.year,
        balance: point.balanceCents / 100,
        contributions: point.contributionsCents / 100,
      })),
    [series],
  );

  if (points.length === 0) return null;

  const width = 600;
  const height = 240;
  const padLeft = 72;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 36;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const maxValue = Math.max(1, ...points.map((point) => point.balance));
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  function xPos(year: number) {
    return padLeft + ((year - 1) / Math.max(1, years - 1)) * chartWidth;
  }

  function yPos(value: number) {
    return padTop + chartHeight - (value / maxValue) * chartHeight;
  }

  function pathThrough(values: ChartPoint[], valueKey: 'balance' | 'contributions') {
    return values
      .map((point, index) => {
        const x = xPos(point.year).toFixed(1);
        const y = yPos(point[valueKey]).toFixed(1);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }

  const baselineY = (padTop + chartHeight).toFixed(1);
  const balancePath = pathThrough(points, 'balance');
  const contributionPath = pathThrough(points, 'contributions');
  const contributionAreaPath = `${contributionPath} L${xPos(lastPoint.year).toFixed(1)},${baselineY} L${xPos(firstPoint.year).toFixed(1)},${baselineY} Z`;
  const growthAreaPath = `${balancePath} ${points
    .slice()
    .reverse()
    .map((point) => `L${xPos(point.year).toFixed(1)},${yPos(point.contributions).toFixed(1)}`)
    .join(' ')} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
    value: maxValue * fraction,
    y: yPos(maxValue * fraction),
  }));
  const xTicks = points.filter(
    (point) => point.year === 1 || point.year % 5 === 0 || point.year === years,
  );
  const highlights = points.filter(
    (point) => point.year === 10 || point.year === 20 || point.year === years,
  );

  return (
    <div className="wealth-chart-wrap">
      <h4 className="wealth-chart-title">Wealth Projection</h4>
      <svg
        className="wealth-chart"
        viewBox={`0 0 ${width} ${height}`}
        aria-label="Wealth projection chart showing contributions and estimated growth over time"
        role="img"
      >
        <defs>
          <linearGradient id={growthFillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={contributionFillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-text-muted)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-text-muted)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={padLeft}
              y1={tick.y.toFixed(1)}
              x2={width - padRight}
              y2={tick.y.toFixed(1)}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={(padLeft - 6).toFixed(1)}
              y={tick.y.toFixed(1)}
              dy="0.35em"
              textAnchor="end"
              className="wealth-chart-tick"
            >
              {compactDollarLabel(tick.value)}
            </text>
          </g>
        ))}

        {xTicks.map((point) => (
          <text
            key={point.year}
            x={xPos(point.year).toFixed(1)}
            y={(padTop + chartHeight + 20).toFixed(1)}
            textAnchor="middle"
            className="wealth-chart-tick"
          >
            Yr {point.year}
          </text>
        ))}

        <path d={contributionAreaPath} fill={`url(#${contributionFillId})`} />
        <path d={growthAreaPath} fill={`url(#${growthFillId})`} />
        <path
          d={balancePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />

        {highlights.map((point) => (
          <g key={point.year}>
            <circle
              cx={xPos(point.year).toFixed(1)}
              cy={yPos(point.balance).toFixed(1)}
              r="4"
              fill="var(--color-primary)"
              stroke="var(--color-surface)"
              strokeWidth="2"
            />
            <text
              x={xPos(point.year).toFixed(1)}
              y={Math.max(padTop + 8, yPos(point.balance) - 10).toFixed(1)}
              textAnchor="middle"
              className="wealth-chart-label"
            >
              {compactDollarLabel(point.balance)}
            </text>
          </g>
        ))}
      </svg>

      <div className="wealth-chart-legend" aria-hidden="true">
        <span className="wealth-chart-legend-item wealth-chart-legend-item--growth">
          Estimated growth
        </span>
        <span className="wealth-chart-legend-item wealth-chart-legend-item--contrib">
          Contributions
        </span>
      </div>
    </div>
  );
}
