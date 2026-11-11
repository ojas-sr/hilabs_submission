import React from 'react';
import {
  Box, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import PageHeader from '../../components/ui/PageHeader';
import KpiTile from '../../components/ui/KpiTile';
import TrendChart from '../../components/ui/TrendChart';
import TierChip from '../../components/ui/TierChip';
import StatusChip from '../../components/ui/StatusChip';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {TOUCHLESS_TREND} from '../../data/history';
import {pct} from '../../shared/utils/format';

const MANUAL_MIN_PER_ROW = 6; // baseline triage effort per roster row (assumption)
const FTE_HOURS_PER_MONTH = 160;

export default function PayerOpsPage() {
  const {state, payerDecision, notify} = useDemo();
  const last4 = TOUCHLESS_TREND.slice(-4);
  const rows = last4.reduce((s, w) => s + w.rows, 0);
  const touchlessRows = last4.reduce((s, w) => s + w.rows * w.rate, 0);
  const hoursSaved = Math.round((touchlessRows * MANUAL_MIN_PER_ROW) / 60);
  const queue = state.payerQueue;
  const open = queue.filter((q) => q.status === 'open');
  const current = TOUCHLESS_TREND[TOUCHLESS_TREND.length - 1].rate;

  const decide = (q, decision) => {
    payerDecision(q.id, decision);
    notify(decision === 'approved' ? `${q.id} approved and logged` : `${q.id} returned to ${q.group} via magic link`, decision === 'approved' ? 'success' : 'info');
  };

  return (
    <>
      <PageHeader
        eyebrow="Northwind Health Plan · Network operations"
        title="Payer ops: exceptions only"
        subtitle="Your team sees only what providers could not resolve themselves, each with the provider's note, the AI suggestion and the evidence. Everything else loaded touchless."
      />
      <Grid container spacing={2} sx={{mb: 2}}>
        <Grid size={{xs: 12, sm: 6, lg: 3}}><KpiTile label="Touchless rate (this week)" value={pct(current, 0)} target="≥ 80%" onTarget={current >= 0.8} helper={`Up from ${pct(TOUCHLESS_TREND[0].rate, 0)} 12 weeks ago`} /></Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}><KpiTile label="FTE hours saved (4 wks)" value={hoursSaved.toLocaleString()} helper={`≈ ${(hoursSaved / FTE_HOURS_PER_MONTH).toFixed(1)} FTE · ${rows.toLocaleString()} rows × ${MANUAL_MIN_PER_ROW} min manual triage avoided`} /></Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}><KpiTile label="Queue open" value={open.length} helper={`${queue.length - open.length} decided this session`} /></Grid>
        <Grid size={{xs: 12, sm: 6, lg: 3}}><KpiTile label="Updates live < 48h" value="98.6%" target="100%" onTarget={false} helper="No Surprises Act 2-business-day SLA" /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{xs: 12, lg: 5}}>
          <Paper sx={{p: 2, height: '100%'}}>
            <Typography variant="h3" sx={{mb: 1}}>Touchless auto-adjudication trend</Typography>
            <TrendChart data={TOUCHLESS_TREND} target={0.8} />
            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
              Weekly share of roster rows loaded with no human touch, across all delegated groups (synthetic).
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, lg: 7}}>
          <Paper>
            <Box sx={{px: 2, py: 1.5}}>
              <Typography variant="h3">Exception queue</Typography>
              <Typography variant="body2" color="text.secondary">Escalated by providers or held by Northwind rules</Typography>
            </Box>
            <TableContainer>
              <Table aria-label="Payer exception queue" sx={{minWidth: 720}}>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider / group</TableCell>
                    <TableCell>Issue &amp; AI suggestion</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell align="right">Decision</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queue.map((q) => (
                    <TableRow key={q.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{fontWeight: 600}}>{q.provider}</Typography>
                        <Typography variant="body2" color="text.secondary">{q.group} · {q.id}</Typography>
                      </TableCell>
                      <TableCell sx={{maxWidth: 300}}>
                        <Typography variant="body2" sx={{fontWeight: 500}}>{q.issue}</Typography>
                        <Typography variant="body2" color="text.secondary">AI: {q.aiSuggestion}</Typography>
                        <Typography variant="body2" color="text.secondary">{q.source}{q.providerNote ? `; "${q.providerNote}"` : ''}</Typography>
                      </TableCell>
                      <TableCell><TierChip tier={q.tier} /></TableCell>
                      <TableCell>{q.ageHours ? `${q.ageHours}h` : 'New'}</TableCell>
                      <TableCell align="right">
                        {q.status === 'open' ? (
                          <Box sx={{display: 'flex', gap: 0.75, justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                            <Button variant="contained" startIcon={<CheckIcon />} onClick={() => decide(q, 'approved')} aria-label={`Approve ${q.id}`}>Approve</Button>
                            <Button variant="outlined" startIcon={<UndoIcon />} onClick={() => decide(q, 'returned')} aria-label={`Return ${q.id} to provider`}>Return</Button>
                          </Box>
                        ) : <StatusChip value={q.status} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
