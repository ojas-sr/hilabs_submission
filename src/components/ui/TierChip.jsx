import React from 'react';
import {Chip, Tooltip} from '@mui/material';
import KeyboardDoubleArrowUp from '@mui/icons-material/KeyboardDoubleArrowUp';
import DragHandle from '@mui/icons-material/DragHandle';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import {status} from '../../styles/tokens';

const TIER = {
  high: ['High', 'success', KeyboardDoubleArrowUp, 'High confidence: eligible for bulk accept'],
  medium: ['Medium', 'warning', DragHandle, 'Medium confidence: confirm each row'],
  low: ['Low', 'error', KeyboardArrowDown, 'Low confidence: confirm each row; review evidence'],
};

export default function TierChip({tier, confidence}) {
  const [label, key, Icon, tip] = TIER[tier];
  const c = status[key];
  return (
    <Tooltip title={tip}>
      <Chip
        variant="outlined"
        icon={<Icon sx={{fontSize: 14}} />}
        label={`${label}${confidence != null ? ` · ${Math.round(confidence * 100)}%` : ''}`}
        sx={{borderColor: c.main, color: c.main, fontWeight: 600, '& .MuiChip-icon': {color: c.main}}}
      />
    </Tooltip>
  );
}
