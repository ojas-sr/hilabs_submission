import React from 'react';
import {Box, Paper, Typography} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutlined';

/** KPI tile: value, target, and an on/off-target indicator (icon + text, not colour alone). */
export default function KpiTile({label, value, target, onTarget, helper}) {
  const Icon = onTarget ? CheckCircleOutline : ErrorOutline;
  return (
    <Paper sx={{p: 2, height: '100%'}}>
      <Typography variant="overline" color="text.secondary" component="div" sx={{lineHeight: 1.4}}>{label}</Typography>
      <Typography sx={{fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, my: 0.5}}>{value}</Typography>
      {target && (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, color: onTarget ? 'success.main' : 'warning.main'}}>
          <Icon sx={{fontSize: 16}} />
          <Typography variant="body2" sx={{fontWeight: 500}}>{onTarget ? 'On target' : 'Below target'} · {target}</Typography>
        </Box>
      )}
      {helper && <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>{helper}</Typography>}
    </Paper>
  );
}
