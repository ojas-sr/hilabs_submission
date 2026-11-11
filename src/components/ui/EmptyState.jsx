import React from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';

export default function EmptyState({title, body, actionLabel, to, onAction, icon}) {
  return (
    <Paper sx={{p: 4, textAlign: 'center'}}>
      {icon && <Box sx={{color: 'text.secondary', mb: 1}}>{icon}</Box>}
      <Typography variant="h3" gutterBottom>{title}</Typography>
      <Typography color="text.secondary" sx={{mb: 2, maxWidth: 520, mx: 'auto'}}>{body}</Typography>
      {actionLabel && (
        <Button variant="contained" {...(to ? {component: RouterLink, to} : {onClick: onAction})}>{actionLabel}</Button>
      )}
    </Paper>
  );
}
