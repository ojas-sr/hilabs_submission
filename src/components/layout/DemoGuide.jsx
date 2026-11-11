import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
  Box, Button, Chip, IconButton, LinearProgress, Paper, Popper, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Close from '@mui/icons-material/Close';
import Remove from '@mui/icons-material/Remove';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {FLOWS, GUIDE_STEPS, INTRO, PERSONA_CARDS} from '../../shared/constants/guide';

const SEEN_KEY = 'mc_tour_seen_v2';
const PAD = 6;
const CARD_H = 400;
const STOPS = GUIDE_STEPS.length - 1; // intro is not a numbered stop

// One colour per persona so a reviewer can tell the three flows apart at a glance.
export const PERSONA_TONE = {
  groupAdmin: {fg: 'primary.main', bg: 'primary.light'},
  practice: {fg: 'secondary.main', bg: 'secondary.light'},
  payerOps: {fg: 'grey.800', bg: 'grey.100'},
};

const matches = (route, path) => (route.startsWith('/attest/') ? path.startsWith('/attest/') : route === path);
const readSeen = () => { try { return window.localStorage.getItem(SEEN_KEY) === '1'; } catch { return true; } };
const writeSeen = () => { try { window.localStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked */ } };
const cardFor = (personaId) => PERSONA_CARDS.find((p) => p.id === personaId);

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
        if (found) { found.scrollIntoView({block: 'center', behavior: 'smooth'}); setEl(found); }
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

/* ---------- Landing card: strategic positioning, 2x2, personas ---------- */

function PositioningMatrix() {
  const {matrix} = INTRO;
  const cell = (y, x) => {
    const items = matrix.cells[y][x];
    const us = items.some((i) => i.us);
    return (
      <Box
        key={`${y}-${x}`}
        sx={{
          p: 1, minHeight: 58, borderRadius: 1, display: 'flex', flexDirection: 'column', gap: 0.75, justifyContent: 'center',
          bgcolor: us ? 'secondary.light' : 'grey.50', border: '1px solid', borderColor: us ? 'secondary.main' : 'divider',
          borderWidth: us ? 2 : 1,
        }}
      >
        {items.map((i) => (
          <Box key={i.name}>
            <Typography variant="body2" sx={{fontWeight: 600, color: i.us ? 'secondary.main' : 'text.primary', lineHeight: 1.3}}>{i.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{lineHeight: 1.3, display: 'block'}}>{i.stance}</Typography>
          </Box>
        ))}
      </Box>
    );
  };
  return (
    <Box role="img" aria-label="Positioning 2x2: MedCare Roster Co-Pilot is the only player that is both payer-specific and AI-checked from native files">
      <Typography variant="overline" color="text.secondary" component="div" sx={{mb: 0.5}}>Where MedCare plays</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: '18px 1fr 1fr', gridTemplateRows: '1fr 1fr auto', gap: 0.75}}>
        <Box sx={{gridRow: '1 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Typography variant="caption" color="text.secondary" sx={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap'}}>
            {matrix.y[0]} → {matrix.y[1]}
          </Typography>
        </Box>
        {cell('ai', 'generic')}{cell('ai', 'payer')}
        {cell('forms', 'generic')}{cell('forms', 'payer')}
        <Box />
        <Typography variant="caption" color="text.secondary" sx={{gridColumn: '2 / 4', textAlign: 'center'}}>
          {matrix.x[0]} → {matrix.x[1]}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 0.5}}>{matrix.note}</Typography>
    </Box>
  );
}

