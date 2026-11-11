import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress,
  Paper, Popper, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Close from '@mui/icons-material/Close';
import Remove from '@mui/icons-material/Remove';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {GUIDE_STEPS} from '../../shared/constants/guide';

const SEEN_KEY = 'mc_tour_seen_v1';
const PAD = 6;
const matches = (route, path) => (route.startsWith('/attest/') ? path.startsWith('/attest/') : route === path);

const readSeen = () => { try { return window.localStorage.getItem(SEEN_KEY) === '1'; } catch { return true; } };
const writeSeen = () => { try { window.localStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked */ } };

/** Finds the step's [data-tour] element (pages are lazy, so it polls briefly) and tracks its rect. */
function useTarget(target, enabled, key) {
  const [el, setEl] = useState(null);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    setEl(null); setRect(null);
    if (!enabled || !target) return undefined;
    let tries = 0;
    const id = window.setInterval(() => {
      const found = document.querySelector(`[data-tour="${target}"]`);
      if (found || ++tries > 40) {
        window.clearInterval(id);
        if (found) {
          found.scrollIntoView({block: 'center', behavior: 'smooth'});
          setEl(found);
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [target, enabled, key]);

  useLayoutEffect(() => {
    if (!el) return undefined;
    const update = () => { if (el.isConnected) setRect(el.getBoundingClientRect()); else setEl(null); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [el]);

  return [el, rect];
}

function Spotlight({rect}) {
  if (!rect) return null;
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed', pointerEvents: 'none', zIndex: (t) => t.zIndex.modal - 1,
        top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2,
        borderRadius: 1.5, outline: '2px solid', outlineColor: 'primary.main',
        boxShadow: '0 0 0 9999px rgba(23, 32, 42, 0.42)', transition: 'all 220ms ease',
      }}
    />
  );
}

function StepCard({step, index, onBack, onNext, onMin, onExit, last}) {
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
        <Typography variant="overline" color="primary" sx={{flex: 1}}>
          Guided journey · Step {index + 1} of {GUIDE_STEPS.length}
        </Typography>
        <Tooltip title="Minimise"><IconButton size="small" aria-label="Minimise guide" onClick={onMin}><Remove fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Exit tour"><IconButton size="small" aria-label="Exit tour" onClick={onExit}><Close fontSize="small" /></IconButton></Tooltip>
      </Box>
      <LinearProgress variant="determinate" value={((index + 1) / GUIDE_STEPS.length) * 100} aria-hidden sx={{mb: 1.5, height: 4, borderRadius: 2}} />
      <Typography variant="h3" sx={{mb: 0.5}}>{step.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}} aria-live="polite">{step.body}</Typography>
      {step.insight && (
        <Box sx={{bgcolor: 'primary.light', borderRadius: 1, p: 1.25, mb: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, color: 'primary.main'}}>
            <LightbulbOutlined sx={{fontSize: 16}} />
            <Typography variant="overline" sx={{lineHeight: 1.4}}>PM insight</Typography>
          </Box>
          <Typography variant="body2">{step.insight}</Typography>
        </Box>
      )}
      {step.metric && (
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.75, color: 'secondary.main', mb: 1.5}}>
          <InsightsOutlined sx={{fontSize: 16, mt: '2px'}} />
          <Typography variant="body2" sx={{fontWeight: 500}}>{step.metric}</Typography>
        </Box>
      )}
      <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
        <Button onClick={onExit} color="inherit" sx={{color: 'text.secondary', mr: 'auto'}}>Skip tour</Button>
        <Button disabled={index === 0} onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext}>{last ? 'Finish' : 'Next'}</Button>
      </Box>
    </>
  );
}

