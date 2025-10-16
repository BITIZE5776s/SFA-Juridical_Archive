import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import DocumentEditor from "@/pages/document-editor";
import UserManagement from "@/pages/user-management";
import Users from "@/pages/users";
import Rapport from "@/pages/rapport";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Recommendations from "@/pages/recommendations";
import RecommendationDetailPage from "@/pages/recommendation-detail";
import Comments from "@/pages/comments";
import CommentDetailPage from "@/pages/comment-detail";
import Reports from "@/pages/reports";
import ReportDetailPage from "@/pages/report-detail";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { canManageUsers } = useAuth();

  if (!canManageUsers()) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Switch>
      {/* Default route - redirect based on auth status */}
      <Route path="/">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        ) : isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      {/* Public routes */}
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      <Route path="/documents">
        <ProtectedRoute>
          <ErrorBoundary>
            <Documents />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      <Route path="/documents/:id">
        {(params) => (
          <ProtectedRoute>
            <ErrorBoundary>
              <DocumentEditor documentId={params.id} />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/recent">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>

      <Route path="/favorites">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>

      <Route path="/pending">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>

      <Route path="/users">
        <ProtectedRoute>
          <AdminRoute>
            <ErrorBoundary>
              <Users />
            </ErrorBoundary>
          </AdminRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/rapport">
        <ProtectedRoute>
          <AdminRoute>
            <Rapport />
          </AdminRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/recommendations">
        <ProtectedRoute>
          <ErrorBoundary>
            <Recommendations />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      <Route path="/recommendations/:id">
        {(params) => (
          <ProtectedRoute>
            <ErrorBoundary>
              <RecommendationDetailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/comments">
        <ProtectedRoute>
          <ErrorBoundary>
            <Comments />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      <Route path="/comments/:id">
        {(params) => (
          <ProtectedRoute>
            <ErrorBoundary>
              <CommentDetailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/reports">
        <ProtectedRoute>
          <ErrorBoundary>
            <Reports />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      <Route path="/reports/:id">
        {(params) => (
          <ProtectedRoute>
            <ErrorBoundary>
              <ReportDetailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/system-reports">
        <ProtectedRoute>
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <ErrorBoundary>
            <Profile />
          </ErrorBoundary>
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
