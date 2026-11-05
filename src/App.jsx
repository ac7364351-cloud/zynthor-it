import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Public Marketing Shell Components (Dedicated to /website)
import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ScrollManager from "./components/ScrollManager/ScrollManager.jsx";

// Public Marketing Pages (Dedicated to /website)
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProductBusinessOSPage from "./pages/ProductBusinessOSPage.jsx";
import BookDemoPage from "./pages/BookDemoPage.jsx";

// Business OS Layout & Workspace Pages
import BusinessOSLayout from "./layouts/BusinessOSLayout.jsx";
import DashboardPage from "./pages/app/DashboardPage.jsx";
import AdminPage from "./pages/app/AdminPage.jsx";
import BrandEditorPage from "./pages/app/BrandEditorPage.jsx";
import LeadsPage from "./pages/app/LeadsPage.jsx";
import CustomersPage from "./pages/app/CustomersPage.jsx";
import SalonPage from "./pages/app/SalonPage.jsx";
import CafePage from "./pages/app/CafePage.jsx";
import AIBotPage from "./pages/app/AIBotPage.jsx";
import AutomationPage from "./pages/app/AutomationPage.jsx";
import ReportsPage from "./pages/app/ReportsPage.jsx";
import SettingsPage from "./pages/app/SettingsPage.jsx";
import PlansPage from "./pages/app/PlansPage.jsx";
import OnboardingPage from "./pages/app/OnboardingPage.jsx";

// Auth & Public Customer Portals
import LoginPage from "./pages/auth/LoginPage.jsx";
import PublicSalonBooking from "./pages/public/PublicSalonBooking.jsx";
import PublicCafeMenu from "./pages/public/PublicCafeMenu.jsx";

/**
 * Primary SaaS Application Entry Point:
 * Directs visitors directly to the authenticated Business OS dashboard if active,
 * or displays the high-contrast SaaS sign-in screen. Never shows the marketing landing page.
 */
function AppEntry() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center text-theme-primary space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-theme-muted font-medium">Initializing Zynthor Business OS...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

// Marketing Site Layout Wrapper (Exclusively for /website routes)
function MarketingLayout({ onOpenQuote }) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Navbar onOpenQuote={onOpenQuote} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer onOpenQuote={onOpenQuote} />
    </div>
  );
}

function App() {
  const [selectedService, setSelectedService] = useState(null);

  const handleOpenQuote = () => {
    const contactElem = document.getElementById("contact-form") || document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectPackage = (packageName) => {
    setSelectedService(packageName);
    setTimeout(() => {
      handleOpenQuote();
    }, 60);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollManager />

          <Routes>
            {/* ==========================================================
                1. PRIMARY SAAS APPLICATION ENTRY & AUTHENTICATION
                Root '/' always opens the original Zynthor Business OS SaaS software.
                ========================================================== */}
            <Route path="/" element={<AppEntry />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<OnboardingPage />} />

            {/* ==========================================================
                2. CORE BUSINESS OS WORKSPACE DIRECT ROUTES
                All original SaaS dashboards and business management modules.
                ========================================================== */}
            <Route element={<BusinessOSLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/business" element={<DashboardPage />} />
              <Route path="/business-management" element={<AdminPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/salon" element={<SalonPage />} />
              <Route path="/cafe" element={<CafePage />} />
              <Route path="/ai-bot" element={<AIBotPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/brand-editor" element={<BrandEditorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/invoices" element={<PlansPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            {/* ==========================================================
                3. BACKWARD-COMPATIBLE /app WORKSPACE PREFIX ROUTES
                Ensures all internal bookmarks and references resolve cleanly.
                ========================================================== */}
            <Route path="/app" element={<BusinessOSLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="business" element={<DashboardPage />} />
              <Route path="business-management" element={<AdminPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="salon" element={<SalonPage />} />
              <Route path="cafe" element={<CafePage />} />
              <Route path="ai-bot" element={<AIBotPage />} />
              <Route path="automation" element={<AutomationPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="brand-editor" element={<BrandEditorPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="invoices" element={<PlansPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
            </Route>

            {/* ==========================================================
                4. CUSTOMER-FACING PUBLIC LIVE PORTALS
                ========================================================== */}
            <Route path="/book/:slug" element={<PublicSalonBooking />} />
            <Route path="/menu/:slug" element={<PublicCafeMenu />} />

            {/* ==========================================================
                5. STANDALONE ZYNTHOR IT MARKETING WEBSITE (/website)
                Strictly separated under /website — never replaces or damages the SaaS OS.
                ========================================================== */}
            <Route path="/website" element={<MarketingLayout onOpenQuote={handleOpenQuote} />}>
              <Route
                index
                element={
                  <HomePage
                    selectedService={selectedService}
                    onSelectPackage={handleSelectPackage}
                    onOpenQuote={handleOpenQuote}
                  />
                }
              />
              <Route path="products" element={<ProductBusinessOSPage />} />
              <Route path="products/business-os" element={<ProductBusinessOSPage />} />
              <Route
                path="pricing"
                element={<PricingPage onSelectPackage={handleSelectPackage} />}
              />
              <Route path="book-demo" element={<BookDemoPage />} />
              <Route
                path="services"
                element={<ServicesPage onSelectPackage={handleSelectPackage} />}
              />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route
                path="contact"
                element={<ContactPage selectedService={selectedService} />}
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ==========================================================
                6. CATCH-ALL ROUTE: Always redirect to SaaS root '/'
                ========================================================== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;