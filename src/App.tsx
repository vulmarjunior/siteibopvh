import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import PascoaPage from './pages/pascoa-page/PascoaPage';
import RelogioPage from './pages/relogio/RelogioPage';
import AdminPage from './pages/relogio/AdminPage';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pascoa" element={<PascoaPage />} />
      <Route path="/relogio" element={<RelogioPage />} />
      <Route path="/relogio/admin" element={<AdminPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
