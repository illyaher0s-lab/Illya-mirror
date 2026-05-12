import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ProgressPage from './pages/ProgressPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/progress/:id" element={<ProgressPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
