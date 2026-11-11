import React from 'react';
import {Box, LinearProgress, Typography} from '@mui/material';
import {tierFor} from '../../shared/constants';

const COLOR = {high: 'success', medium: 'warning', low: 'error'};

export default function ConfidenceBar({value, label}) {
  const tier = tierFor(value);
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, minWidth: 120}}>
      <LinearProgress
        variant="determinate"
        value={value * 100}
        color={COLOR[tier]}
        aria-label={label ?? 'Confidence'}
        sx={{flex: 1, height: 6, borderRadius: 3, bgcolor: 'grey.100'}}
      />
      <Typography variant="body2" sx={{width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500}}>
        {Math.round(value * 100)}%
      </Typography>
    </Box>
  );
}
