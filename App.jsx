import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SafeContainer from './components/SafeContainer';
import BottomNavigation from './components/BottomNavigation';
import TopBar from './components/TopBar';
import { TabHistoryProvider } from './lib/TabHistoryContext';

// Eagerly-loaded infrastructure (tiny, always needed)
import PageNotFound from './lib/PageNotFound';

// Lazily-loaded pages — each is code-split into its own chunk
const Home               = lazy(() => import('./pages/Home'));
const Solutions          = lazy(() => import('./pages/Solutions'));
const Dashboard          = lazy(() => import('./pages/Dashboard'));
const Contact            = lazy(() => import('./pages/Contact'));
const Settings           = lazy(() => import('./pages/Settings'));
const Manufacture        = lazy(() => import('./pages/touchpoints/Manufacture'));
const PortOfEntry        = lazy(() => import('./pages/touchpoints/PortOfEntry'));
const WholesaleTransfer  = lazy(() => import('./pages/touchpoints/WholesaleTransfer'));
const RetailReceipt      = lazy(() => import('./pages/touchpoints/RetailReceipt'));
const EndUserVerify      = lazy(() => import('./pages/touchpoints/EndUserVerify'));
const Enforcement        = lazy(() => import('./pages/Enforcement'));
const InspectorPortal    = lazy(() => import('./pages/InspectorPortal'));
const ConsumerAssist     = lazy(() => import('./pages/ConsumerAssist'));
const IncidentManager    = lazy(() => import('./pages/IncidentManager'));
const RiskDashboard      = lazy(() => import('./pages/RiskDashboard'));
const Proof              = lazy(() => import('./pages/Proof'));

// Shared route-level fallback spinner
const RouteFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#060B18]">
    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
  </div>
);

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    style={{ willChange: "transform, opacity" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home"                          element={<PageTransition><Home /></PageTransition>} />
          <Route path="/Solutions"                     element={<PageTransition><Solutions /></PageTransition>} />
          <Route path="/Dashboard"                     element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/Contact"                       element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/Proof"                         element={<PageTransition><Proof /></PageTransition>} />
          <Route path="/Settings"                      element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/touchpoints/manufacture"       element={<PageTransition><Manufacture /></PageTransition>} />
          <Route path="/touchpoints/port-of-entry"     element={<PageTransition><PortOfEntry /></PageTransition>} />
          <Route path="/touchpoints/wholesale-transfer" element={<PageTransition><WholesaleTransfer /></PageTransition>} />
          <Route path="/touchpoints/retail-receipt"    element={<PageTransition><RetailReceipt /></PageTransition>} />
          <Route path="/touchpoints/end-user-verify"   element={<PageTransition><EndUserVerify /></PageTransition>} />
          <Route path="/Enforcement"                   element={<PageTransition><Enforcement /></PageTransition>} />
          <Route path="/InspectorPortal"               element={<PageTransition><InspectorPortal /></PageTransition>} />
          <Route path="/ConsumerAssist"              element={<PageTransition><ConsumerAssist /></PageTransition>} />
          <Route path="/IncidentManager"             element={<PageTransition><IncidentManager /></PageTransition>} />
          <Route path="/RiskDashboard"              element={<PageTransition><RiskDashboard /></PageTransition>} />
          <Route path="*"                              element={<PageTransition><PageNotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <RouteFallback />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <SafeContainer>
      <TopBar />
      <div className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))]">
        <AnimatedRoutes />
      </div>
      <BottomNavigation />
    </SafeContainer>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TabHistoryProvider>
            {/* Skip-to-content for keyboard & assistive-tech users */}
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <AuthenticatedApp />
          </TabHistoryProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;