import React from 'react';
import {Chip} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutlined';
import HighlightOff from '@mui/icons-material/HighlightOff';
import Schedule from '@mui/icons-material/Schedule';
import Send from '@mui/icons-material/SendOutlined';
import PauseCircleOutline from '@mui/icons-material/PauseCircleOutlined';
import {status} from '../../styles/tokens';

// Every status pairs colour with a text label and an icon (WCAG 1.4.1).
const MAP = {
  approved: ['Approved', 'success', CheckCircleOutline],
  live: ['Live', 'success', CheckCircleOutline],
  accepted: ['Accepted', 'success', CheckCircleOutline],
  edited: ['Edited', 'success', CheckCircleOutline],
  review: ['Needs review', 'warning', ErrorOutline],
  held: ['Held', 'warning', PauseCircleOutline],
  open: ['Open', 'warning', ErrorOutline],
  escalated: ['Escalated', 'warning', ErrorOutline],
  rejected: ['Rejected', 'error', HighlightOff],
  returned: ['Returned to provider', 'info', Send],
  submitted: ['Submitted', 'info', Send],
  processing: ['In progress', 'info', Schedule],
  draft: ['Draft', 'pending', Schedule],
};

export default function StatusChip({value, label: override, sx}) {
  const [label, key, Icon] = MAP[value] ?? [value, 'pending', Schedule];
  const c = status[key];
  return (
    <Chip
      icon={<Icon sx={{fontSize: 14}} />}
      label={override ?? label}
      sx={{bgcolor: c.bg, color: c.main, fontWeight: 500, '& .MuiChip-icon': {color: c.main}, ...sx}}
    />
  );
}
