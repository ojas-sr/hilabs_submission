import React from 'react';
import {Box, Link, Typography} from '@mui/material';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import {DISCLAIMER} from '../../shared/constants';

export default function Footer({onAbout}) {
  return (
    <Box component="footer" sx={{borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
      <ScienceOutlined sx={{fontSize: 16, color: 'text.secondary'}} aria-hidden />
      <Typography variant="body2" color="text.secondary">
        <strong>{DISCLAIMER}</strong> Payer names are fictional. No real provider or patient information.
      </Typography>
      {onAbout && (
        <Link component="button" variant="body2" onClick={onAbout} sx={{ml: 'auto'}}>About this prototype</Link>
      )}
    </Box>
  );
}
