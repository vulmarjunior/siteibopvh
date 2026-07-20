import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

const HomePage = lazy(() => import('./pages/home/HomePage'));
const PascoaPage = lazy(() => import('./pages/pascoa-page/PascoaPage'));
const RelogioPage = lazy(() => import('./pages/relogio/RelogioPage'));
const AdminPage = lazy(() => import('./pages/relogio/AdminPage'));
const ParousiaPage = lazy(() => import('./pages/parousia/ParousiaPage').then(module => ({ default: module.ParousiaPage })));
const MoldaNosPage = lazy(() => import('./pages/moldanos/MoldaNosPage'));
const EbfPage = lazy(() => import('./pages/ebf/EbfPage'));
const EbfAdminPage = lazy(() => import('./pages/ebf/EbfAdminPage'));

const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pascoa" element={<PascoaPage />} />
        <Route path="/relogio" element={<RelogioPage />} />
        <Route path="/relogio/admin" element={<AdminPage />} />
        <Route path="/da-ascensao-a-parousia" element={<ParousiaPage />} />
        <Route path="/moldanos" element={<MoldaNosPage />} />
        <Route path="/ebf" element={<EbfPage />} />
        <Route path="/ebf/admin" element={<EbfAdminPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;

