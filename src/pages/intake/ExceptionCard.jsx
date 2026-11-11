import React from 'react';
import {Box, Button, Chip, Paper, Tooltip, Typography} from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import LockOutlined from '@mui/icons-material/LockOutlined';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlined from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TierChip from '../../components/ui/TierChip';
import StatusChip from '../../components/ui/StatusChip';
import SourceChip from '../../components/ui/SourceChip';

export default function ExceptionCard({e, onAccept, onEdit, onReject}) {
  const open = e.status === 'open';
  const oneClick = e.tier === 'high' && !e.protected;
  const canEdit = e.type !== 'duplicate';
  const final = e.status === 'edited' ? e.resolution?.value : e.status === 'accepted' ? e.suggested : null;
  return (
    <Paper
      component="article"
      aria-label={`${e.title} for ${e.providerName}`}
      sx={{p: 2, borderLeftWidth: 4, borderLeftColor: open ? `${e.tier === 'high' ? 'success' : e.tier === 'medium' ? 'warning' : 'error'}.main` : 'grey.200', opacity: open ? 1 : 0.85}}
    >
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 1.5}}>
        <Box sx={{flex: 1, minWidth: 220}}>
          <Typography sx={{fontWeight: 600}}>{e.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {e.providerName} · NPI {e.npi}{e.rowRefs.length ? ` · row ${e.rowRefs.join(' & ')}` : ' · not in this file'}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center'}}>
          {e.protected && (
            <Tooltip title="Contract or clinical field: never auto-overwritten">
              <Chip icon={<LockOutlined sx={{fontSize: 14}} />} label="Protected" variant="outlined" />
            </Tooltip>
          )}
          <TierChip tier={e.tier} confidence={e.confidence} />
          {!open && <StatusChip value={e.status === 'rejected' ? 'escalated' : e.status} />}
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr auto 1fr'}, gap: 1, alignItems: 'stretch', mb: 1.5}}>
        <Box sx={{p: 1.25, bgcolor: 'grey.50', borderRadius: 1}}>
          <Typography variant="overline" color="text.secondary" component="div">In your roster</Typography>
          <Typography variant="body2" sx={{textDecoration: final ? 'line-through' : 'none'}}>{e.current}</Typography>
        </Box>
        <Box sx={{display: {xs: 'none', sm: 'flex'}, alignItems: 'center'}}><EastIcon color="action" aria-hidden /></Box>
        <Box sx={{p: 1.25, bgcolor: 'primary.light', borderRadius: 1}}>
          <Typography variant="overline" color="primary" component="div">{final ? 'Applied' : 'AI-suggested fix'}</Typography>
          <Typography variant="body2" sx={{fontWeight: 500}}>{final ?? e.suggested}</Typography>
        </Box>
      </Box>

      <Box component="ul" sx={{listStyle: 'none', p: 0, m: 0, mb: open ? 1.5 : 0, display: 'grid', gap: 0.75}}>
        {e.evidence.map((ev) => (
          <Box component="li" key={ev.source + ev.detail} sx={{display: 'flex', gap: 1, alignItems: 'flex-start'}}>
            <SourceChip source={ev.source} />
            <Typography variant="body2" sx={{pt: 0.25}}>{ev.detail}</Typography>
          </Box>
        ))}
      </Box>

      {!open && e.resolution?.note && (
        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>Note: {e.resolution.note}</Typography>
      )}

      {open && (
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={() => onAccept(e, oneClick)}>
            {oneClick ? 'Accept 1-click fix' : 'Review & accept'}
          </Button>
          <Tooltip title={canEdit ? '' : 'Merge or keep both: accept or reject'}>
            <span><Button variant="outlined" startIcon={<EditOutlined />} disabled={!canEdit} onClick={() => onEdit(e)}>Edit</Button></span>
          </Tooltip>
          <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => onReject(e)}>Reject</Button>
          {!oneClick && (
            <Typography variant="body2" color="text.secondary" sx={{alignSelf: 'center'}}>
              {e.protected ? 'Protected field: confirmation required' : `${e.tier === 'medium' ? 'Medium' : 'Low'} confidence: confirm per row`}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
