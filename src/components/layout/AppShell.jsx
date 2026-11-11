import React, {Suspense, useState} from 'react';
import {NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {
  AppBar, Box, Button, Divider, Drawer, IconButton, LinearProgress, List, ListItemButton, ListItemIcon,
  ListItemText, ListSubheader, MenuItem, TextField, Toolbar, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import RuleOutlined from '@mui/icons-material/RuleOutlined';
import AltRouteOutlined from '@mui/icons-material/AltRouteOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutlined';
import RestartAlt from '@mui/icons-material/RestartAlt';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import {useDemo} from '../../shared/hooks/useDemoStore';
import {PERSONAS} from '../../shared/constants';
import AboutDialog from './AboutDialog';
import Footer from './Footer';

const DRAWER_WIDTH = 236;
const ic = (I) => <I fontSize="small" />;

const NAV = {
  groupAdmin: [
    {section: 'Workspace', items: [{to: '/', label: 'Overview', icon: ic(DashboardOutlined)}]},
    {section: 'Roster intake', items: [
      {to: '/intake', label: '1. Zero-Template Drop', icon: ic(CloudUploadOutlined)},
      {to: '/intake/mapping', label: '2. Schema mapping', icon: ic(AccountTreeOutlined)},
      {to: '/intake/exceptions', label: '3. Exceptions', icon: ic(RuleOutlined)},
      {to: '/intake/submit', label: '4. Submit & routing', icon: ic(AltRouteOutlined)},
    ]},
    {section: 'Track', items: [
      {to: '/tracker', label: 'Claims-Ready tracker', icon: ic(LocalShippingOutlined)},
      {to: '/audit', label: 'Audit trail', icon: ic(HistoryOutlined)},
    ]},
  ],
  practice: [
    {section: 'Workspace', items: [{to: '/', label: 'Overview', icon: ic(DashboardOutlined)}]},
    {section: 'Keep data current', items: [
      {to: '/attestation', label: '90-day attestation', icon: ic(MarkEmailReadOutlined)},
      {to: '/intake', label: 'Drop a roster file', icon: ic(CloudUploadOutlined)},
      {to: '/intake/exceptions', label: 'Exceptions', icon: ic(RuleOutlined)},
      {to: '/tracker', label: 'Claims-Ready tracker', icon: ic(LocalShippingOutlined)},
    ]},
    {section: 'Compliance', items: [{to: '/audit', label: 'Audit trail', icon: ic(HistoryOutlined)}]},
  ],
  payerOps: [
    {section: 'Northwind Health Plan', items: [
      {to: '/payer-ops', label: 'Exception queue', icon: ic(SupportAgentOutlined)},
      {to: '/audit', label: 'Audit trail', icon: ic(HistoryOutlined)},
    ]},
  ],
};

export default function AppShell() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const {state, persona, setPersona, setGuide, reset, notify} = useDemo();
  const navigate = useNavigate();
  const location = useLocation();

  const changePersona = (id) => {
    setPersona(id);
    if (id === 'payerOps') navigate('/payer-ops');
    else if (location.pathname === '/payer-ops') navigate('/');
  };

  const startDemo = () => {
    reset(true);
    setGuide({active: true, step: 0});
    navigate('/');
  };

  const drawer = (
    <Box component="nav" aria-label="Main navigation" sx={{p: 1}}>
      {NAV[state.persona].map((g) => (
        <List key={g.section} dense subheader={<ListSubheader disableSticky sx={{lineHeight: '32px', bgcolor: 'transparent'}}>{g.section}</ListSubheader>}>
          {g.items.map((n) => (
            <ListItemButton
              key={n.to}
              component={NavLink}
              to={n.to}
              end
              onClick={() => setMobileOpen(false)}
              sx={{borderRadius: 1, minHeight: 36, '&.active': {bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600}}}
            >
              <ListItemIcon sx={{minWidth: 32, color: 'inherit'}}>{n.icon}</ListItemIcon>
              <ListItemText primary={n.label} />
            </ListItemButton>
          ))}
        </List>
      ))}
      <Divider sx={{my: 1}} />
      <Box sx={{px: 1.5, py: 1}}>
        <Typography variant="overline" color="text.secondary" component="div">Signed in as (demo)</Typography>
        <Typography variant="body2" sx={{fontWeight: 500}}>{persona.user}</Typography>
        <Typography variant="body2" color="text.secondary">{persona.org}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{display: 'flex', minHeight: '100vh'}}>
      <a href="#main" className="skip-link">Skip to content</a>
      <AppBar position="fixed" sx={{zIndex: (t) => t.zIndex.drawer + 1}}>
        <Toolbar variant="dense" sx={{gap: 1, minHeight: 56}}>
          {!desktop && (
            <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
          )}
          <Box sx={{display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0, mr: 'auto'}}>
            <Typography variant="h3" color="primary" noWrap>MedCare</Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{display: {xs: 'none', sm: 'block'}}}>Roster Co-Pilot</Typography>
          </Box>
          <TextField
            select
            label="Persona"
            value={state.persona}
            onChange={(e) => changePersona(e.target.value)}
            sx={{minWidth: {xs: 140, sm: 250}}}
          >
            {Object.values(PERSONAS).map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.label}{desktop ? ` · ${p.org}` : ''}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<PlayCircleOutline />} onClick={startDemo} sx={{display: {xs: 'none', sm: 'inline-flex'}, minHeight: 32}}>
            Start demo
          </Button>
          <Tooltip title="Reset demo data">
            <IconButton aria-label="Reset demo" onClick={() => { reset(); navigate(state.persona === 'payerOps' ? '/payer-ops' : '/'); notify('Demo reset to initial synthetic data', 'info'); }}>
              <RestartAlt fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="About this prototype">
            <IconButton aria-label="About this prototype" onClick={() => setAbout(true)}><InfoOutlined fontSize="small" /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{keepMounted: true}}
        sx={{width: desktop ? DRAWER_WIDTH : 0, flexShrink: 0, '& .MuiDrawer-paper': {width: DRAWER_WIDTH, boxSizing: 'border-box'}}}
      >
        <Toolbar variant="dense" sx={{minHeight: 56}} />
        {drawer}
      </Drawer>
      <Box sx={{flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        <Toolbar variant="dense" sx={{minHeight: 56}} />
        <Box component="main" id="main" tabIndex={-1} sx={{flexGrow: 1, p: {xs: 2, md: 3}, pb: {xs: 22, md: 3}, maxWidth: 1400, width: '100%', mx: 'auto', outline: 'none'}}>
          <Suspense fallback={<LinearProgress aria-label="Loading page" />}>
            <Outlet />
          </Suspense>
        </Box>
        <Footer onAbout={() => setAbout(true)} />
      </Box>
      <AboutDialog open={about} onClose={() => setAbout(false)} onStart={() => { setAbout(false); startDemo(); }} />
    </Box>
  );
}
