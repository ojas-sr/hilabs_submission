import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Paper, Step, StepButton, Stepper} from '@mui/material';
import {useDemo} from '../../shared/hooks/useDemoStore';

const STEPS = [
  ['Drop file', '/intake'], ['Schema mapping', '/intake/mapping'], ['Exceptions', '/intake/exceptions'], ['Submit & route', '/intake/submit'],
];

export default function IntakeStepper({active}) {
  const navigate = useNavigate();
  const {state} = useDemo();
  const reachable = (i) => i === 0 || Boolean(state.intake);
  return (
    <Paper sx={{px: 2, py: 1.25, mb: 2, overflowX: 'auto'}}>
      <Stepper nonLinear activeStep={active} aria-label="Roster intake steps" sx={{minWidth: 520}}>
        {STEPS.map(([label, to], i) => (
          <Step key={label} completed={i < active || (i === 3 && Boolean(state.submission))} disabled={!reachable(i)}>
            <StepButton onClick={() => navigate(to)}>{label}</StepButton>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
}
