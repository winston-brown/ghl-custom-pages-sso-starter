import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SSOPage from './pages/SSOPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SSOPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/location/:locationId" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
