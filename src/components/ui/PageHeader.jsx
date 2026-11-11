import React from 'react';
import {Box, Typography} from '@mui/material';

export default function PageHeader({title, subtitle, actions}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3}}>
      <Box>
        <Typography variant="h1">{title}</Typography>
        {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
      </Box>
      {actions}
    </Box>
  );
}
