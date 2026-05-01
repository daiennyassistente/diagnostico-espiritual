import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";

// Lazy load non-critical pages
const Resultado = lazy(() => import("./pages/Resultado"));
const Result = lazy(() => import("./pages/Result"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminLogin = lazy(() => import("./pages/AdminLogin").then(m => ({ default: m.AdminLogin })));
const SharePage = lazy(() => import("./pages/SharePage"));
const OfferPage = lazy(() => import("./pages/Offer").then(m => ({ default: m.OfferPage })));
const OfferWhatsAppPage = lazy(() => import("./pages/OfferWhatsApp").then(m => ({ default: m.OfferWhatsAppPage })));

const LoadingFallback = () => null;

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/quiz"} component={Quiz} />
        <Route path={"/resultado"} component={Resultado} />
        <Route path={"/result"} component={Result} />
        <Route path={"/checkout-success"} component={CheckoutSuccess} />
        <Route path={"/sucesso"} component={CheckoutSuccess} />
        <Route path={"/share"} component={SharePage} />
        <Route path={"/offer"} component={OfferPage} />
        <Route path={"/offer-whatsapp"} component={OfferWhatsAppPage} />

        <Route path={"/admin-login"} component={AdminLogin} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/admin-legacy"} component={Admin} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