/** Journey tour: spotlights the relevant control on each page and explains it, with the PM reasoning behind it. */
export default function DemoGuide() {
  const {state, setGuide, setPersona, reset} = useDemo();
  const {guide} = state;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('sm'));
  const [min, setMin] = useState(false);
  const [arrowEl, setArrowEl] = useState(null);
  const [welcome, setWelcome] = useState(() => !readSeen() && !location.pathname.startsWith('/attest/'));

  const step = GUIDE_STEPS[guide.step];
  const [anchor, rect] = useTarget(step?.target, guide.active && !min, `${guide.step}:${location.pathname}`);

  // Keep the step in sync when the user navigates on their own.
  useEffect(() => {
    if (!guide.active) return;
    const i = GUIDE_STEPS.findIndex((s) => matches(s.route, location.pathname));
    if (i >= 0 && i !== guide.step) {
      setGuide({step: i});
      if (GUIDE_STEPS[i].persona !== state.persona) setPersona(GUIDE_STEPS[i].persona);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    writeSeen(); setWelcome(false); setMin(false);
    reset(true);
    setGuide({active: true, step: 0});
    setPersona(GUIDE_STEPS[0].persona);
    navigate('/');
  };
  const dismissWelcome = () => { writeSeen(); setWelcome(false); };

  const welcomeDialog = (
    <Dialog open={welcome} onClose={dismissWelcome} maxWidth="xs" fullWidth>
      <DialogTitle>New here? Take the 2-minute journey</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
          A guided walk through the Roster Co-Pilot: drop a messy roster, fix only the exceptions, route to 3 payers,
          track claims-readiness and audit every change.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Each stop explains the <b>PM insight</b> behind the screen and the metric it is designed to move.
          Synthetic data only.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={dismissWelcome}>Explore on my own</Button>
        <Button variant="contained" startIcon={<PlayCircleOutline />} onClick={start}>Start the journey</Button>
      </DialogActions>
    </Dialog>
  );

  if (!guide.active) return welcomeDialog;

  const last = guide.step === GUIDE_STEPS.length - 1;
  const exit = () => { writeSeen(); setGuide({active: false}); };
  const goTo = (i) => {
    const s = GUIDE_STEPS[i];
    setPersona(s.persona);
    setGuide({step: i});
    navigate(s.route);
  };
  const next = () => {
    if (last) { exit(); return; }
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
        Resume journey {guide.step + 1}/{GUIDE_STEPS.length}
      </Button>
    );
  }

  const card = (
    <StepCard step={step} index={guide.step} last={last} onBack={() => goTo(guide.step - 1)} onNext={next} onMin={() => setMin(true)} onExit={exit} />
  );
  const cardSx = {p: 2, borderColor: 'primary.main', borderWidth: 1, boxShadow: (t) => t.shadows[8]};

  // Anchored tooltip on wider screens when the target is on screen; otherwise a docked panel.
  // Big targets (tables, card grids) get the docked panel so the tooltip never lands off screen.
  const CARD_H = 380;
  const fitsAnchored = rect && rect.height < window.innerHeight * 0.4
    && Math.max(window.innerHeight - rect.bottom, rect.top - 56) > CARD_H;
  if (wide && anchor && fitsAnchored) {
    return (
      <>
        <Spotlight rect={rect} />
        <Popper
          open
          anchorEl={anchor}
          placement="bottom"
          sx={{zIndex: (t) => t.zIndex.modal, width: 380, maxWidth: 'calc(100vw - 32px)'}}
          modifiers={[
            {name: 'offset', options: {offset: [0, PAD + 10]}},
            {name: 'flip', options: {fallbackPlacements: ['top', 'left', 'right']}},
            {name: 'preventOverflow', options: {padding: 16}},
            {name: 'arrow', enabled: Boolean(arrowEl), options: {element: arrowEl}},
          ]}
        >
          {({placement}) => (
            <Paper role="dialog" aria-label="Guided journey" elevation={0} sx={{...cardSx, position: 'relative'}}>
              <Box
                ref={setArrowEl}
                className="tour-arrow"
                sx={{
                  position: 'absolute', width: 12, height: 12,
                  ...(placement.startsWith('bottom') && {top: -7}),
                  ...(placement.startsWith('top') && {bottom: -7}),
                  ...(placement.startsWith('left') && {right: -7}),
                  ...(placement.startsWith('right') && {left: -7}),
                  '&::before': {
                    content: '""', position: 'absolute', inset: 0, bgcolor: 'background.paper', transform: 'rotate(45deg)',
                    borderLeft: placement.startsWith('bottom') || placement.startsWith('right') ? '1px solid' : 0,
                    borderTop: placement.startsWith('bottom') || placement.startsWith('left') ? '1px solid' : 0,
                    borderRight: placement.startsWith('top') || placement.startsWith('left') ? '1px solid' : 0,
                    borderBottom: placement.startsWith('top') || placement.startsWith('right') ? '1px solid' : 0,
                    borderColor: 'primary.main',
                  },
                }}
              />
              {card}
            </Paper>
          )}
        </Popper>
      </>
    );
  }

  return (
    <>
      <Spotlight rect={rect} />
      <Paper
        role="dialog"
        aria-label="Guided journey"
        elevation={0}
        sx={{
          ...cardSx, position: 'fixed', zIndex: (t) => t.zIndex.modal, bottom: {xs: 8, md: 56}, right: {xs: 8, md: 16},
          left: {xs: 8, sm: 'auto'}, width: {sm: 380}, maxHeight: '60vh', overflowY: 'auto',
        }}
      >
        {card}
      </Paper>
    </>
  );
}
