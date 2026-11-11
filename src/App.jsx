import React from 'react';
import {Routes, Route} from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/home';
import RosterPage from './pages/roster';
import AuditPage from './pages/audit';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
    </Routes>
  );
}
