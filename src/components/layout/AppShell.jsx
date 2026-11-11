import React from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography,
} from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';

const DRAWER_WIDTH = 232;
const NAV = [
  {to: '/', label: 'Overview', icon: <DashboardOutlined fontSize="small" />},
  {to: '/roster', label: 'Roster', icon: <GroupsOutlined fontSize="small" />},
  {to: '/audit', label: 'Audit trail', icon: <HistoryOutlined fontSize="small" />},
];

export default function AppShell() {
  return (
    <Box sx={{display: 'flex', minHeight: '100vh'}}>
      <AppBar position="fixed" sx={{zIndex: (t) => t.zIndex.drawer + 1}}>
        <Toolbar variant="dense">
          <Typography variant="h3" color="primary">MedCare</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ml: 1.5}}>
            Provider Roster Portal
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{width: DRAWER_WIDTH, '& .MuiDrawer-paper': {width: DRAWER_WIDTH, boxSizing: 'border-box'}}}
      >
        <Toolbar variant="dense" />
        <List sx={{p: 1}}>
          {NAV.map((n) => (
            <ListItemButton
              key={n.to}
              component={NavLink}
              to={n.to}
              end={n.to === '/'}
              sx={{borderRadius: 1, '&.active': {bgcolor: 'primary.light', color: 'primary.main'}}}
            >
              <ListItemIcon sx={{minWidth: 32, color: 'inherit'}}>{n.icon}</ListItemIcon>
              <ListItemText primary={n.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{flexGrow: 1, p: 3}}>
        <Toolbar variant="dense" />
        <Outlet />
      </Box>
    </Box>
  );
}
