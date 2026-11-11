import React, {lazy, Suspense} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {LinearProgress} from '@mui/material';
import AppShell from './components/layout/AppShell';
import DemoGuide from './components/layout/DemoGuide';

// Route-level code splitting keeps the main chunk small.
const HomePage = lazy(() => import('./pages/home'));
const DropPage = lazy(() => import('./pages/intake/DropPage'));
const MappingPage = lazy(() => import('./pages/intake/MappingPage'));
const ExceptionsPage = lazy(() => import('./pages/intake/ExceptionsPage'));
const SubmitPage = lazy(() => import('./pages/intake/SubmitPage'));
const TrackerPage = lazy(() => import('./pages/tracker'));
const AttestationPage = lazy(() => import('./pages/attestation'));
const MagicLinkPage = lazy(() => import('./pages/attestation/MagicLinkPage'));
const AuditPage = lazy(() => import('./pages/audit'));
const PayerOpsPage = lazy(() => import('./pages/payer-ops'));

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/intake" element={<DropPage />} />
          <Route path="/intake/mapping" element={<MappingPage />} />
          <Route path="/intake/exceptions" element={<ExceptionsPage />} />
          <Route path="/intake/submit" element={<SubmitPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/attestation" element={<AttestationPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/payer-ops" element={<PayerOpsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        {/* Magic link: deliberately outside the app shell, no login. */}
        <Route path="/attest/:token" element={<Suspense fallback={<LinearProgress />}><MagicLinkPage /></Suspense>} />
      </Routes>
      <DemoGuide />
    </>
  );
}
