import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider, NotificationProvider } from './context/SocketContext.jsx';
import { MainLayout, AuthLayout, ProtectedRoute, PageSpinner } from './components/layout/Layout.jsx';
import ApplicationDetailPage from './pages/recruiter/ApplicationDetailPage.jsx';
import { useAuth } from './context/AuthContext.jsx';


// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import {
  ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage,
  CheckEmailPage, OnboardingPage, OAuthCallbackPage,
} from './pages/auth/AuthPages.jsx';
import JobsPage from './pages/jobs/JobsPage.jsx';
import DiscoverPage from './pages/startups/DiscoverPage.jsx';
import CandidateDashboard from './pages/candidate/CandidateDashboard.jsx';
import ProfileBuilderPage from './pages/candidate/ProfileBuilderPage.jsx';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard.jsx';
import PostJobPage from './pages/recruiter/PostJobPage.jsx';
import MessagesPage from './pages/messages/MessagesPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CompanyProfilePage from './pages/startups/CompanyProfilePage.jsx';
import CompanySetupPage from './pages/recruiter/CompanySetupPage.jsx';
import SalariesPage from './pages/SalariesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ApplicationsPage from './pages/candidate/ApplicationsPage.jsx';
import PublicProfilePage from './pages/candidate/PublicProfilePage.jsx';
import FindCandidatesPage from './pages/recruiter/FindCandidatesPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <div className="text-5xl mb-4">🚫</div>
      <h1 className="font-display font-black text-2xl mb-2">Access Denied</h1>
      <p className="text-muted mb-6">You don't have permission to view this page.</p>
      <a href="/" className="btn-primary px-6 py-2.5 text-sm inline-block">Go Home</a>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="font-display font-black text-2xl mb-2">Page Not Found</h1>
      <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary px-6 py-2.5 text-sm inline-block">Go Home</a>
    </div>
  </div>
);

// Sends recruiter to company setup, candidate to profile builder
const ProfileRouteHandler = () => {
  const { user } = useAuth();
  if (user?.role === 'recruiter') {
    return <Navigate to="/recruiter/company" replace />;
  }
  return <ProfileBuilderPage />;
};

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: { background: '#18191D', color: '#F0EEE9', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' },
                    success: { iconTheme: { primary: '#00E5A0', secondary: '#08090A' } },
                    error: { iconTheme: { primary: '#EF4444', secondary: '#08090A' } },
                  }}
                />
                <Routes>
                  {/* ── Public routes with Navbar ── */}
                  <Route element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/startups" element={<DiscoverPage />} />
                    <Route path="/startups/:slug" element={<CompanyProfilePage />} />
                    <Route path="/salaries" element={<SalariesPage />} />
                    <Route path="/candidates/:userId" element={<PublicProfilePage />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* ── Auth routes (centered, no navbar) ── */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/check-email" element={<CheckEmailPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
                  </Route>

                  {/* ── Candidate protected routes ── */}
                  <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                      <Route path="/candidate/applications" element={<ApplicationsPage />} />
                      <Route path="/profile" element={<ProfileBuilderPage />} />
                    </Route>
                  </Route>

                  {/* ── Recruiter protected routes ── */}
                  <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                      <Route path="/recruiter/post-job" element={<PostJobPage />} />
                      <Route path="/recruiter/company" element={<CompanySetupPage />} />
                      <Route path="/recruiter/candidates" element={<FindCandidatesPage />} />
                      <Route path="/recruiter/jobs/:jobId/applicants" element={<RecruiterDashboard />} />
                      <Route path="/recruiter/applications/:id" element={<ApplicationDetailPage />} />
                    </Route>
                  </Route>

                  {/* ── Shared protected (all roles) ── */}
                  <Route element={<ProtectedRoute allowedRoles={['candidate', 'recruiter', 'admin']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/messages/:userId" element={<MessagesPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/profile" element={<ProfileRouteHandler />} />
                    </Route>
                  </Route>

                  {/* ── Admin routes ── */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route element={<MainLayout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