function IntroCard({onStart, onExplore}) {
  return (
    <>
      <Box aria-hidden sx={{position: 'fixed', inset: 0, bgcolor: 'rgba(23, 32, 42, 0.55)', zIndex: (t) => t.zIndex.modal - 1}} onClick={onExplore} />
      <Paper
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-headline"
        elevation={0}
        sx={{
          position: 'fixed', zIndex: (t) => t.zIndex.modal, top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 'calc(100vw - 32px)', maxWidth: 1080, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
          p: {xs: 2, md: 2.5}, boxShadow: (t) => t.shadows[12],
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
          <Box sx={{flex: 1}}>
            <Typography variant="overline" color="primary" component="div">{INTRO.eyebrow}</Typography>
            <Typography id="intro-headline" variant="h1" sx={{mb: 0.75, fontSize: {xs: '1.25rem', md: '1.375rem'}}}>{INTRO.headline}</Typography>
          </Box>
          <Tooltip title="Close"><IconButton aria-label="Close" onClick={onExplore}><Close fontSize="small" /></IconButton></Tooltip>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{mb: 1.5, maxWidth: 900}}>{INTRO.problem}</Typography>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1.15fr 1fr'}, gap: 2.5, mb: 1.75}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <Typography variant="overline" color="text.secondary" component="div">Strategic positioning</Typography>
            {INTRO.pillars.map((p, i) => (
              <Box key={p.title} sx={{display: 'flex', gap: 1.25}}>
                <Box sx={{width: 24, height: 24, flexShrink: 0, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600}}>{i + 1}</Box>
                <Box>
                  <Typography variant="subtitle1" sx={{lineHeight: 1.3}}>{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.body}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <PositioningMatrix />
        </Box>

        <Typography variant="overline" color="text.secondary" component="div" sx={{mb: 1}}>Three personas, three flows (you will play each one)</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}, gap: 1.5, mb: 1.75}}>
          {PERSONA_CARDS.map((p) => {
            const tone = PERSONA_TONE[p.id];
            const flow = FLOWS[p.flow];
            return (
              <Box key={p.id} sx={{border: '1px solid', borderColor: 'divider', borderTop: '3px solid', borderTopColor: tone.fg, borderRadius: 1, p: 1.25}}>
                <Typography variant="caption" sx={{color: tone.fg, fontWeight: 600}}>FLOW {flow.n} · {flow.label}</Typography>
                <Typography variant="body2" sx={{mt: 0.25, mb: 0.75}}><b>{p.name}</b> <Box component="span" sx={{color: 'text.secondary'}}>· {p.role}</Box></Typography>
                <Typography variant="body2"><b>Pain:</b> {p.pain}</Typography>
                <Typography variant="body2" sx={{mt: 0.25}}><b>Win:</b> {p.win}</Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Typography variant="caption" color="text.secondary" sx={{mr: 'auto'}}>
            About 2 minutes · {STOPS} stops · Synthetic data only · AI behaviour simulated
          </Typography>
          <Button onClick={onExplore}>Explore on my own</Button>
          <Button variant="contained" size="medium" endIcon={<ArrowForward />} onClick={onStart}>Start the 2-minute tour</Button>
        </Box>
      </Paper>
    </>
  );
}

/* ---------- Tour stop tooltip ---------- */

function FlowPills({current}) {
  return (
    <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}} aria-label="Journey flows">
      {Object.entries(FLOWS).map(([key, f]) => {
        const tone = PERSONA_TONE[f.persona];
        const on = key === current;
        return (
          <Chip
            key={key}
            label={`${f.n} ${cardFor(f.persona).name}`}
            size="small"
            aria-current={on ? 'step' : undefined}
            sx={{height: 22, fontWeight: on ? 600 : 400, bgcolor: on ? tone.bg : 'transparent', color: on ? tone.fg : 'text.secondary', border: '1px solid', borderColor: on ? tone.fg : 'divider'}}
          />
        );
      })}
    </Box>
  );
}

function StepCard({step, index, onBack, onNext, onMin, onExit, last}) {
  const flow = FLOWS[step.flow];
  const persona = cardFor(step.persona);
  const tone = PERSONA_TONE[step.persona];
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
        <FlowPills current={step.flow} />
        <Box sx={{flex: 1}} />
        <Tooltip title="Minimise"><IconButton size="small" aria-label="Minimise tour" onClick={onMin}><Remove fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Exit tour"><IconButton size="small" aria-label="Exit tour" onClick={onExit}><Close fontSize="small" /></IconButton></Tooltip>
      </Box>
      <LinearProgress variant="determinate" value={(index / STOPS) * 100} aria-hidden sx={{mb: 1.25, height: 3, borderRadius: 2}} />

      <Typography variant="caption" sx={{color: tone.fg, fontWeight: 600, display: 'block'}}>
        FLOW {flow.n} · {flow.label.toUpperCase()}
      </Typography>

      {step.meet ? (
        <Box sx={{bgcolor: tone.bg, borderRadius: 1, p: 1.25, my: 1}}>
          <Typography variant="body2" sx={{fontWeight: 600, color: tone.fg}}>You are now {persona.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.5}}>{persona.role}</Typography>
          <Typography variant="body2"><b>Pain:</b> {persona.pain}</Typography>
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.5}}>As {persona.name}, {persona.role.split(',')[0]}</Typography>
      )}

      <Typography variant="h3" sx={{mb: 0.5}}>{step.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 1}} aria-live="polite">{step.what}</Typography>
      <Box sx={{display: 'flex', gap: 0.75, mb: 0.75}}>
        <LightbulbOutlined sx={{fontSize: 16, mt: '2px', color: 'primary.main'}} />
        <Typography variant="body2"><b>Why:</b> {step.why}</Typography>
      </Box>
      <Box sx={{display: 'flex', gap: 0.75, color: 'secondary.main', mb: 1.5}}>
        <InsightsOutlined sx={{fontSize: 16, mt: '2px'}} />
        <Typography variant="body2" sx={{fontWeight: 500}}>Success metric: {step.metric}</Typography>
      </Box>

      <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
        <Typography variant="caption" color="text.secondary" sx={{mr: 'auto'}}>Stop {index} of {STOPS}</Typography>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext}>{last ? 'Finish' : 'Next'}</Button>
      </Box>
    </>
  );
}

