import React, {useState} from 'react';
import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Typography,
} from '@mui/material';

const DATE_TYPES = ['retro_date', 'date_unparseable', 'license_expired', 'termination'];

/**
 * mode: 'confirm' (accept AI fix with explicit attestation), 'edit' (manual value), 'reject' (escalate with note).
 * Medium/Low tiers and protected fields always pass through here; there is no silent overwrite.
 */
export default function ResolveDialog({exception: e, mode, onClose, onDone}) {
  const isDate = DATE_TYPES.includes(e.type);
  const [value, setValue] = useState(mode === 'edit' ? (e.type === 'license_expired' ? '' : e.value ?? '') : '');
  const [note, setNote] = useState('');
  const [ack, setAck] = useState(false);
  const needsAck = mode !== 'reject';
  const title = mode === 'confirm' ? 'Confirm AI fix' : mode === 'edit' ? 'Edit value' : 'Reject AI suggestion';
  const canSave = (!needsAck || ack) && (mode !== 'edit' || String(value).trim());

  const save = () => {
    onDone({
      id: e.id,
      status: mode === 'confirm' ? 'accepted' : mode === 'edit' ? 'edited' : 'rejected',
      value: mode === 'edit' ? value : undefined,
      note,
    });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="resolve-title">
      <DialogTitle id="resolve-title">{title}: {e.title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}}>{e.providerName} · NPI {e.npi}{e.rowRefs.length ? ` · row ${e.rowRefs.join(', ')}` : ''}</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1.5, mb: 2}}>
          <Box sx={{p: 1.5, bgcolor: 'grey.50', borderRadius: 1}}>
            <Typography variant="overline" color="text.secondary" component="div">Original (roster)</Typography>
            <Typography>{e.current}</Typography>
          </Box>
          <Box sx={{p: 1.5, bgcolor: 'primary.light', borderRadius: 1}}>
            <Typography variant="overline" color="primary" component="div">{mode === 'edit' ? 'AI suggested' : mode === 'reject' ? 'AI suggested (will not apply)' : 'Will become'}</Typography>
            <Typography>{e.suggested}</Typography>
          </Box>
        </Box>
        {e.protected && mode !== 'reject' && (
          <Alert severity="warning" sx={{mb: 2}}>
            <strong>{e.fieldLabel}</strong> is a contract or clinical field. The Co-Pilot never changes it without explicit human confirmation.
          </Alert>
        )}
        {mode === 'edit' && (
          <TextField
            autoFocus
            fullWidth
            type={isDate ? 'date' : 'text'}
            label={e.type === 'license_expired' ? 'Verified renewal expiry date' : `New ${e.fieldLabel.toLowerCase()}`}
            value={value}
            onChange={(ev) => setValue(ev.target.value)}
            slotProps={{inputLabel: {shrink: true}}}
            sx={{mb: 2}}
          />
        )}
        <TextField
          fullWidth
          multiline
          minRows={2}
          label={mode === 'reject' ? 'Reason for payer ops (optional)' : 'Note for audit trail (optional)'}
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          sx={{mb: needsAck ? 1 : 0}}
        />
        {mode === 'reject' && (
          <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
            The original value is kept and the row is held. It goes to the payer ops queue with your note.
          </Typography>
        )}
        {needsAck && (
          <FormControlLabel
            control={<Checkbox checked={ack} onChange={(ev) => setAck(ev.target.checked)} />}
            label="I confirm this change is correct. It will be recorded under my name in the audit trail."
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color={mode === 'reject' ? 'error' : 'primary'} disabled={!canSave} onClick={save}>
          {mode === 'confirm' ? 'Confirm fix' : mode === 'edit' ? 'Save edit' : 'Reject and escalate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
