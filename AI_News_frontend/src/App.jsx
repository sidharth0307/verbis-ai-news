import './theme/App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleDetail from './pages/ArticleDetail';
import LoginModal from './components/modals/LoginModal';
import Profile from './pages/Profile';

import AdminRoute from './utils/ProtectedRoute';

import Analytics from './pages/Analytics';
import { Toaster } from 'react-hot-toast';
import { BrandingProvider } from './context/BrandingContext';

function AppContent() {
  const location = useLocation();
  // Check if we are on the admin path
  const isAdminPage = location.pathname.startsWith("/analytics");

  return (
    <BrandingProvider>
      <div>
        <Toaster position="top-center" />
        <>
          {!isAdminPage && <Navbar />}

          <Routes>
            <Route
              path="/analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            {/* NEW NESTED SEO ROUTES 
              Matches: /ai-tech/slug-of-article
            */}
            <Route path="/:category/:slug" element={<ArticleDetail />} />

            {/* LEGACY/ID ROUTE 
              Kept for backwards compatibility or direct ID lookups
            */}
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>

          <LoginModal />
        </>
      </div>
    </BrandingProvider>
  );
}

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}