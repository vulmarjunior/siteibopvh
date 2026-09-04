import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

const HomePage = lazy(() => import('./pages/home/HomePage'));
const ModuleClosingPage = lazy(() => import('./components/modules/ModuleClosingPage'));
const ModuleRoute = lazy(() => import('./components/modules/ModuleRoute'));
const RelogioPage = lazy(() => import('./pages/relogio/RelogioPage'));
const AdminPrayerPage = lazy(() => import('./pages/admin/AdminPrayerPage'));
const ParousiaPage = lazy(() => import('./pages/parousia/ParousiaPage').then(module => ({ default: module.ParousiaPage })));
const EbfPage = lazy(() => import('./pages/ebf/EbfPage'));
const AdminEbfPage = lazy(() => import('./pages/admin/AdminEbfPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminSetPasswordPage = lazy(() => import('./pages/admin/AdminSetPasswordPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminModulesPage = lazy(() => import('./pages/admin/AdminModulesPage'));
const AdminSeriesPage = lazy(() => import('./pages/admin/AdminSeriesManagementPage'));
const AdminSeriesEditorPage = lazy(() => import('./pages/admin/AdminSeriesEditorModalPage'));
const AdminSeriesPreviewPage = lazy(() => import('./pages/admin/AdminSeriesPreviewPage'));
const AdminSeriesEmailPage = lazy(() => import('./pages/admin/AdminSeriesEmailPage'));
const AdminProtectedRoute = lazy(() => import('./components/admin/AdminProtectedRoute'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminHomeBannersPage = lazy(() => import('./pages/admin/AdminHomeBannersPage'));
const AdminHistoryPage = lazy(() => import('./pages/admin/AdminHistoryPage'));
const HistoryPage = lazy(() => import('./pages/history/HistoryPage'));

// Veredas IBO (Curadoria) Lazy Components
const VeredasHomePage = lazy(() => import('./pages/veredas/VeredasHomePage').then(m => ({ default: m.VeredasHomePage })));
const VeredasCatalogPage = lazy(() => import('./pages/veredas/VeredasCatalogPage').then(m => ({ default: m.VeredasCatalogPage })));
const VeredasBookDetailPage = lazy(() => import('./pages/veredas/VeredasBookDetailPage').then(m => ({ default: m.VeredasBookDetailPage })));
const VeredasVideoDetailPage = lazy(() => import('./pages/veredas/VeredasVideoDetailPage').then(m => ({ default: m.VeredasVideoDetailPage })));
const VeredasCourseDetailPage = lazy(() => import('./pages/veredas/VeredasCourseDetailPage').then(m => ({ default: m.VeredasCourseDetailPage })));
const VeredasConferenceDetailPage = lazy(() => import('./pages/veredas/VeredasConferenceDetailPage').then(m => ({ default: m.VeredasConferenceDetailPage })));
const VeredasFreeLibraryPage = lazy(() => import('./pages/veredas/VeredasFreeLibraryPage').then(m => ({ default: m.VeredasFreeLibraryPage })));
const VeredasAboutPage = lazy(() => import('./pages/veredas/VeredasAboutPage').then(m => ({ default: m.VeredasAboutPage })));

// Veredas IBO Admin Lazy Components
const VeredasDashboardPage = lazy(() => import('./pages/veredas/admin/VeredasDashboardPage').then(m => ({ default: m.VeredasDashboardPage })));
const VeredasItemFormPage = lazy(() => import('./pages/veredas/admin/VeredasItemFormPage').then(m => ({ default: m.VeredasItemFormPage })));
const VeredasReportsPage = lazy(() => import('./pages/veredas/admin/VeredasReportsPage').then(m => ({ default: m.VeredasReportsPage })));

import { ErrorBoundary } from './components/ui/ErrorBoundary';

const App: React.FC = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pascoa" element={<ModuleRoute moduleId="pascoa"><ModuleClosingPage moduleId="pascoa" /></ModuleRoute>} />
        <Route path="/relogio" element={<ModuleRoute moduleId="relogio"><RelogioPage /></ModuleRoute>} />
        <Route path="/relogio/admin" element={<Navigate to="/admin/relogio" replace />} />
        <Route path="/da-ascensao-a-parousia" element={<ModuleRoute moduleId="parousia"><ParousiaPage /></ModuleRoute>} />
        <Route path="/moldanos" element={<ModuleRoute moduleId="moldanos"><ModuleClosingPage moduleId="moldanos" /></ModuleRoute>} />
        <Route path="/ebf" element={<ModuleRoute moduleId="ebf"><EbfPage /></ModuleRoute>} />
        <Route path="/ebf/admin" element={<Navigate to="/admin/ebf" replace />} />
        <Route path="/historia" element={<HistoryPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/definir-senha" element={<AdminSetPasswordPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/modulos" element={<AdminModulesPage />} />
          <Route path="/admin/historia" element={<AdminHistoryPage />} />
          <Route path="/admin/series" element={<AdminSeriesPage />} />
          <Route path="/admin/series/:id" element={<AdminSeriesEditorPage />} />
          <Route path="/admin/series/:id/preview" element={<AdminSeriesPreviewPage />} />
          <Route path="/admin/emails" element={<AdminSeriesEmailPage />} />
          <Route path="/admin/relogio" element={<AdminPrayerPage />} />
          <Route path="/admin/ebf" element={<AdminEbfPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/banners" element={<AdminHomeBannersPage />} />
          <Route path="/admin/veredas" element={<VeredasDashboardPage />} />
          <Route path="/admin/veredas/conteudos/novo" element={<VeredasItemFormPage />} />
          <Route path="/admin/veredas/conteudos/:id" element={<VeredasItemFormPage />} />
          <Route path="/admin/veredas/relatos" element={<VeredasReportsPage />} />
        </Route>

        {/* Veredas IBO Rotas Públicas (/veredas/*) */}
        <Route path="/veredas" element={<ModuleRoute moduleId="veredas"><VeredasHomePage /></ModuleRoute>} />
        <Route path="/veredas/livros" element={<ModuleRoute moduleId="veredas"><VeredasCatalogPage /></ModuleRoute>} />
        <Route path="/veredas/videos" element={<ModuleRoute moduleId="veredas"><VeredasCatalogPage /></ModuleRoute>} />
        <Route path="/veredas/cursos" element={<ModuleRoute moduleId="veredas"><VeredasCatalogPage /></ModuleRoute>} />
        <Route path="/veredas/conferencias" element={<ModuleRoute moduleId="veredas"><VeredasCatalogPage /></ModuleRoute>} />
        <Route path="/veredas/livro/:slug" element={<ModuleRoute moduleId="veredas"><VeredasBookDetailPage /></ModuleRoute>} />
        <Route path="/veredas/livros/:slug" element={<ModuleRoute moduleId="veredas"><VeredasBookDetailPage /></ModuleRoute>} />
        <Route path="/veredas/video/:slug" element={<ModuleRoute moduleId="veredas"><VeredasVideoDetailPage /></ModuleRoute>} />
        <Route path="/veredas/videos/:slug" element={<ModuleRoute moduleId="veredas"><VeredasVideoDetailPage /></ModuleRoute>} />
        <Route path="/veredas/curso/:slug" element={<ModuleRoute moduleId="veredas"><VeredasCourseDetailPage /></ModuleRoute>} />
        <Route path="/veredas/cursos/:slug" element={<ModuleRoute moduleId="veredas"><VeredasCourseDetailPage /></ModuleRoute>} />
        <Route path="/veredas/conferencia/:slug" element={<ModuleRoute moduleId="veredas"><VeredasConferenceDetailPage /></ModuleRoute>} />
        <Route path="/veredas/conferencias/:slug" element={<ModuleRoute moduleId="veredas"><VeredasConferenceDetailPage /></ModuleRoute>} />
        <Route path="/veredas/biblioteca-gratuita" element={<ModuleRoute moduleId="veredas"><VeredasFreeLibraryPage /></ModuleRoute>} />
        <Route path="/veredas/sobre" element={<ModuleRoute moduleId="veredas"><VeredasAboutPage /></ModuleRoute>} />

        {/* Veredas IBO Rotas Administrativas (/admin/veredas/*) */}
        <Route path="/admin/veredas/login" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
</ErrorBoundary>
);

export default App;
