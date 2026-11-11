import React from 'react';
import {Grid, Paper, Typography} from '@mui/material';
import PageHeader from '../../components/ui/PageHeader';

const KPIS = ['Pending changes', 'Directory accuracy', 'Avg. time to live'];

export default function HomePage() {
  return (
    <>
      <PageHeader title="Overview" subtitle="Roster health across your organization" />
      <Grid container spacing={2}>
        {KPIS.map((k) => (
          <Grid size={{xs: 12, md: 4}} key={k}>
            <Paper sx={{p: 2}}>
              <Typography color="text.secondary">{k}</Typography>
              <Typography variant="h2">&mdash;</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
