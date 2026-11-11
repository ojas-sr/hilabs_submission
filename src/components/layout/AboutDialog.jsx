import React from 'react';
import {Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Typography} from '@mui/material';
import {DISCLAIMER} from '../../shared/constants';

const POINTS = [
  ['Zero-Template Drop', 'Any CSV in its native layout; the AI maps headers to a canonical schema.'],
  ['Pre-flight gatekeeper', 'Simulated NPPES, PECOS, state licence and DataSpring checks before anything reaches a payer.'],
  ['Exceptions only', 'Humans see only the ~5% of rows that need judgement, with evidence and a 3-tier confidence rule.'],
  ['Federated routing', 'One submission and one shared provider identity; each payer keeps its own isolated rule set.'],
  ['Claims-Ready tracker', 'Shows, per payer, when each provider can bill, against a 2-business-day SLA.'],
  ['Magic-link attestation', 'Zero-login 90-day No Surprises Act check-in, pre-filled with diffs only.'],
];

export default function AboutDialog({open, onClose, onStart}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="about-title">
      <DialogTitle id="about-title">MedCare Roster Co-Pilot</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{mb: 2}}>{DISCLAIMER}</Alert>
        <Typography sx={{mb: 1}}>
          An AI-native intake, pre-flight validation and exception gateway for delegated provider rosters. It is not a
          manual data-entry portal.
        </Typography>
        <List dense disablePadding>
          {POINTS.map(([a, b]) => (
            <ListItem key={a} disableGutters><ListItemText primary={a} secondary={b} /></ListItem>
          ))}
        </List>
        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
          Everything runs in your browser. Names, addresses, TINs and NPIs are fabricated (all NPIs start with 9, which
          no real NPI does), and confidence scores come from deterministic rules. Payer names are fictional. State is kept
          in localStorage; use Reset demo to start over.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onStart}>Start guided demo</Button>
      </DialogActions>
    </Dialog>
  );
}
