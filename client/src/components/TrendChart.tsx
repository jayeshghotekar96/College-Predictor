import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea } from 'recharts';
import type { CutoffRecord } from '../types';
import { projectTrend } from '../lib/prediction';

interface TrendChartProps {
  cutoffs: CutoffRecord[];
  category: string;
}

export function TrendChart({ cutoffs, category }: TrendChartProps) {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  
  // Group by year and calculate average/max percentile per year
  const years = Array.from(new Set(catCutoffs.map(c => c.year))).sort();
  const data = years.map(y => {
    const yearData = catCutoffs.filter(c => c.year === y);
    // Find the max round value to represent the year's closing cutoff
    const maxRound = Math.max(...yearData.map(c => c.round));
    const record = yearData.find(c => c.round === maxRound);
    return {
      year: y.toString(),
      Percentile: record ? parseFloat(record.percentile.toFixed(2)) : 0,
      Rank: record ? record.rank : 0,
    };
  });

  const trend = projectTrend(cutoffs, category);
  
  // Add projected next year data if we have sufficient data
  const chartData = [...data];
  if (trend.direction !== 'insufficient-data') {
    chartData.push({
      year: '2026 (Proj)',
      Percentile: parseFloat(trend.projected.toFixed(2)),
      Rank: 0, // Rank not projected
    });
  }

  const allPercentiles = chartData.map(d => d.Percentile).filter(p => p > 0);
  const minP = Math.max(0, Math.min(...allPercentiles) - 2);
  const maxP = Math.min(100, Math.max(...allPercentiles) + 2);

  return (
    <div className="w-full h-64 mt-4 bg-paper/50 p-4 rounded-md border border-paper-cool/50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-heading text-xs font-semibold text-ink uppercase tracking-wider">
          Historical & Projected Percentile Trend
        </h4>
        {trend.direction !== 'insufficient-data' && (
          <span className="text-[10px] mono bg-amber/10 text-amber font-semibold px-2 py-0.5 rounded-sm">
            Expected Range: {trend.low.toFixed(1)}% – {trend.high.toFixed(1)}%
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DD" />
          <XAxis 
            dataKey="year" 
            stroke="#5A6A8A" 
            fontSize={11} 
            fontFamily="JetBrains Mono" 
          />
          <YAxis 
            domain={[minP, maxP]} 
            stroke="#5A6A8A" 
            fontSize={11} 
            fontFamily="JetBrains Mono" 
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#16233F',
              border: 'none',
              borderRadius: '3px',
              color: '#F7F5F0',
              fontFamily: 'Inter',
              fontSize: '12px'
            }}
            formatter={(value: any, name: any) => [
              name === 'Percentile' ? `${value}%` : value,
              name
            ]}
          />
          
          {/* Shaded band for projection confidence interval */}
          {trend.direction !== 'insufficient-data' && (
            <ReferenceArea
              x1="2026 (Proj)"
              x2="2026 (Proj)"
              y1={trend.low}
              y2={trend.high}
              fill="var(--color-amber)"
              fillOpacity={0.15}
              stroke="var(--color-amber)"
              strokeDasharray="2 2"
              strokeWidth={1}
            />
          )}

          <Line 
            type="monotone" 
            dataKey="Percentile" 
            stroke="var(--color-ink)" 
            strokeWidth={2.5}
            activeDot={{ r: 6 }} 
            dot={(props: any) => {
              const isProjected = props.payload.year.includes('Proj');
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={5}
                  fill={isProjected ? 'var(--color-amber)' : 'var(--color-ink)'}
                  stroke="white"
                  strokeWidth={1.5}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SparklineProps {
  cutoffs: CutoffRecord[];
  category: string;
}

export function Sparkline({ cutoffs, category }: SparklineProps) {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  const years = Array.from(new Set(catCutoffs.map(c => c.year))).sort();
  const data = years.map(y => {
    const yearData = catCutoffs.filter(c => c.year === y);
    const maxRound = Math.max(...yearData.map(c => c.round));
    const record = yearData.find(c => c.round === maxRound);
    return {
      value: record ? record.percentile : 0,
    };
  }).filter(d => d.value > 0);

  if (data.length < 2) {
    return <span className="text-[10px] text-ink-muted">No trend data</span>;
  }

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const diff = maxV - minV;

  // Render a simple lightweight inline SVG sparkline
  const width = 60;
  const height = 18;
  const padding = 2;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = diff === 0 
      ? height / 2 
      : height - padding - ((d.value - minV) / diff) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = values[values.length - 1] >= values[0] 
    ? 'var(--color-safe)' 
    : 'var(--color-reach)';

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        points={points}
      />
      <circle
        cx={padding + (data.length - 1) * (width - padding * 2) / (data.length - 1)}
        cy={height - padding - (diff === 0 ? height/2 - padding : ((values[values.length - 1] - minV) / diff) * (height - padding * 2))}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
}
