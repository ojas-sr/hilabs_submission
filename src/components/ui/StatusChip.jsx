import React from 'react';
import {Chip} from '@mui/material';
import {status} from '../../styles/tokens';

const MAP = {
  approved: ['Approved', 'success'], review: ['Needs review', 'warning'],
  rejected: ['Rejected', 'error'], submitted: ['Submitted', 'info'], draft: ['Draft', 'pending'],
};

export default function StatusChip({value}) {
  const [label, key] = MAP[value] ?? [value, 'pending'];
  return <Chip label={label} sx={{bgcolor: status[key].bg, color: status[key].main, fontWeight: 500}} />;
}
