import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ProgressPage from './pages/ProgressPage';
import ResultPage from './pages/ResultPage';
// Build: 2026-05-13-23:11

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#2B2B2B',
            color: '#E8E3DC',
            border: '1px solid #8B7D6F',
          },
          success: {
            iconTheme: {
              primary: '#B5A79A',
              secondary: '#E8E3DC',
            },
          },
          error: {
            duration: 8000,
            iconTheme: {
              primary: '#D32F2F',
              secondary: '#E8E3DC',
            },
          },
        }}
      />
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
// Force rebuild Wed May 13 11:11:54 PM CST 2026
