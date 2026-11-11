import React, {useMemo, useState} from 'react';
import {Link as RouterLink, useParams} from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Container, IconButton, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircle from '@mui/icons-material/CheckCircle';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import Footer from '../../components/layout/Footer';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {MAPLE_PROVIDERS} from '../../data/providers';
import {MAGIC_TOKEN} from '../../shared/constants/guide';
import {formatDate, formatDateTime} from '../../shared/utils/format';

const FIELDS = [
  ['suite', 'Suite (214 Maple St, Madison WI)'], ['phone', 'Practice phone'], ['specialty', 'Specialty'],
  ['accepting', 'Accepting new patients'], ['languages', 'Languages spoken'],
];
const show = (k, v) => (k === 'accepting' ? (v === 'Y' ? 'Yes' : 'No') : k === 'suite' ? `Suite ${v}` : v);

export default function MagicLinkPage() {
  const {token} = useParams();
  const {state, attest} = useDemo();
  // choice per diff: 'nppes' | 'keep'; edits: free-text overrides
  const initial = useMemo(() => Object.fromEntries(MAPLE_PROVIDERS.flatMap((p) => Object.keys(p.nppes).map((k) => [`${p.id}.${k}`, 'nppes']))), []);
  const [choice, setChoice] = useState(initial);
  const [edits, setEdits] = useState({});
  const [editing, setEditing] = useState(null);
  const diffCount = Object.keys(initial).length;
  const done = state.attestation.status === 'attested';

  if (token !== MAGIC_TOKEN) {
    return (
      <Container maxWidth="sm" sx={{py: 8}}>
        <Alert severity="error">This link is invalid or has expired. Ask your health plan to resend it.</Alert>
      </Container>
    );
  }

  const valueFor = (p, k) => {
    const id = `${p.id}.${k}`;
    if (edits[id] !== undefined) return edits[id];
    if (p.nppes[k] !== undefined && choice[id] === 'nppes') return p.nppes[k];
    return p[k];
  };

  const submit = () => {
    const changes = [];
    MAPLE_PROVIDERS.forEach((p) => FIELDS.forEach(([k, label]) => {
      const id = `${p.id}.${k}`;
      const final = valueFor(p, k);
      if (final === p[k] && p.nppes[k] === undefined) return;
      changes.push({
        provider: `${p.first} ${p.last}, ${p.credential}`, npi: p.npi, field: label.split(' (')[0], original: show(k, p[k]),
        suggested: p.nppes[k] !== undefined ? `${show(k, p.nppes[k])} (NPPES)` : undefined,
        action: edits[id] !== undefined ? 'Edited inline' : p.nppes[k] !== undefined ? (choice[id] === 'nppes' ? 'Accepted NPPES value' : 'Kept current value') : 'Edited inline',
        final: show(k, final),
      });
    }));
    attest(changes);
  };

  return (
    <Box sx={{minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default'}}>
      <Box component="header" sx={{bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: 2, py: 1.25}}>
        <Container maxWidth="md" disableGutters sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Typography variant="h3" color="primary">MedCare</Typography>
          <Typography variant="body2" color="text.secondary" sx={{mr: 'auto'}}>Roster Co-Pilot</Typography>
          <Chip icon={<LockOutlined sx={{fontSize: 14}} />} label="Secure link · no login · expires Nov 18" variant="outlined" />
        </Container>
      </Box>

      <Container component="main" maxWidth="md" sx={{py: 3, pb: {xs: 26, md: 4}, flex: 1}}>
        <Typography variant="overline" color="primary" component="div">90-day directory check-in · Maple Street Family Medicine</Typography>
        <Typography variant="h1" sx={{mb: 0.5}}>Hi Rosa, is this still correct?</Typography>
        <Typography color="text.secondary" sx={{mb: 2}}>
          One confirmation updates Northwind Health Plan, Summit Care and Bluewater Medicare Advantage.
        </Typography>

        {done ? (
          <Paper sx={{p: 3, textAlign: 'center'}}>
            <CheckCircle color="success" sx={{fontSize: 48}} />
            <Typography variant="h2" sx={{mt: 1}}>Thanks, you're all set</Typography>
            <Typography color="text.secondary" sx={{mt: 1}}>
              Attested {formatDateTime(state.attestation.attestedAt)} · confirmation <strong>{state.attestation.confirmationId}</strong>
            </Typography>
            <Typography color="text.secondary">
              {state.attestation.changes.filter((c) => c.original !== c.final).length} change(s) synced to 3 payers. Next check-in due {formatDate('2027-02-09')}.
            </Typography>
            <Button sx={{mt: 2}} component={RouterLink} to="/audit" variant="outlined">See it in the audit trail</Button>
          </Paper>
        ) : (
          <>
            <Alert icon={<AutoAwesomeOutlined />} severity="info" sx={{mb: 2}}>
              <strong>We found {diffCount} changes from NPPES.</strong> They are highlighted below and pre-selected. Keep your
              current value if NPPES is wrong, or edit any field inline.
            </Alert>
            <Stack spacing={1.5}>
              {MAPLE_PROVIDERS.map((p) => {
                const diffs = Object.keys(p.nppes).length;
                return (
                  <Paper key={p.id} component="section" aria-label={`${p.first} ${p.last}`} sx={{p: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap'}}>
                      <Typography sx={{fontWeight: 600, mr: 'auto'}}>{p.first} {p.last}, {p.credential}<Typography component="span" variant="body2" color="text.secondary"> · NPI {p.npi}</Typography></Typography>
                      {diffs ? <Chip color="warning" label={`${diffs} change${diffs > 1 ? 's' : ''} found`} /> : <Chip icon={<CheckIcon />} color="success" variant="outlined" label="No changes" />}
                    </Box>
                    {FIELDS.map(([k, label]) => {
                      const id = `${p.id}.${k}`;
                      const hasDiff = p.nppes[k] !== undefined;
                      return (
                        <Box
                          key={k}
                          sx={{
                            display: 'grid', gridTemplateColumns: {xs: '1fr auto', sm: '200px 1fr auto'}, gap: 1, alignItems: 'center',
                            py: 0.75, px: 1, borderRadius: 1, bgcolor: hasDiff ? 'warning.light' : 'transparent',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{gridColumn: {xs: '1 / -1', sm: 'auto'}}}>{label}</Typography>
                          {editing === id ? (
                            <TextField
                              autoFocus
                              size="small"
                              defaultValue={valueFor(p, k)}
                              label={`Edit ${label}`}
                              onBlur={(e) => { setEdits((x) => ({...x, [id]: e.target.value})); setEditing(null); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditing(null); }}
                            />
                          ) : (
                            <Box>
                              <Typography variant="body2" sx={{fontWeight: hasDiff ? 600 : 400}}>
                                {show(k, valueFor(p, k))}
                                {edits[id] !== undefined && <Chip label="Edited" sx={{ml: 1}} />}
                              </Typography>
                              {hasDiff && edits[id] === undefined && (
                                <Typography variant="body2" color="text.secondary">
                                  {choice[id] === 'nppes' ? `Was: ${show(k, p[k])}` : `NPPES says: ${show(k, p.nppes[k])}`} · NPPES updated {formatDate(p.nppesUpdated)}
                                </Typography>
                              )}
                            </Box>
                          )}
                          <Box sx={{display: 'flex', gap: 0.5, alignItems: 'center'}}>
                            {hasDiff && edits[id] === undefined && (
                              <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={choice[id]}
                                onChange={(_, v) => v && setChoice((c) => ({...c, [id]: v}))}
                                aria-label={`${label} for ${p.first} ${p.last}`}
                              >
                                <ToggleButton value="nppes">Use NPPES</ToggleButton>
                                <ToggleButton value="keep">Keep current</ToggleButton>
                              </ToggleButtonGroup>
                            )}
                            <Tooltip title="Edit">
                              <IconButton size="small" aria-label={`Edit ${label} for ${p.first} ${p.last}`} onClick={() => setEditing(id)}><EditOutlined fontSize="small" /></IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>
                );
              })}
            </Stack>
            <Paper data-tour="attest" sx={{p: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', position: 'sticky', bottom: 8}}>
              <Typography variant="body2" color="text.secondary" sx={{flex: 1, minWidth: 220}}>
                By attesting you confirm this data is accurate as of today for all listed plans (No Surprises Act 90-day verification).
              </Typography>
              <Button variant="contained" size="large" startIcon={<CheckIcon />} onClick={submit}>All correct, attest</Button>
            </Paper>
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
