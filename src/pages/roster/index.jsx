import React from 'react';
import {Paper} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import PageHeader from '../../components/ui/PageHeader';

const columns = [
  {field: 'name', headerName: 'Provider', flex: 1},
  {field: 'specialty', headerName: 'Specialty', flex: 1},
  {field: 'location', headerName: 'Location', flex: 1},
  {field: 'status', headerName: 'Status', width: 120},
];

export default function RosterPage() {
  return (
    <>
      <PageHeader title="Roster" subtitle="Synthetic data only" />
      <Paper sx={{height: 420}}>
        <DataGrid rows={[]} columns={columns} density="compact" disableRowSelectionOnClick />
      </Paper>
    </>
  );
}
