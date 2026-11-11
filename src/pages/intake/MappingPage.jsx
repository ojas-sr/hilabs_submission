import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {
  Alert, Box, Button, Chip, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import EastIcon from '@mui/icons-material/East';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ErrorOutline from '@mui/icons-material/ErrorOutlined';
import PageHeader from '../../components/ui/PageHeader';
import IntakeStepper from '../../components/ui/IntakeStepper';
import ConfidenceBar from '../../components/ui/ConfidenceBar';
import EmptyState from '../../components/ui/EmptyState';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {CANONICAL_FIELDS, fieldByKey} from '../../data/canonicalFields';
import {pct} from '../../shared/utils/format';

export default function MappingPage() {
  const {state, setMapping, notify} = useDemo();
  const {intake} = state;
  if (!intake) {
    return (
      <>
        <PageHeader eyebrow="Roster intake" title="AI schema mapping" />
        <IntakeStepper active={1} />
        <EmptyState title="No roster loaded yet" body="Drop a file or use the sample messy roster to see how the Co-Pilot maps any header layout to the canonical schema." actionLabel="Go to Zero-Template Drop" to="/intake" />
      </>
    );
  }
  const {mapping, result} = intake;
  const mapped = mapping.filter((m) => m.target).length;
  const review = mapping.filter((m) => m.target && m.confidence < 0.9 && !m.userEdited).length;

  return (
    <>
      <PageHeader
        eyebrow="Roster intake"
        title="AI schema mapping"
        subtitle={`Each source column in "${intake.fileName}" is mapped to the canonical roster schema, with a confidence score and the reason. Override any mapping with the dropdown; pre-flight re-runs instantly.`}
        actions={<Button variant="contained" endIcon={<ArrowForward />} component={RouterLink} to="/intake/exceptions">Confirm mapping</Button>}
      />
      <IntakeStepper active={1} />
      <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2}}>
        <Chip color="success" label={`${mapped}/${mapping.length} columns mapped`} />
        <Chip color={review ? 'warning' : 'success'} icon={review ? <ErrorOutline /> : undefined} label={`${review} below 90%: worth a glance`} />
        <Chip variant="outlined" label={`${result.stats.normalisations} values normalised`} />
        <Chip variant="outlined" label={`Pre-flight: ${pct(result.stats.touchlessRate)} touchless · ${result.exceptions.length} exceptions`} />
      </Box>
      {review > 0 && (
        <Alert severity="info" sx={{mb: 2}}>
          Lower-confidence mappings are highlighted. For example, "St" could mean State or Street; the Co-Pilot inferred State
          because every value is a 2-letter code.
        </Alert>
      )}
      <Paper>
        <TableContainer>
          <Table aria-label="Column mapping" sx={{minWidth: 820}}>
            <TableHead>
              <TableRow>
                <TableCell>Source column</TableCell>
                <TableCell>Sample values</TableCell>
                <TableCell aria-label="maps to" />
                <TableCell sx={{width: 250}}>Canonical field</TableCell>
                <TableCell sx={{width: 160}}>Confidence</TableCell>
                <TableCell>Why</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mapping.map((m) => {
                const flagged = m.target && m.confidence < 0.9 && !m.userEdited;
                return (
                  <TableRow key={m.source} sx={flagged ? {bgcolor: 'warning.light'} : undefined}>
                    <TableCell sx={{fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap'}}>{m.source}</TableCell>
                    <TableCell sx={{color: 'text.secondary', maxWidth: 220}}>
                      <Typography variant="body2" noWrap title={m.sample.join(' | ')}>{m.sample.join(' · ') || '—'}</Typography>
                    </TableCell>
                    <TableCell><EastIcon fontSize="small" color="action" aria-hidden /></TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={m.target}
                        onChange={(e) => { setMapping(m.source, e.target.value); notify(`"${m.source}" mapped to ${e.target.value ? fieldByKey[e.target.value].label : 'Ignore'}; pre-flight re-run`, 'info'); }}
                        slotProps={{select: {displayEmpty: true, SelectDisplayProps: {'aria-label': `Canonical field for column ${m.source}`}}}}
                      >
                        <MenuItem value=""><em>Ignore column</em></MenuItem>
                        {CANONICAL_FIELDS.map((f) => (
                          <MenuItem key={f.key} value={f.key}>
                            {f.label}{f.protected ? ' (protected)' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>{m.target ? <ConfidenceBar value={m.confidence} label={`Mapping confidence for ${m.source}`} /> : <Typography variant="body2" color="text.secondary">Ignored</Typography>}</TableCell>
                    <TableCell>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        {m.target && fieldByKey[m.target].protected && <LockOutlined sx={{fontSize: 14, color: 'text.secondary'}} titleAccess="Protected contract/clinical field" />}
                        <Typography variant="body2" color={m.userEdited ? 'primary' : 'text.secondary'}>{m.reason}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Typography variant="body2" color="text.secondary" sx={{mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5}}>
        <LockOutlined sx={{fontSize: 14}} /> Protected fields (TIN, effective date, licence, specialty) are never auto-overwritten; any AI change to them needs explicit confirmation.
      </Typography>
    </>
  );
}
