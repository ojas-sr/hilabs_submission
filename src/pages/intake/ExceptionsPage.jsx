import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {
  Box, Button, Grid, LinearProgress, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import DoneAll from '@mui/icons-material/DoneAll';
import ArrowForward from '@mui/icons-material/ArrowForward';
import KeyboardDoubleArrowUp from '@mui/icons-material/KeyboardDoubleArrowUp';
import DragHandle from '@mui/icons-material/DragHandle';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PageHeader from '../../components/ui/PageHeader';
import IntakeStepper from '../../components/ui/IntakeStepper';
import EmptyState from '../../components/ui/EmptyState';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {pct} from '../../shared/utils/format';
import ExceptionCard from './ExceptionCard';
import ResolveDialog from './ResolveDialog';

const RULES = [
  [KeyboardDoubleArrowUp, 'success.main', 'High (≥ 90%)', 'Can be bulk-accepted in one click.'],
  [DragHandle, 'warning.main', 'Medium / Low', 'Need explicit confirmation, one row at a time.'],
  [LockOutlined, 'text.secondary', 'Protected fields', 'TIN, dates, licence, entity and network status are never auto-overwritten.'],
];

export default function ExceptionsPage() {
  const {state, resolve, notify} = useDemo();
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState(null); // {exception, mode}
  const {intake} = state;

  if (!intake) {
    return (
      <>
        <PageHeader eyebrow="Roster intake" title="Pre-flight results" />
        <IntakeStepper active={2} />
        <EmptyState title="No roster loaded yet" body="Load the sample messy roster to see how only the true exceptions surface." actionLabel="Go to Zero-Template Drop" to="/intake" />
      </>
    );
  }
  const {exceptions, stats} = intake.result;
  const resolvedCount = exceptions.filter((e) => e.status !== 'open').length;
  const bulkable = exceptions.filter((e) => e.status === 'open' && e.tier === 'high' && !e.protected);
  const shown = exceptions.filter((e) => (filter === 'all' ? true : filter === 'open' ? e.status === 'open' : e.tier === filter));
  const locked = Boolean(state.submission);

  const done = (item) => {
    resolve([item]);
    setDialog(null);
    notify(item.status === 'rejected' ? 'Rejected: original kept and escalated to payer ops' : 'Fix applied and logged to audit trail');
  };
  const accept = (e, oneClick) => {
    if (oneClick) { resolve([{id: e.id, status: 'accepted'}]); notify(`Accepted: ${e.suggested}`); } else setDialog({exception: e, mode: 'confirm'});
  };
  const bulk = () => {
    resolve(bulkable.map((e) => ({id: e.id, status: 'accepted'})), true);
    notify(`${bulkable.length} High-confidence fixes accepted in bulk`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Roster intake"
        title="Pre-flight results: exceptions only"
        subtitle="Rows that passed every check are already done. Only these need a human, and each shows its evidence, the AI's suggested fix and a confidence tier."
        actions={<Button variant="contained" endIcon={<ArrowForward />} component={RouterLink} to="/intake/submit">Continue to submit</Button>}
      />
      <IntakeStepper active={2} />

      <Grid container spacing={2} sx={{mb: 2}}>
        <Grid size={{xs: 12, md: 7}}>
          <Paper sx={{p: 2, height: '100%'}}>
            <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap', mb: 1.5}}>
              {[
                ['Rows', stats.totalRows], ['Touchless', `${stats.touchlessRows} (${pct(stats.touchlessRate)})`],
                ['Auto-normalised values', stats.normalisations], ['Exceptions', exceptions.length],
              ].map(([l, v]) => (
                <Box key={l}>
                  <Typography variant="overline" color="text.secondary" component="div">{l}</Typography>
                  <Typography sx={{fontSize: '1.25rem', fontWeight: 600}}>{v}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
              <LinearProgress
                variant="determinate"
                value={exceptions.length ? (resolvedCount / exceptions.length) * 100 : 100}
                color={resolvedCount === exceptions.length ? 'success' : 'primary'}
                sx={{flex: 1, height: 8, borderRadius: 4}}
                aria-label="Exceptions resolved"
              />
              <Typography sx={{fontWeight: 600, whiteSpace: 'nowrap'}} aria-live="polite">
                {resolvedCount} of {exceptions.length} exceptions resolved
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 5}}>
          <Paper sx={{p: 2, height: '100%'}}>
            <Typography variant="overline" color="text.secondary" component="div" sx={{mb: 0.5}}>3-tier confidence rule</Typography>
            <Stack spacing={0.75}>
              {RULES.map(([Icon, color, a, b]) => (
                <Box key={a} sx={{display: 'flex', gap: 1, alignItems: 'flex-start'}}>
                  <Icon sx={{fontSize: 18, color, mt: 0.1}} aria-hidden />
                  <Typography variant="body2"><strong>{a}:</strong> {b}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 2}}>
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, v) => v && setFilter(v)} aria-label="Filter exceptions">
          <ToggleButton value="all">All ({exceptions.length})</ToggleButton>
          <ToggleButton value="open">Open ({exceptions.length - resolvedCount})</ToggleButton>
          <ToggleButton value="high">High</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="low">Low</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{flex: 1}} />
        <Button data-tour="bulk" variant="contained" color="success" startIcon={<DoneAll />} disabled={!bulkable.length || locked} onClick={bulk}>
          Accept all High-confidence ({bulkable.length})
        </Button>
      </Box>

      {locked && (
        <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}}>
          This roster has been submitted, so decisions are read-only. Drop a new file to start another intake.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {shown.map((e) => (
          <ExceptionCard
            key={e.id}
            e={locked && e.status === 'open' ? {...e, status: 'rejected'} : e}
            onAccept={accept}
            onEdit={(x) => setDialog({exception: x, mode: 'edit'})}
            onReject={(x) => setDialog({exception: x, mode: 'reject'})}
          />
        ))}
        {!shown.length && <Typography color="text.secondary">Nothing matches this filter.</Typography>}
      </Stack>

      {dialog && <ResolveDialog exception={dialog.exception} mode={dialog.mode} onClose={() => setDialog(null)} onDone={done} />}
    </>
  );
}