/** Reviewer journey: positioning intro on landing, then spotlighted tooltips through three persona flows. */
export default function DemoGuide() {
  const {state, setGuide, setPersona, reset} = useDemo();
  const {guide} = state;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('sm'));
  const [min, setMin] = useState(false);
  const [arrowEl, setArrowEl] = useState(null);

  const stepIndex = Math.min(guide.step, GUIDE_STEPS.length - 1);
  const step = GUIDE_STEPS[stepIndex];
  const isIntro = step?.type === 'intro';
  const [anchor, rect] = useTarget(step?.target, guide.active && !min && !isIntro, `${stepIndex}:${location.pathname}`);

  // First visit to the landing page opens the positioning card.
  useEffect(() => {
    if (!readSeen() && location.pathname === '/' && !guide.active) setGuide({active: true, step: 0});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the step in sync when the user navigates on their own.
  useEffect(() => {
    if (!guide.active || isIntro) return;
    const i = GUIDE_STEPS.findIndex((s) => s.type !== 'intro' && matches(s.route, location.pathname));
    if (i >= 0 && i !== stepIndex) {
      setGuide({step: i});
      if (GUIDE_STEPS[i].persona !== state.persona) setPersona(GUIDE_STEPS[i].persona);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!guide.active || !step) return null;

  const last = stepIndex === GUIDE_STEPS.length - 1;
  const exit = () => { writeSeen(); setMin(false); setGuide({active: false}); };
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
    goTo(stepIndex + 1);
  };

  if (isIntro) {
    return (
      <IntroCard
        onExplore={exit}
        onStart={() => { writeSeen(); reset(true); setGuide({active: true, step: 0}); goTo(1); }}
      />
    );
  }

  if (min) {
    return (
      <Button
        variant="contained"
        startIcon={<PlayCircleOutline />}
        onClick={() => setMin(false)}
        sx={{position: 'fixed', right: 16, bottom: 56, zIndex: (t) => t.zIndex.speedDial}}
      >
        Resume tour {stepIndex}/{STOPS}
      </Button>
    );
  }

  const card = (
    <StepCard step={step} index={stepIndex} last={last} onBack={() => goTo(stepIndex - 1)} onNext={next} onMin={() => setMin(true)} onExit={exit} />
  );
  const cardSx = {p: 2, borderColor: 'primary.main', borderWidth: 1, boxShadow: (t) => t.shadows[8]};

  // Anchor to the control when there is room; big targets and phones get a docked panel instead.
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
          sx={{zIndex: (t) => t.zIndex.modal, width: 400, maxWidth: 'calc(100vw - 32px)'}}
          modifiers={[
            {name: 'offset', options: {offset: [0, PAD + 10]}},
            {name: 'flip', options: {fallbackPlacements: ['top', 'left', 'right']}},
            {name: 'preventOverflow', options: {padding: 16}},
            {name: 'arrow', enabled: Boolean(arrowEl), options: {element: arrowEl}},
          ]}
        >
          {({placement}) => (
            <Paper role="dialog" aria-label="Guided tour" elevation={0} sx={{...cardSx, position: 'relative'}}>
              <Box
                ref={setArrowEl}
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
        aria-label="Guided tour"
        elevation={0}
        sx={{
          ...cardSx, position: 'fixed', zIndex: (t) => t.zIndex.modal, bottom: {xs: 8, md: 56}, right: {xs: 8, md: 16},
          left: {xs: 8, sm: 'auto'}, width: {sm: 400}, maxHeight: '62vh', overflowY: 'auto',
        }}
      >
        {card}
      </Paper>
    </>
  );
}
