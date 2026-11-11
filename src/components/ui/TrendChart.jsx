import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';

/** Minimal responsive SVG line chart with a target line and hover readout. */
export default function TrendChart({data, target, height = 180, format = (v) => `${Math.round(v * 100)}%`}) {
  const theme = useTheme();
  const [hover, setHover] = useState(null);
  const W = 600; const H = height; const pad = {l: 36, r: 12, t: 12, b: 24};
  const min = 0.5; const max = 1;
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (data.length - 1);
  const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.rate)}`).join(' ');
  const last = data[data.length - 1];
  const active = hover ?? data.length - 1;
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}} aria-live="polite">
        {data[active].week}: <strong>{format(data[active].rate)}</strong> touchless · {data[active].rows.toLocaleString()} rows
      </Typography>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Touchless rate rose from ${format(data[0].rate)} to ${format(last.rate)} over ${data.length} weeks; target ${format(target)}`}
        onMouseLeave={() => setHover(null)}
        style={{display: 'block'}}
      >
        {[0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke={theme.palette.divider} />
            <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={theme.palette.text.secondary}>{format(v)}</text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} stroke={theme.palette.secondary.main} strokeDasharray="4 4" />
        <text x={W - pad.r} y={y(target) - 4} textAnchor="end" fontSize="11" fill={theme.palette.secondary.main}>Target {format(target)}</text>
        <path d={path} fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.week} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - 20} y={0} width={40} height={H} fill="transparent" />
            <circle cx={x(i)} cy={y(d.rate)} r={i === active ? 5 : 3} fill={theme.palette.background.paper} stroke={theme.palette.primary.main} strokeWidth="2" />
            {(i % 3 === 0 || i === data.length - 1) && (
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill={theme.palette.text.secondary}>{d.week}</text>
            )}
          </g>
        ))}
      </svg>
    </Box>
  );
}
