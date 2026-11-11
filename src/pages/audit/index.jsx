import React, {useMemo, useState} from 'react';
import {Alert, Box, Button, MenuItem, Paper, TextField, Tooltip, Typography} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import BugReportOutlined from '@mui/icons-material/BugReportOutlined';
import PageHeader from '../../components/ui/PageHeader';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {entryHash} from '../../shared/utils/hash';
import {formatDateTime} from '../../shared/utils/format';

function verify(entries) {
  let prev = '0000000000000000';
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.prevHash !== prev || entryHash(e, prev) !== e.hash) return {ok: false, at: e.id};
    prev = e.hash;
  }
  return {ok: true, count: entries.length, head: prev};
}

const mono = {fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.75rem'};

export default function AuditPage() {
  const {state} = useDemo();
  const [eventFilter, setEventFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [check, setCheck] = useState(null);

  const events = useMemo(() => [...new Set(state.audit.map((a) => a.event))], [state.audit]);
  const actors = useMemo(() => [...new Set(state.audit.map((a) => a.actor))], [state.audit]);
  const rows = useMemo(() => [...state.audit].reverse().filter((a) => (!eventFilter || a.event === eventFilter) && (!actorFilter || a.actor === actorFilter)), [state.audit, eventFilter, actorFilter]);

  const columns = [
    {field: 'ts', headerName: 'Timestamp', width: 140, valueFormatter: (v) => formatDateTime(v)},
    {field: 'actor', headerName: 'Actor', width: 150},
    {field: 'event', headerName: 'Event', width: 150},
    {field: 'record', headerName: 'Record', flex: 1, minWidth: 180},
    {field: 'field', headerName: 'Field', width: 120},
    {field: 'original', headerName: 'Original value', flex: 1, minWidth: 170},
    {field: 'aiSuggestion', headerName: 'AI suggestion', flex: 1, minWidth: 170},
    {field: 'action', headerName: 'User action', width: 190},
    {field: 'final', headerName: 'Final value', flex: 1, minWidth: 160},
    {
      field: 'hash', headerName: 'Hash', width: 150, sortable: false,
      renderCell: ({row}) => (
        <Tooltip title={`prev ${row.prevHash} → ${row.hash}`}>
          <Box component="span" sx={mono}>{row.hash.slice(0, 12)}…</Box>
        </Tooltip>
      ),
    },
  ];

  const runVerify = () => setCheck({...verify(state.audit), tamper: false});
  const runTamper = () => {
    // Simulates someone silently editing an old entry in the store; the chain no longer verifies.
    const copy = state.audit.map((a) => ({...a}));
    const target = copy[Math.min(2, copy.length - 1)];
    target.final = `${target.final} (edited)`;
    setCheck({...verify(copy), tamper: true});
  };

  return (
    <>
      <PageHeader
        title="Audit trail"
        subtitle="Append-only log: Original value → AI suggestion → User action → Timestamp → Actor. Each entry hashes the previous one, so any silent edit breaks the chain (tamper-evident)."
        actions={(
          <>
            <Button variant="outlined" startIcon={<BugReportOutlined />} onClick={runTamper}>Simulate tamper</Button>
            <Button variant="contained" startIcon={<VerifiedUserOutlined />} onClick={runVerify}>Verify chain</Button>
          </>
        )}
      />
      {check && (
        <Alert severity={check.ok ? 'success' : 'error'} sx={{mb: 2}} onClose={() => setCheck(null)}>
          {check.ok
            ? `Chain intact: ${check.count} entries verified. Head hash ${check.head}.`
            : `Chain broken at ${check.at}${check.tamper ? ' (simulated edit to a copy; the real log is unchanged)' : ''}. The edit is detectable.`}
        </Alert>
      )}
      <Paper>
        <Box sx={{display: 'flex', gap: 1.5, p: 1.5, flexWrap: 'wrap', alignItems: 'center'}}>
          <TextField select label="Event" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} sx={{minWidth: 180}}>
            <MenuItem value="">All events</MenuItem>
            {events.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
          <TextField select label="Actor" value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} sx={{minWidth: 180}}>
            <MenuItem value="">All actors</MenuItem>
            {actors.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
          <Typography variant="body2" color="text.secondary" sx={{ml: 'auto'}}>{rows.length} of {state.audit.length} entries · newest first</Typography>
        </Box>
        <Box sx={{height: 560}}>
          <DataGrid
            rows={rows}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            showToolbar
            label="Audit entries"
            getRowHeight={() => 'auto'}
            initialState={{pagination: {paginationModel: {pageSize: 25}}}}
            pageSizeOptions={[25, 50, 100]}
            sx={{border: 0, '& .MuiDataGrid-cell': {py: 0.75, whiteSpace: 'normal', lineHeight: 1.4, alignItems: 'center', display: 'flex'}}}
          />
        </Box>
      </Paper>
    </>
  );
}
