import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { isPublicDemoMode } from '@/lib/demo/publicDemo';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import DemoBanner from '@/components/DemoBanner';
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
const TrustCenter        = lazy(() => import('./pages/TrustCenter'));
const Enterprise         = lazy(() => import('./pages/Enterprise'));
const SectorsPage        = lazy(() => import('./pages/Sectors'));
const GettingStarted     = lazy(() => import('./pages/GettingStarted'));
const SignIn             = lazy(() => import('./pages/SignIn'));
const QrScan             = lazy(() => import('./pages/QrScan'));

// Shared route-level fallback spinner
const RouteFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#060B18]">
    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
  </div>
);

/** `/login` → `/login/consumer` while preserving `location.state` (e.g. `from`) and query (e.g. `return`). */
const LoginRootRedirect = () => {
  const location = useLocation();
  return (
    <Navigate
      to={{ pathname: '/login/consumer', search: location.search }}
      replace
      state={location.state}
    />
  );
};

/**
 * Client-side route guard for navigation UX only. It does not authenticate users
 * and must not be relied on for authorization. Production APIs must enforce roles and
 * app registration on every sensitive path: `/api/auth/me`, bootstrap, and server
 * function handlers (`server/functions/`).
 */
const RequireRole = ({ allow, children }) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const authEnforced = import.meta.env.VITE_REQUIRE_AUTH === 'true';
  if (authEnforced && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  }
  const ok = allow.includes(role);
  if (ok) return children;
  const target = role === 'regulator' ? '/login/regulator' : '/login/consumer';
  return <Navigate to={target} replace state={{ from: location.pathname + location.search + location.hash }} />;
};

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
          <Route path="/login"                         element={<LoginRootRedirect />} />
          <Route path="/login/consumer"                element={<PageTransition><SignIn mode="consumer" /></PageTransition>} />
          <Route path="/login/regulator"               element={<PageTransition><SignIn mode="regulator" /></PageTransition>} />
          <Route path="/SignIn"                        element={<Navigate to="/login" replace />} />
          <Route path="/Home"                          element={<PageTransition><Home /></PageTransition>} />
          <Route path="/Solutions"                     element={<PageTransition><Solutions /></PageTransition>} />
          <Route path="/Dashboard"                     element={<RequireRole allow={['regulator']}><PageTransition><Dashboard /></PageTransition></RequireRole>} />
          <Route path="/Contact"                       element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/Proof"                         element={<PageTransition><Proof /></PageTransition>} />
          <Route path="/Trust"                         element={<PageTransition><TrustCenter /></PageTransition>} />
          <Route path="/Enterprise"                    element={<PageTransition><Enterprise /></PageTransition>} />
          <Route path="/Sectors"                       element={<PageTransition><SectorsPage /></PageTransition>} />
          <Route path="/GettingStarted"                element={<PageTransition><GettingStarted /></PageTransition>} />
          <Route path="/Settings"                      element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/touchpoints/manufacture"       element={<PageTransition><Manufacture /></PageTransition>} />
          <Route path="/touchpoints/port-of-entry"     element={<PageTransition><PortOfEntry /></PageTransition>} />
          <Route path="/touchpoints/wholesale-transfer" element={<PageTransition><WholesaleTransfer /></PageTransition>} />
          <Route path="/touchpoints/retail-receipt"    element={<PageTransition><RetailReceipt /></PageTransition>} />
          <Route path="/touchpoints/end-user-verify"   element={<PageTransition><EndUserVerify /></PageTransition>} />
          <Route path="/Enforcement"                   element={<RequireRole allow={['regulator']}><PageTransition><Enforcement /></PageTransition></RequireRole>} />
          <Route path="/InspectorPortal"               element={<RequireRole allow={['regulator']}><PageTransition><InspectorPortal /></PageTransition></RequireRole>} />
          <Route path="/IncidentManager"               element={<RequireRole allow={['regulator']}><PageTransition><IncidentManager /></PageTransition></RequireRole>} />
          <Route path="/RiskDashboard"                 element={<RequireRole allow={['regulator']}><PageTransition><RiskDashboard /></PageTransition></RequireRole>} />
          <Route path="/ConsumerAssist"                element={<RequireRole allow={['consumer']}><PageTransition><ConsumerAssist /></PageTransition></RequireRole>} />
          <Route path="/Verify"                        element={<RequireRole allow={['consumer']}><PageTransition><QrScan /></PageTransition></RequireRole>} />
          <Route path="*"                              element={<PageTransition><PageNotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();
  const hideChrome = location.pathname.startsWith('/login');

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <RouteFallback />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered' && !isPublicDemoMode()) {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required' && import.meta.env.VITE_REQUIRE_AUTH === 'true') {
      // Prefer staying in-app for login when auth is required.
      // External auth can still be reached from the SignIn page via VITE_AUTH_LOGIN_URL.
      if (!location.pathname.startsWith('/login')) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
      }
    }
  }

  return (
    <SafeContainer>
      {isPublicDemoMode() && location.pathname !== '/Home' && !location.pathname.startsWith('/login') && <DemoBanner />}
      {!hideChrome && <TopBar />}
      <div className={hideChrome ? "flex-1" : "flex-1 pb-[calc(56px+env(safe-area-inset-bottom))]"}>
        <AnimatedRoutes />
      </div>
      {!hideChrome && <BottomNavigation />}
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