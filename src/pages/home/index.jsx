import React from 'react';
import {Link as RouterLink, Navigate, useNavigate} from 'react-router-dom';
import {
  Alert, Box, Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined';
import PageHeader from '../../components/ui/PageHeader';
import KpiTile from '../../components/ui/KpiTile';
import StatusChip from '../../components/ui/StatusChip';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {KPI_BASELINE, PAST_SUBMISSIONS} from '../../data/history';
import {PAYERS} from '../../data/payers';
import {formatDate, pct} from '../../shared/utils/format';
import {payerStage} from '../../shared/utils/tracker';

function currentPayerStatus(sub, payerId) {
  const r = sub.results.find((x) => x.payerId === payerId);
  if (payerStage(sub, payerId) === 4) return r.held.length ? ['live', `Live · ${r.held.length} held`] : ['live'];
  return r.held.length ? ['review', `Needs review (${r.held.length})`] : ['processing'];
}

export default function HomePage() {
  const {state, persona, setGuide, reset} = useDemo();
  const navigate = useNavigate();
  const base = KPI_BASELINE[state.persona] ?? KPI_BASELINE.groupAdmin;
  const sub = state.submission && state.submission.persona === state.persona ? state.submission : null;
  const intake = state.intake;
  const reviewing = intake && !state.submission && state.persona !== 'payerOps';
  const openExceptions = reviewing ? intake.result.exceptions.filter((e) => e.status === 'open').length : sub ? 0 : base.openExceptions;
  const touchless = sub ? sub.touchlessRate : base.touchless;
  const past = PAST_SUBMISSIONS[state.persona] ?? PAST_SUBMISSIONS.groupAdmin;
  const isPractice = state.persona === 'practice';

  const startDemo = () => { reset(true); setGuide({active: true, step: 0}); navigate('/'); };
  if (state.persona === 'payerOps') return <Navigate to="/payer-ops" replace />;

  return (
    <>
      <PageHeader
        eyebrow={persona.org}
        title="Roster health overview"
        subtitle={isPractice
          ? '4 clinicians, 3 payers. Keep your directory listings accurate with one 90-day check-in instead of 20 portals.'
          : `${persona.clinicians} clinicians across 6 sites, routed to 3 payers. Drop rosters in any format; only exceptions need you.`}
        actions={(
          <>
            <Button variant="outlined" startIcon={isPractice ? <MarkEmailReadOutlined /> : <CloudUploadOutlined />} component={RouterLink} to={isPractice ? '/attestation' : '/intake'}>
              {isPractice ? 'Open attestation' : 'Drop a roster'}
            </Button>
            <Button variant="contained" startIcon={<PlayCircleOutline />} onClick={startDemo}>Start guided demo</Button>
          </>
        )}
      />

      {!state.guide.active && (
        <Alert
          severity="info"
          sx={{mb: 2}}
          action={<Button color="inherit" onClick={startDemo}>Start (2 min)</Button>}
        >
          New here? A 2-minute tour explains why this product exists, where it is positioned, and the 3 personas it serves: a large group, a small practice and the health plan.
        </Alert>
      )}

      <Grid container data-tour="kpis" spacing={2} sx={{mb: 2}}>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <KpiTile label="Touchless auto-adjudication" value={pct(touchless)} target="≥ 80%" onTarget={touchless >= 0.8}
            helper={sub ? `Latest submission · ${sub.rowCount} rows` : 'Rows passing with no human touch, last 30 days'} />
        </Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <KpiTile label="Exceptions open" value={openExceptions} target="0 before submit" onTarget={openExceptions === 0}
            helper={reviewing ? 'In the roster you are reviewing' : sub ? 'Unresolved items now with payer ops' : 'Awaiting your decision'} />
        </Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <KpiTile label="Median time to live" value={`${base.medianHoursToLive}h`} target="< 48h SLA" onTarget={base.medianHoursToLive < 48}
            helper="Submission to live in directory (was 21+ days)" />
        </Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}>
          <KpiTile label="Directory accuracy" value={pct(base.directoryAccuracy)} target="≥ 95%" onTarget={base.directoryAccuracy >= 0.95}
            helper="Sampled against NPPES + DataSpring (CMS audit avg ~52%)" />
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography variant="h3">Recent submissions</Typography>
          <Typography variant="body2" color="text.secondary">Status per payer</Typography>
        </Box>
        <TableContainer>
          <Table aria-label="Recent submissions with per-payer status">
            <TableHead>
              <TableRow>
                <TableCell>Submission</TableCell>
                <TableCell>File</TableCell>
                <TableCell align="right">Rows</TableCell>
                <TableCell align="right">Touchless</TableCell>
                {PAYERS.map((p) => <TableCell key={p.id}>{p.name}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {sub && (
                <TableRow hover selected>
                  <TableCell><Link component={RouterLink} to="/tracker">{sub.id}</Link><Typography variant="body2" color="text.secondary">Today</Typography></TableCell>
                  <TableCell>{sub.fileName}</TableCell>
                  <TableCell align="right">{sub.rowCount}</TableCell>
                  <TableCell align="right">{pct(sub.touchlessRate)}</TableCell>
                  {PAYERS.map((p) => { const [v, l] = currentPayerStatus(sub, p.id); return <TableCell key={p.id}><StatusChip value={v} label={l} /></TableCell>; })}
                </TableRow>
              )}
              {!sub && reviewing && (
                <TableRow hover>
                  <TableCell><Link component={RouterLink} to="/intake/exceptions">Draft</Link><Typography variant="body2" color="text.secondary">Today</Typography></TableCell>
                  <TableCell>{intake.fileName}</TableCell>
                  <TableCell align="right">{intake.result.stats.totalRows}</TableCell>
                  <TableCell align="right">{pct(intake.result.stats.touchlessRate)}</TableCell>
                  {PAYERS.map((p) => <TableCell key={p.id}><StatusChip value="draft" /></TableCell>)}
                </TableRow>
              )}
              {past.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.id}<Typography variant="body2" color="text.secondary">{formatDate(s.date)}</Typography></TableCell>
                  <TableCell sx={{maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{s.file}</TableCell>
                  <TableCell align="right">{s.rows}</TableCell>
                  <TableCell align="right">{pct(s.touchless)}</TableCell>
                  {PAYERS.map((p) => <TableCell key={p.id}><StatusChip value={s.payers[p.id]} label={s.payers[p.id] === 'review' ? 'Needs review (1)' : undefined} /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
