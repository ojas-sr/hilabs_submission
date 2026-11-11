import React from 'react';
import {Box, Typography} from '@mui/material';

export default function PageHeader({title, subtitle, actions, eyebrow}) {
  return (
    <Box sx={{display: 'flex', alignItems: {xs: 'stretch', sm: 'flex-start'}, justifyContent: 'space-between', gap: 2, mb: 2.5, flexDirection: {xs: 'column', sm: 'row'}}}>
      <Box sx={{minWidth: 0}}>
        {eyebrow && <Typography variant="overline" color="primary" component="div">{eyebrow}</Typography>}
        <Typography variant="h1">{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{mt: 0.5, maxWidth: 760}}>{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0}}>{actions}</Box>}
    </Box>
  );
}
