import React from 'react';
import {Paper, Typography} from '@mui/material';
import PageHeader from '../../components/ui/PageHeader';

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit trail" subtitle="Versioned history of roster changes" />
      <Paper sx={{p: 2}}>
        <Typography color="text.secondary">No changes recorded yet.</Typography>
      </Paper>
    </>
  );
}
