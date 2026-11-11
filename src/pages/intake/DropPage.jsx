import React, {useEffect, useRef, useState} from 'react';
import {Link as RouterLink, useSearchParams} from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Grid, Link, List, ListItem, ListItemIcon, ListItemText, Paper, Typography,
} from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import ArrowForward from '@mui/icons-material/ArrowForward';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import PageHeader from '../../components/ui/PageHeader';
import IntakeStepper from '../../components/ui/IntakeStepper';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {useSampleRoster} from '../../shared/hooks/useSampleRoster';
import {parseCsv} from '../../shared/utils/csv';
import {SAMPLE_FILES} from '../../shared/constants';
import {pct} from '../../shared/utils/format';

const STAGE_MS = 750;
const SOURCES = [['nppes', 'NPPES'], ['pecos', 'PECOS'], ['license', 'State licence'], ['dataspring', 'DataSpring']];

function stagesFor(intake) {
  const {headers, rows, mapping, result} = intake;
  const mapped = mapping.filter((m) => m.target);
  const avg = mapped.reduce((s, m) => s + m.confidence, 0) / Math.max(1, mapped.length);
  const dups = result.exceptions.filter((e) => e.type === 'duplicate').length;
  return [
    {label: 'Parsing', detail: `${rows.length} rows × ${headers.length} columns · ${result.stats.normalisations} values normalised (dates, phones, names, TINs)`},
    {label: 'Schema mapping', detail: `${mapped.length}/${headers.length} columns mapped to canonical schema · avg confidence ${Math.round(avg * 100)}%`},
    {label: 'Entity resolution', detail: `${rows.length} rows → ${rows.length - dups} unique providers · ${dups} duplicate${dups === 1 ? '' : 's'} with name variants`},
    {label: 'Pre-flight checks', detail: `${result.exceptions.length} exceptions across ${result.stats.exceptionRows} rows · ${pct(result.stats.touchlessRate)} touchless`, sources: true},
  ];
}

