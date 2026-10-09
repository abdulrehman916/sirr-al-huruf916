import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { PageStateProvider } from './context/PageStateContext';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import { I18nProvider } from '@/i18n/I18nContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineNotice from './components/OfflineNotice';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedPage from './components/ProtectedPage';
import ROUTE_MANIFEST from '@/lib/routeManifest';
import RulesGate from './components/RulesGate';
import GoogleSignInPrompt from './components/GoogleSignInPrompt';
import PreviewStateRestore from './components/PreviewStateRestore';
import { persistGet, isDevMode } from '@/lib/devModePersistence';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useNavigation } from './context/NavigationContext';
import RouteScrollRestore from './components/RouteScrollRestore';

const PAGE_IMPORTS = {
  Home:                     () => import('./pages/Home'),
  Onboarding:               () => import('./pages/Onboarding'),
  Login:                    () => import('./pages/Login'),
  OwnerLogin:               () => import('./pages/OwnerLogin'),
  Register:                 () => import('./pages/Register'),
  ForgotPassword:           () => import('./pages/ForgotPassword'),
  ResetPassword:            () => import('./pages/ResetPassword'),
  AuthCallback:             () => import('./pages/AuthCallback'),
  AbjadKabirPage:           () => import('./pages/AbjadKabirPage'),
  AnasirPage:               () => import('./pages/AnasirPage'),
  HadimPage:                () => import('./pages/HadimPage'),
  Mizaan9Page:              () => import('./pages/Mizaan9Page'),
  MagicSqayerPage:          () => import('./pages/MagicSqayerPage'),
  VefkinYapilisiPage:       () => import('./pages/VefkinYapilisiPage'),
  BastHuroofPage:           () => import('./pages/BastHuroofPage'),
  FaalHasrathPage:          () => import('./pages/FaalHasrathPage'),
  PlantsPage:               () => import('./pages/PlantsPage'),
  PlantDetailPage:          () => import('./pages/PlantDetailPage'),
  EvilJinnPage:             () => import('./pages/EvilJinnPage'),
  MagicalHolyNamesPage:     () => import('./pages/MagicalHolyNamesPage'),
  SectionCPage:             () => import('./pages/SectionCPage'),
  SectionDPage:             () => import('./pages/SectionDPage'),
  HolyOnePage:              () => import('./pages/HolyOnePage'),
  HolyOneDetailPage:        () => import('./pages/HolyOneDetailPage'),
  AstroClockPage:           () => import('./pages/AstroClockPage'),
  AstroClockSearch:         () => import('./components/astroclock/AstroClockSearch'),
  SirrPage:                 () => import('./pages/SirrPage'),
  ManagedContentPage:       () => import('./pages/ManagedContentPage'),
  ResourcesLibrary:         () => import('./pages/ResourcesLibrary'),
  BooksLibrary:             () => import('./pages/BooksLibrary'),
  BookDetailPage:           () => import('./pages/BookDetailPage'),
  CustomerService:          () => import('./pages/CustomerService'),
  SupportHub:               () => import('./pages/SupportHub'),
  SupportChat:              () => import('./pages/SupportChat'),
  SupportVoice:             () => import('./pages/SupportVoice'),
  SupportTicket:            () => import('./pages/SupportTicket'),
  WhatsAppSupport:          () => import('./pages/WhatsAppSupport'),
  SubscriptionExpired:      () => import('./pages/SubscriptionExpired'),
  SubscriptionPending:      () => import('./pages/SubscriptionPending'),
  PremiumAccessRequest:     () => import('./pages/PremiumAccessRequest'),
  MySubscription:           () => import('./pages/MySubscription'),
  MyLibrary:                () => import('./pages/MyLibrary'),
  MyRequests:               () => import('./pages/MyRequests'),
  RedeemCodeApproval:       () => import('./pages/RedeemCodeApproval'),
  AdminDashboard:           () => import('./pages/AdminDashboard'),
  OwnerContentStudio:       () => import('./pages/OwnerContentStudio'),
  ApprovedUsersPage:        () => import('./pages/ApprovedUsersPage'),
  AdminSupport:             () => import('./pages/AdminSupport'),
  PagePermissions:          () => import('./pages/PagePermissions'),
  AdminAccessCodes:         () => import('./pages/AdminAccessCodes'),
  AdminGoogleLinked:        () => import('./pages/AdminGoogleLinked'),
  CodeDetailPage:           () => import('./pages/CodeDetailPage'),
  AdminAccessRequests:      () => import('./pages/AdminAccessRequests'),
  AdminRedeemApprovals:     () => import('./pages/AdminRedeemApprovals'),
  AdminAccessLogs:          () => import('./pages/AdminAccessLogs'),
  AdminSettings:            () => import('./pages/AdminSettings'),
  AdminSystemSettings:      () => import('./pages/AdminSystemSettings'),
  AdminAnalytics:           () => import('./pages/AdminAnalytics'),
  AdminAdmins:              () => import('./pages/AdminAdmins'),
  UserDetailPage:           () => import('./pages/UserDetailPage'),
  AdminPDFContentEditor:    () => import('./pages/AdminPDFContentEditor'),
  OwnerBooksStudio:         () => import('./pages/OwnerBooksStudio'),
  OwnerResourceStudio:      () => import('./pages/OwnerResourceStudio'),
  AdminHolyNamesTranslator: () => import('./pages/AdminHolyNamesTranslator'),
  AdminFeaturePricing:      () => import('./pages/AdminFeaturePricing'),
  MizanCompletionTest:      () => import('./pages/MizanCompletionTest'),
  RulesConditions:          () => import('./pages/RulesConditions'),
  ShopPage:                 () => import('./pages/ShopPage'),
  ProductDetailPage:        () => import('./pages/ProductDetailPage'),
  AdminProducts:            () => import('./pages/AdminProducts'),
  AdminShopDashboard:       () => import('./pages/AdminShopDashboard'),
  AdminAuditLog:            () => import('./pages/AdminAuditLog'),
  AdminPurposeDictionary:   () => import('./pages/AdminPurposeDictionary'),
  MasterPdfLibrary:         () => import('./pages/MasterPdfLibrary'),
  OwnerPendingReviews:      () => import('./pages/OwnerPendingReviews'),
  UnifiedKnowledgeSearch:   () => import('./pages/UnifiedKnowledgeSearch'),
  AstroClockLibraryStatus:  () => import('./pages/AstroClockLibraryStatus'),
  OwnerApprovalQueue:       () => import('./pages/OwnerApprovalQueue'),
};

