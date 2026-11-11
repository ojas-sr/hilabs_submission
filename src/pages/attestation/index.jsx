import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Alert, Box, Button, Divider, Grid, LinearProgress, Paper, Typography} from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import OpenInNew from '@mui/icons-material/OpenInNew';
import PageHeader from '../../components/ui/PageHeader';
import KpiTile from '../../components/ui/KpiTile';
import StatusChip from '../../components/ui/StatusChip';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {MAGIC_TOKEN} from '../../shared/constants/guide';
import {formatDateTime} from '../../shared/utils/format';

export default function AttestationPage() {
  const {state} = useDemo();
  const att = state.attestation;
  const link = `${window.location.origin}${window.location.pathname}#/attest/${MAGIC_TOKEN}`;
  return (
    <>
      <PageHeader
        eyebrow="Maple Street Family Medicine"
        title="90-day directory attestation"
        subtitle="The No Surprises Act requires providers to verify directory data every 90 days. Instead of 20 payer portals, the practice gets one email with a zero-login magic link, pre-filled with only what changed."
      />
      <Grid container spacing={2}>
        <Grid size={{xs: 12, md: 7}}>
          <Paper sx={{overflow: 'hidden'}} aria-label="Email preview">
            <Box sx={{px: 2, py: 1, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider'}}>
              <Typography variant="overline" color="text.secondary">Email preview (mock)</Typography>
            </Box>
            <Box sx={{p: 2}}>
              <Typography variant="body2" color="text.secondary"><strong>From:</strong> MedCare Roster Co-Pilot, on behalf of Northwind Health Plan, Summit Care and Bluewater Medicare Advantage</Typography>
              <Typography variant="body2" color="text.secondary"><strong>To:</strong> Rosa Alvarez, Maple Street Family Medicine</Typography>
              <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}}><strong>Subject:</strong> Action needed: confirm your directory data for 3 health plans (about 2 min)</Typography>
              <Divider sx={{mb: 2}} />
              <Typography sx={{mb: 1.5}}>Hi Rosa,</Typography>
              <Typography sx={{mb: 1.5}}>
                Your 90-day directory check-in for <strong>4 clinicians</strong> is due by <strong>Nov 17</strong>. We have pre-filled
                everything from NPPES and DataSpring and found <strong>4 possible changes</strong>. Please confirm or correct them.
                One confirmation covers all three health plans.
              </Typography>
              <Button variant="contained" size="medium" endIcon={<OpenInNew />} component={RouterLink} to={`/attest/${MAGIC_TOKEN}`} sx={{mb: 1.5}}>
                Review &amp; attest
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{display: 'flex', gap: 0.5, alignItems: 'center', wordBreak: 'break-all'}}>
                <LockOutlined sx={{fontSize: 14}} /> {link}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                No password needed. The link is single-use, tied to this practice, and expires in 7 days.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 5}}>
          <Paper sx={{p: 2, mb: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
              <Typography variant="h3" sx={{flex: 1}}>This practice</Typography>
              <StatusChip value={att.status === 'attested' ? 'approved' : 'review'} label={att.status === 'attested' ? 'Attested' : 'Due in 6 days'} />
            </Box>
            {att.status === 'attested' ? (
              <Alert severity="success">Attested {formatDateTime(att.attestedAt)} · {att.confirmationId}. Synced to 3 payers; next check-in due Feb 9, 2027.</Alert>
            ) : (
              <Typography variant="body2" color="text.secondary">Last attested Aug 12, 2026 via magic link (no changes).</Typography>
            )}
          </Paper>
          <Grid container spacing={2}>
            <Grid size={{xs: 6}}><KpiTile label="Completion in 5 days" value="47%" target="≥ 45%" onTarget helper="Pilot: 50 small practices" /></Grid>
            <Grid size={{xs: 6}}><KpiTile label="Phone/fax baseline" value="12%" helper="Same cohort, last cycle" /></Grid>
          </Grid>
          <Paper sx={{p: 2, mt: 2}}>
            <Typography variant="overline" color="text.secondary" component="div">Campaign progress (synthetic)</Typography>
            <LinearProgress variant="determinate" value={47} sx={{height: 8, borderRadius: 4, my: 1}} aria-label="Campaign completion 47%" />
            <Typography variant="body2" color="text.secondary">23 of 50 practices attested · median time to attest 1m 52s</Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