export default function DropPage() {
  const {state, loadFile, notify} = useDemo();
  const loadSample = useSampleRoster();
  const [params, setParams] = useSearchParams();
  const [phase, setPhase] = useState(state.intake ? 4 : -1); // -1 idle, 0..3 running, 4 done
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const autoRan = useRef(false);
  const sample = SAMPLE_FILES[state.persona === 'practice' ? 'practice' : 'groupAdmin'];

  const start = (name, headers, rows) => {
    if (headers.length < 2 || rows.length === 0) { setError('That file has no header row or no data rows. Try the sample roster.'); return; }
    setError(null);
    loadFile(name, headers, rows);
    setPhase(0);
  };

  useEffect(() => {
    if (phase < 0 || phase > 3) return undefined;
    const t = setTimeout(() => setPhase((p) => p + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 4 && state.intake) { const n = state.intake.result.exceptions.length; notify(`Pre-flight complete: ${n} exception${n === 1 ? ' needs' : 's need'} you`, 'info'); }
  }, [phase === 4]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSample = async () => {
    const s = await loadSample(state.persona);
    start(s.name, s.headers, s.rows);
  };

  // Guided demo deep link: /intake?sample=1
  useEffect(() => {
    if (params.get('sample') === '1' && !autoRan.current) {
      autoRan.current = true;
      setParams({}, {replace: true});
      runSample();
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    if (/\.(xlsx|xls)$/i.test(f.name)) {
      setError(`"${f.name}" accepted. In this prototype only CSV is parsed in the browser. Save the sheet as CSV, or use the sample roster.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { const {headers, rows} = parseCsv(String(reader.result)); start(f.name, headers, rows); };
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsText(f);
  };

  const stages = state.intake ? stagesFor(state.intake) : [];
  const running = phase >= 0 && phase < 4;

  return (
    <>
      <PageHeader
        eyebrow="Roster intake"
        title="Zero-Template Drop"
        subtitle="Drop the roster you already have, whether a symplr export, a Cactus extract or this month's spreadsheet. No payer template, no reformatting. The Co-Pilot maps, cleans and pre-flights it in seconds."
      />
      <IntakeStepper active={0} />
      <Grid container spacing={2}>
        <Grid size={{xs: 12, md: 6}}>
          <Paper
            role="button"
            tabIndex={0}
            aria-label="Drop a roster file here, or press Enter to browse"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            sx={{
              p: 4, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', borderWidth: 2,
              borderColor: dragOver ? 'primary.main' : 'grey.200', bgcolor: dragOver ? 'primary.light' : 'background.paper',
              transition: 'all .15s', '&:hover, &:focus-visible': {borderColor: 'primary.main'}, outline: 'none',
            }}
          >
            <CloudUploadOutlined sx={{fontSize: 44, color: 'primary.main'}} />
            <Typography variant="h3" sx={{mt: 1}}>Drag and drop any CSV or XLSX</Typography>
            <Typography color="text.secondary" sx={{mb: 2}}>Any columns, any order, any date format. Or click to browse.</Typography>
            <Box sx={{display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap'}}>
              {['.csv', '.xlsx', 'symplr export', 'Cactus extract', 'email attachment'].map((t) => <Chip key={t} label={t} variant="outlined" />)}
            </Box>
            <input ref={inputRef} type="file" accept=".csv,.txt,.xlsx,.xls" hidden aria-hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
          </Paper>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, flexWrap: 'wrap'}}>
            <Button data-tour="sample" variant="contained" startIcon={<AutoAwesomeOutlined />} onClick={runSample} disabled={running}>
              Use sample messy roster
            </Button>
            <Link href={`${import.meta.env.BASE_URL}${sample.path}`} download variant="body2">
              Download {sample.name}
            </Link>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
            The sample has non-standard headers ("Doc Name", "NPI #", "Prac Addr", "Eff Dt", "TaxID"), four date formats,
            missing suites, a duplicate provider and a transposed TIN. All of it is synthetic.
          </Typography>
          {error && <Alert severity="warning" sx={{mt: 2}} onClose={() => setError(null)}>{error}</Alert>}
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{p: 2, height: '100%'}} aria-live="polite">
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
              <DescriptionOutlined fontSize="small" color="action" />
              <Typography variant="h3" sx={{flex: 1, minWidth: 0}} noWrap>
                {state.intake ? state.intake.fileName : 'AI processing'}
              </Typography>
              {running && <Chip color="primary" label="Processing…" />}
              {phase === 4 && <Chip color="success" label="Done" />}
            </Box>
            {!state.intake && (
              <Typography color="text.secondary">
                Once you drop a file you will see four stages: Parsing, Schema mapping, Entity resolution and Pre-flight
                checks against NPPES, PECOS, state licence boards and DataSpring.
              </Typography>
            )}
            {state.intake && (
              <List dense disablePadding>
                {stages.map((s, i) => {
                  const done = phase > i;
                  const active = phase === i;
                  return (
                    <ListItem key={s.label} disableGutters alignItems="flex-start" sx={{opacity: done || active ? 1 : 0.45}}>
                      <ListItemIcon sx={{minWidth: 32, mt: 0.5}}>
                        {done ? <CheckCircle color="success" fontSize="small" /> : active ? <CircularProgress size={18} aria-label={`${s.label} in progress`} /> : <RadioButtonUnchecked fontSize="small" color="disabled" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography sx={{fontWeight: 600}}>{s.label}</Typography>}
                        secondary={(
                          <Box component="span" sx={{display: 'block'}}>
                            <Box component="span" sx={{display: 'block'}}>{done ? s.detail : active ? 'Working…' : 'Queued'}</Box>
                            {s.sources && (done || active) && (
                              <Box component="span" sx={{display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.75}}>
                                {SOURCES.map(([k, l], j) => (
                                  <Chip key={k} component="span" icon={done ? <CheckCircle sx={{fontSize: 14}} /> : undefined}
                                    label={`${l}${done ? ` · ${state.intake.result.checks[k]}` : ''}`}
                                    color={done ? 'secondary' : 'default'} variant={done ? 'filled' : 'outlined'}
                                    sx={{transitionDelay: `${j * 80}ms`}} />
                                ))}
                              </Box>
                            )}
                          </Box>
                        )}
                        slotProps={{secondary: {component: 'span'}}}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            {phase === 4 && state.intake && (
              <Box sx={{mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                <Box sx={{flex: 1, minWidth: 200}}>
                  <Typography sx={{fontWeight: 600}}>
                    {state.intake.result.stats.touchlessRows} of {state.intake.result.stats.totalRows} rows passed with no human touch
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detected group: {state.intake.result.groupName}. {state.intake.result.exceptions.length} exception(s) need review.
                  </Typography>
                </Box>
                <Button variant="contained" endIcon={<ArrowForward />} component={RouterLink} to="/intake/mapping">Review mapping</Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
