import React, {useEffect, useRef, useState} from 'react';
import {Link as RouterLink, useSearchParams} from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Paper, Typography,
} from '@mui/material';
import SendOutlined from '@mui/icons-material/SendOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import RuleOutlined from '@mui/icons-material/RuleOutlined';
import PageHeader from '../../components/ui/PageHeader';
import IntakeStepper from '../../components/ui/IntakeStepper';
import EmptyState from '../../components/ui/EmptyState';
import StatusChip from '../../components/ui/StatusChip';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {PAYERS} from '../../data/payers';

const STEP_MS = 700;

export default function SubmitPage() {
  const {state, submit, notify} = useDemo();
  const {intake, submission} = state;
  const [routing, setRouting] = useState(submission ? PAYERS.length : -1);
  const [params, setParams] = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (routing < 0 || routing >= PAYERS.length) return undefined;
    const t = setTimeout(() => setRouting((r) => r + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [routing]);

  const go = () => {
    submit();
    setRouting(0);
    notify('Submitted once; routing to 3 payers', 'info');
  };

  useEffect(() => {
    if (params.get('go') === '1' && !ran.current) {
      ran.current = true;
      setParams({}, {replace: true});
      if (intake && !submission) go();
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!intake) {
    return (
      <>
        <PageHeader eyebrow="Roster intake" title="Submit & per-payer routing" />
        <IntakeStepper active={3} />
        <EmptyState title="Nothing to submit yet" body="Load a roster and review its exceptions first." actionLabel="Go to Zero-Template Drop" to="/intake" />
      </>
    );
  }

  const ex = intake.result.exceptions;
  const unresolved = ex.filter((e) => e.status === 'open' || e.status === 'rejected');
  const done = submission && routing >= PAYERS.length;

  return (
    <>
      <PageHeader
        eyebrow="Roster intake"
        title="Submit once, route to every payer"
        subtitle="One shared provider identity goes to each payer's isolated tenant. Each payer applies its own confidential rules (retro limits, directory fields, delegation terms), so outcomes can differ per payer."
        actions={done
          ? <Button variant="contained" endIcon={<ArrowForward />} component={RouterLink} to="/tracker">Open Claims-Ready tracker</Button>
          : <Button variant="contained" startIcon={<SendOutlined />} onClick={go} disabled={Boolean(submission)}>Submit to 3 payers</Button>}
      />
      <IntakeStepper active={3} />

      {!submission && (
        <Alert severity={unresolved.length ? 'warning' : 'success'} sx={{mb: 2}}>
          {intake.result.stats.totalRows} rows from {intake.result.groupName}. {ex.length - unresolved.length} of {ex.length} exceptions resolved.
          {unresolved.length > 0 && ` ${unresolved.length} unresolved or rejected row(s) will be held and sent to payer ops with the evidence attached.`}
        </Alert>
      )}
      {submission && (
        <Alert severity="success" sx={{mb: 2}}>
          Submission <strong>{submission.id}</strong>: {submission.providers.length} provider records and {submission.terminations.filter((t) => !t.escalated).length} termination(s) routed. Exceptions resolved: {submission.resolved} of {submission.exceptionCount}.
        </Alert>
      )}

      <Grid container data-tour="payers" spacing={2}>
        {PAYERS.map((p, i) => {
          const r = submission?.results.find((x) => x.payerId === p.id);
          const pending = submission && routing <= i;
          return (
            <Grid key={p.id} size={{xs: 12, md: 4}}>
              <Paper sx={{p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                  <Box sx={{flex: 1}}>
                    <Typography variant="h3">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.line} · core: {p.core}</Typography>
                  </Box>
                  {!submission && <StatusChip value="draft" label="Ready" />}
                  {pending && <CircularProgress size={18} aria-label={`Running ${p.short} rules`} />}
                  {r && !pending && <StatusChip value={r.status} label={r.status === 'review' ? `Needs review (${r.held.length})` : 'Validated'} />}
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, color: 'secondary.main'}}>
                  <ShieldOutlined sx={{fontSize: 16}} />
                  <Typography variant="body2" sx={{fontWeight: 600}}>Isolated rule set (tenant sandbox)</Typography>
                </Box>
                <List dense disablePadding>
                  {p.rules.map((rule) => (
                    <ListItem key={rule.id} disableGutters sx={{py: 0}}>
                      <ListItemIcon sx={{minWidth: 26}}><RuleOutlined sx={{fontSize: 16}} /></ListItemIcon>
                      <ListItemText primary={rule.label} />
                    </ListItem>
                  ))}
                </List>
                {r && !pending && (
                  <>
                    <Divider sx={{my: 1.5}} />
                    <Box sx={{display: 'flex', gap: 3, mb: 1}}>
                      <Box><Typography variant="overline" color="text.secondary" component="div">Accepted</Typography><Typography sx={{fontWeight: 600, fontSize: '1.25rem'}}>{r.accepted}</Typography></Box>
                      <Box><Typography variant="overline" color="text.secondary" component="div">Held</Typography><Typography sx={{fontWeight: 600, fontSize: '1.25rem'}}>{r.held.length}</Typography></Box>
                      <Box><Typography variant="overline" color="text.secondary" component="div">Terms</Typography><Typography sx={{fontWeight: 600, fontSize: '1.25rem'}}>{r.terminations}</Typography></Box>
                    </Box>
                    {r.held.slice(0, 4).map((h) => (
                      <Typography key={h.key} variant="body2" sx={{mb: 0.5}}>
                        <strong>{h.name}</strong>: {h.reasons[0]}
                      </Typography>
                    ))}
                    {r.held.length > 4 && <Typography variant="body2" color="text.secondary">+{r.held.length - 4} more</Typography>}
                    {!r.held.length && <Typography variant="body2" color="text.secondary">All records passed {p.short} rules.</Typography>}
                  </>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
