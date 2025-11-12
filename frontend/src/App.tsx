import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import EventCreatePage from './pages/EventCreatePage';
import EventDetailPageWrapper from './pages/EventDetailPageWrapper';
import EventCopyPage from './pages/EventCopyPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastContainer';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/create"
              element={
                <ProtectedRoute>
                  <EventCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId/copy"
              element={
                <ProtectedRoute>
                  <EventCopyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <ProtectedRoute>
                  <EventDetailPageWrapper />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
