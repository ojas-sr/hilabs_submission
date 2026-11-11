import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Box, Button, IconButton, LinearProgress, Paper, Tooltip, Typography} from '@mui/material';
import Close from '@mui/icons-material/Close';
import Remove from '@mui/icons-material/Remove';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutlined';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {GUIDE_STEPS} from '../../shared/constants/guide';

const matches = (route, path) => (route.startsWith('/attest/') ? path.startsWith('/attest/') : route === path);

/** Floating coach-mark panel that walks an evaluator through the whole story. */
export default function DemoGuide() {
  const {state, setGuide, setPersona} = useDemo();
  const {guide} = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [min, setMin] = useState(false);

  // Keep the step in sync when the user navigates on their own.
  useEffect(() => {
    if (!guide.active) return;
    const i = GUIDE_STEPS.findIndex((s) => matches(s.route, location.pathname));
    if (i >= 0 && i !== guide.step) {
      setGuide({step: i});
      if (GUIDE_STEPS[i].persona !== state.persona) setPersona(GUIDE_STEPS[i].persona);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!guide.active) return null;
  const step = GUIDE_STEPS[guide.step];
  const last = guide.step === GUIDE_STEPS.length - 1;

  const goTo = (i) => {
    const s = GUIDE_STEPS[i];
    setPersona(s.persona);
    setGuide({step: i});
    navigate(s.route);
  };

  const next = () => {
    if (last) { setGuide({active: false}); return; }
    if (step.next === 'loadSample' && !state.intake) { navigate('/intake?sample=1'); return; }
    if (step.next === 'submit' && !state.submission) { navigate('/intake/submit?go=1'); return; }
    goTo(guide.step + 1);
  };

  if (min) {
    return (
      <Button
        variant="contained"
        startIcon={<PlayCircleOutline />}
        onClick={() => setMin(false)}
        sx={{position: 'fixed', right: 16, bottom: 56, zIndex: (t) => t.zIndex.speedDial}}
      >
        Guided demo {guide.step + 1}/{GUIDE_STEPS.length}
      </Button>
    );
  }

  return (
    <Paper
      role="region"
      aria-label="Guided demo"
      elevation={0}
      sx={{
        position: 'fixed', zIndex: (t) => t.zIndex.speedDial, bottom: {xs: 8, md: 56}, right: {xs: 8, md: 16}, left: {xs: 8, sm: 'auto'},
        width: {sm: 360}, p: 2, borderColor: 'primary.main', borderWidth: 1, boxShadow: (t) => t.shadows[8],
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
        <Typography variant="overline" color="primary" sx={{flex: 1}}>
          Guided demo · Step {guide.step + 1} of {GUIDE_STEPS.length}
        </Typography>
        <Tooltip title="Minimise"><IconButton size="small" aria-label="Minimise guide" onClick={() => setMin(true)}><Remove fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Exit guided demo"><IconButton size="small" aria-label="Exit guided demo" onClick={() => setGuide({active: false})}><Close fontSize="small" /></IconButton></Tooltip>
      </Box>
      <LinearProgress variant="determinate" value={((guide.step + 1) / GUIDE_STEPS.length) * 100} aria-hidden sx={{mb: 1.5, height: 4, borderRadius: 2}} />
      <Typography variant="h3" sx={{mb: 0.5}}>{step.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}} aria-live="polite">{step.body}</Typography>
      <Box sx={{display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
        <Button disabled={guide.step === 0} onClick={() => goTo(guide.step - 1)}>Back</Button>
        <Button variant="contained" onClick={next} autoFocus={false}>{last ? 'Finish' : 'Next'}</Button>
      </Box>
    </Paper>
  );
}
