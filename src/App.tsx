
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Trading from "@/pages/Trading";
import Portfolio from "@/pages/Portfolio";
import Watchlist from "@/pages/Watchlist";
import Orders from "@/pages/Orders";
import Login from "@/pages/Login";
import VerifyOtp from "@/pages/VerifyOtp";
import CompleteProfile from "@/pages/CompleteProfile";
import Profile from "@/pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/verify-otp" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <VerifyOtp />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/complete-profile" 
                element={
                  <ProtectedRoute requireCompleteProfile={false}>
                    <CompleteProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected App Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/trading" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Trading />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/portfolio" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Portfolio />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/watchlist" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Watchlist />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Orders />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireCompleteProfile={false}>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
