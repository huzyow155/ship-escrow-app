import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { BountyBoardPage } from './pages/BountyBoardPage';
import { CreateBountyPage } from './pages/CreateBountyPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { ReputationPage } from './pages/ReputationPage';
import { EvidencePage } from './pages/EvidencePage';
import { LimitsPage } from './pages/LimitsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<BountyBoardPage />} />
            <Route path="/app/create" element={<CreateBountyPage />} />
            <Route path="/app/bounty/:id" element={<BountyDetailPage />} />
            <Route path="/app/reputation" element={<ReputationPage />} />
            <Route path="/app/evidence" element={<EvidencePage />} />
            <Route path="/app/limits" element={<LimitsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer
          style={{
            borderTop: '1px solid var(--border)',
            padding: '20px 0',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            background: 'var(--bg-card)',
          }}
        >
          <div className="container font-mono">
            Ship Escrow Manifest • GenLayer Studionet Preview (Chain ID 61999) • MIT License
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
