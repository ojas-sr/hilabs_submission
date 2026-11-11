import React, {useMemo, useState} from 'react';
import {
  Box, Button, Chip, Drawer, FormControlLabel, Grid, IconButton, Paper, Step, StepLabel, Stepper, Switch, Typography,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import MoveToInbox from '@mui/icons-material/MoveToInboxOutlined';
import TimerOutlined from '@mui/icons-material/TimerOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import Close from '@mui/icons-material/Close';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import StatusChip from '../../components/ui/StatusChip';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {PAYERS} from '../../data/payers';
import {TRACKER_STAGES, SLA_HOURS} from '../../shared/constants';
import {formatDateTime} from '../../shared/utils/format';
import {payerStage, slaInfo, stageTimes} from '../../shared/utils/tracker';

const stageLabel = (i, payer) => (i === 3 ? `Loaded in claims (${payer.core})` : TRACKER_STAGES[i]);

function SlaChip({sub, payerId}) {
  const s = slaInfo(sub, payerId);
  if (s.live) {
    return <Chip icon={<CheckCircleOutline />} color="success" label={`Live in ${s.elapsed}h · ${s.remaining}h inside SLA`} />;
  }
  return <Chip icon={<TimerOutlined />} color={s.remaining < 12 ? 'warning' : 'info'} variant="outlined" label={`SLA: ${Math.round(s.remaining)}h of ${SLA_HOURS}h left`} />;
}

function PayerStepper({sub, payer, held, orientation = 'horizontal'}) {
  const stage = payerStage(sub, payer.id);
  const times = stageTimes(sub, payer.id);
  const active = held ? 1 : stage;
  return (
    <Stepper activeStep={active === 4 ? 5 : active + 1} alternativeLabel={orientation === 'horizontal'} orientation={orientation} sx={{minWidth: orientation === 'horizontal' ? 520 : undefined}}>
      {TRACKER_STAGES.map((_, i) => {
        const isHeld = held && i === 2;
        return (
          <Step key={i} completed={i <= active}>
            <StepLabel
              error={isHeld}
              optional={(
                <Typography variant="body2" color={isHeld ? 'warning.main' : 'text.secondary'} sx={{fontSize: '0.75rem'}}>
                  {isHeld ? 'Held: see reason' : i <= active && times[i] ? formatDateTime(times[i]) : 'Pending'}
                </Typography>
              )}
            >
              {stageLabel(i, payer)}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

export default function TrackerPage() {
  const {state, ack, notify} = useDemo();
  const sub = state.submission;
  const [heldOnly, setHeldOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const heldMap = useMemo(() => {
    const m = {};
    sub?.results.forEach((r) => r.held.forEach((h) => { (m[h.key] ||= {})[r.payerId] = h.reasons; }));
    return m;
  }, [sub]);

  const rows = useMemo(() => (sub ? sub.providers.map((p) => ({id: p.key, ...p, held: Boolean(heldMap[p.key])})) : []), [sub, heldMap]);

  if (!sub) {
    return (
      <>
        <PageHeader title="Claims-Ready tracker" />
        <EmptyState title="No submission in flight" body="Submit a roster to see, per provider and per payer, when each clinician can bill." actionLabel="Start with the sample roster" to="/intake" />
      </>
    );
  }

  const allLive = PAYERS.every((p) => payerStage(sub, p.id) === 4);
  const columns = [
    {field: 'name', headerName: 'Provider', flex: 1.2, minWidth: 180},
    {field: 'npi', headerName: 'NPI', width: 120},
    {field: 'specialty', headerName: 'Specialty', flex: 1, minWidth: 140},
    ...PAYERS.map((p) => ({
      field: p.id, headerName: p.short, width: 170, sortable: false,
      valueGetter: (_v, row) => (heldMap[row.key]?.[p.id] ? 'Held' : stageLabel(payerStage(sub, p.id), p)),
      renderCell: ({row}) => (heldMap[row.key]?.[p.id]
        ? <StatusChip value="held" />
        : payerStage(sub, p.id) === 4 ? <StatusChip value="live" /> : <StatusChip value="processing" label={TRACKER_STAGES[payerStage(sub, p.id)]} />),
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow={sub.groupName}
        title="Claims-Ready tracker"
        subtitle={`${sub.id} · submitted ${formatDateTime(sub.submittedAt)}. See when each doctor can bill, per payer, against the 2-business-day directory SLA. Timestamps are simulated from payer ack files.`}
        actions={(
          <Button variant="contained" startIcon={<MoveToInbox />} disabled={allLive} onClick={() => { ack(); notify('Payer ack file processed: statuses advanced', 'info'); }}>
            {allLive ? 'All payers live' : 'Simulate payer ack file'}
          </Button>
        )}
      />

      <Grid container spacing={2} sx={{mb: 2}}>
        {PAYERS.map((p) => {
          const r = sub.results.find((x) => x.payerId === p.id);
          return (
            <Grid key={p.id} size={{xs: 12}}>
              <Paper sx={{p: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5}}>
                  <Typography variant="h3" sx={{mr: 'auto'}}>{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.accepted} providers on track · {r.held.length} held</Typography>
                  <SlaChip sub={sub} payerId={p.id} />
                </Box>
                <Box sx={{overflowX: 'auto'}}>
                  <PayerStepper sub={sub} payer={p} />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper>
        <Box sx={{px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
          <Typography variant="h3" sx={{mr: 'auto'}}>Provider × payer status</Typography>
          <FormControlLabel control={<Switch checked={heldOnly} onChange={(e) => setHeldOnly(e.target.checked)} />} label={`Held only (${rows.filter((r) => r.held).length})`} />
        </Box>
        <Box sx={{height: 460}}>
          <DataGrid
            rows={heldOnly ? rows.filter((r) => r.held) : rows}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            showToolbar
            label="Providers"
            onRowClick={({row}) => setSelected(row)}
            initialState={{pagination: {paginationModel: {pageSize: 50}}}}
            pageSizeOptions={[25, 50, 100]}
            sx={{border: 0, '& .MuiDataGrid-row': {cursor: 'pointer'}}}
          />
        </Box>
      </Paper>

      <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)} slotProps={{paper: {sx: {width: {xs: '100%', sm: 420}, p: 2}}}}>
        {selected && (
          <>
            <Box sx={{display: 'flex', alignItems: 'flex-start', mb: 2}}>
              <Box sx={{flex: 1}}>
                <Typography variant="h2">{selected.name}</Typography>
                <Typography color="text.secondary">NPI {selected.npi} · {selected.specialty} · {selected.city}</Typography>
              </Box>
              <IconButton aria-label="Close provider detail" onClick={() => setSelected(null)}><Close /></IconButton>
            </Box>
            {PAYERS.map((p) => {
              const reasons = heldMap[selected.key]?.[p.id];
              return (
                <Box key={p.id} sx={{mb: 2.5}}>
                  <Typography sx={{fontWeight: 600, mb: 1}}>{p.name}</Typography>
                  <PayerStepper sub={sub} payer={p} held={Boolean(reasons)} orientation="vertical" />
                  {reasons && <Typography variant="body2" color="warning.main" sx={{mt: 1}}>{reasons.join(' · ')}</Typography>}
                </Box>
              );
            })}
          </>
        )}
      </Drawer>
    </>
  );
}
