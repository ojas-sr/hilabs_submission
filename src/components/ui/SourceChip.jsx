import React from 'react';
import {Chip} from '@mui/material';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';

/** Evidence source tag (teal = "verified" per design principles). */
export default function SourceChip({source}) {
  return (
    <Chip
      icon={<VerifiedOutlined sx={{fontSize: 14}} />}
      label={source}
      sx={{bgcolor: 'secondary.light', color: 'secondary.main', fontWeight: 600, '& .MuiChip-icon': {color: 'secondary.main'}}}
    />
  );
}
