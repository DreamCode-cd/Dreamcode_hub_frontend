import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import Projects from './pages/Projects';
import Communications from './pages/Communications';
import HR from './pages/HR';
import Compliance from './pages/Compliance';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/meetings" element={
        <PrivateRoute>
          <Layout>
            <Meetings />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/projects" element={
        <PrivateRoute>
          <Layout>
            <Projects />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/communications" element={
        <PrivateRoute>
          <Layout>
            <Communications />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/hr" element={
        <PrivateRoute>
          <Layout>
            <HR />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/compliance" element={
        <PrivateRoute>
          <Layout>
            <Compliance />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;