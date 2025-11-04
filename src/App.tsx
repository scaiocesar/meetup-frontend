import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PublicEventsPage } from './pages/PublicEventsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MeetupDetailPage } from './pages/MeetupDetailPage';
import { CreateMeetupPage } from './pages/CreateMeetupPage';
import { EditMeetupPage } from './pages/EditMeetupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicEventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/meetups/:id" element={<MeetupDetailPage />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 lg:ml-60">
                    <Header />
                    <main className="pt-16 pb-6">
                      <DashboardPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetups/create"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 lg:ml-60">
                    <Header />
                    <main className="pt-16 pb-6">
                      <CreateMeetupPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetups/:id/edit"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 lg:ml-60">
                    <Header />
                    <main className="pt-16 pb-6">
                      <EditMeetupPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0077B6',
            color: '#fff',
            borderRadius: '0.75rem',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
