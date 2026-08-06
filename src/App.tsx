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

// Veredas IBO (Curadoria) Lazy Components
const VeredasHomePage = lazy(() => import('./pages/veredas/VeredasHomePage').then(m => ({ default: m.VeredasHomePage })));
const VeredasCatalogPage = lazy(() => import('./pages/veredas/VeredasCatalogPage').then(m => ({ default: m.VeredasCatalogPage })));
const VeredasBookDetailPage = lazy(() => import('./pages/veredas/VeredasBookDetailPage').then(m => ({ default: m.VeredasBookDetailPage })));
const VeredasVideoDetailPage = lazy(() => import('./pages/veredas/VeredasVideoDetailPage').then(m => ({ default: m.VeredasVideoDetailPage })));
const VeredasFreeLibraryPage = lazy(() => import('./pages/veredas/VeredasFreeLibraryPage').then(m => ({ default: m.VeredasFreeLibraryPage })));
const VeredasAboutPage = lazy(() => import('./pages/veredas/VeredasAboutPage').then(m => ({ default: m.VeredasAboutPage })));

// Veredas IBO Admin Lazy Components
const VeredasLoginPage = lazy(() => import('./pages/veredas/admin/VeredasLoginPage').then(m => ({ default: m.VeredasLoginPage })));
const VeredasDashboardPage = lazy(() => import('./pages/veredas/admin/VeredasDashboardPage').then(m => ({ default: m.VeredasDashboardPage })));
const VeredasItemFormPage = lazy(() => import('./pages/veredas/admin/VeredasItemFormPage').then(m => ({ default: m.VeredasItemFormPage })));
const VeredasReportsPage = lazy(() => import('./pages/veredas/admin/VeredasReportsPage').then(m => ({ default: m.VeredasReportsPage })));

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

        {/* Veredas IBO Rotas Públicas (/veredas/*) */}
        <Route path="/veredas" element={<VeredasHomePage />} />
        <Route path="/veredas/livros" element={<VeredasCatalogPage />} />
        <Route path="/veredas/videos" element={<VeredasCatalogPage />} />
        <Route path="/veredas/livro/:slug" element={<VeredasBookDetailPage />} />
        <Route path="/veredas/video/:slug" element={<VeredasVideoDetailPage />} />
        <Route path="/veredas/biblioteca-gratuita" element={<VeredasFreeLibraryPage />} />
        <Route path="/veredas/sobre" element={<VeredasAboutPage />} />

        {/* Veredas IBO Rotas Administrativas (/admin/veredas/*) */}
        <Route path="/admin/veredas/login" element={<VeredasLoginPage />} />
        <Route path="/admin/veredas" element={<VeredasDashboardPage />} />
        <Route path="/admin/veredas/conteudos/novo" element={<VeredasItemFormPage />} />
        <Route path="/admin/veredas/conteudos/:id" element={<VeredasItemFormPage />} />
        <Route path="/admin/veredas/relatos" element={<VeredasReportsPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
