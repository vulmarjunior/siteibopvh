import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import PascoaPage from './pages/pascoa-page/PascoaPage';
import RelogioPage from './pages/relogio/RelogioPage';
import AdminPage from './pages/relogio/AdminPage';
import { ParousiaPage } from './pages/parousia/ParousiaPage';
import MoldaNosPage from './pages/moldanos/MoldaNosPage';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pascoa" element={<PascoaPage />} />
      <Route path="/relogio" element={<RelogioPage />} />
      <Route path="/relogio/admin" element={<AdminPage />} />
      <Route path="/da-ascensao-a-parousia" element={<ParousiaPage />} />
      <Route path="/moldanos" element={<MoldaNosPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