function useRouteElements() {
  return useMemo(() => ROUTE_MANIFEST.map(entry => {
    const importFn = PAGE_IMPORTS[entry.chunk];
    if (!importFn) {
      console.warn(`[RouteManifest] No import for chunk: ${entry.chunk}`);
      return null;
    }
    const LazyPage = lazy(importFn);
    const isPublic = entry.flags?.includes('public');
    const isNoAuth = entry.flags?.includes('noauth');

    if (isNoAuth) {
      return <Route key={entry.path} path={entry.path} element={<LazyPage />} />;
    }

    return (
      <Route
        key={entry.path}
        path={entry.path}
        element={
          <ErrorBoundary>
            <ProtectedPage routePath={entry.path} requiresPermission={isPublic ? false : undefined}>
              <LazyPage />
            </ProtectedPage>
          </ErrorBoundary>
        }
      />
    );
  }).filter(Boolean), []);
}

const PageFallback = () => (
  <div style={{ minHeight: "60vh", background: "transparent" }} />
);

function GlobalBackButton() {
  const location = useLocation();
  const { t, language } = useTranslation();
  const { goBack } = useNavigation();

  if (location.pathname === '/') return null;


  const BackIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t('btn_back', 'Back')}
      className="fixed left-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        zIndex: 80,
        color: '#F0D56A',
        background: 'rgba(3, 9, 22, 0.94)',
        border: '1px solid rgba(212,175,55,0.42)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <BackIcon className="h-4 w-4" aria-hidden="true" />
      <span>{t('btn_back', 'Back')}</span>
    </button>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings, isAuthenticated } = useAuth();
  const location = useLocation();
  const routeElements = useRouteElements();
  const [googlePromptDismissed, setGooglePromptDismissed] = useState(
    () => persistGet('sirr_google_prompt_dismissed') === 'true'
  );

  useEffect(() => {
    if (isAuthenticated) setGooglePromptDismissed(true);
  }, [isAuthenticated]);


  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#020710" }}>
        <div className="w-8 h-8 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <RouteScrollRestore />
      {import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true' && !isDevMode && !isAuthenticated && !googlePromptDismissed && (
        <GoogleSignInPrompt onSkip={() => setGooglePromptDismissed(true)} />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          style={{ willChange: "opacity" }}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              {routeElements}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
          <GlobalBackButton />
        </motion.div>
      </AnimatePresence>
    </>
  );
};

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!isDevMode && !splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <I18nProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <PageStateProvider>
                <NavigationProvider>
                  <PreviewStateRestore />
                  <RulesGate>
                    <AuthenticatedApp />
                  </RulesGate>
                </NavigationProvider>
              </PageStateProvider>
            </Router>
            <Toaster />
            <PWAInstallPrompt />
            <OfflineNotice />
          </QueryClientProvider>
        </AuthProvider>
      </I18nProvider>
    </>
  )
}

export default App
