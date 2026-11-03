import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Public Marketing Shell Components
import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ScrollManager from "./components/ScrollManager/ScrollManager.jsx";

// Public Marketing Pages
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Business OS Layout & Workspace Pages
import BusinessOSLayout from "./layouts/BusinessOSLayout.jsx";
import DashboardPage from "./pages/app/DashboardPage.jsx";
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

// Marketing Site Layout Wrapper
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
            {/* 1. Core Business OS Workspace Routes */}
            <Route path="/app" element={<BusinessOSLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="salon" element={<SalonPage />} />
              <Route path="cafe" element={<CafePage />} />
              <Route path="ai-bot" element={<AIBotPage />} />
              <Route path="automation" element={<AutomationPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
            </Route>

            {/* 2. Customer-Facing Public Live Portals */}
            <Route path="/book/:slug" element={<PublicSalonBooking />} />
            <Route path="/menu/:slug" element={<PublicCafeMenu />} />

            {/* 3. Authentication & Onboarding */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<OnboardingPage />} />

            {/* 4. Public Agency & Marketing Website Routes */}
            <Route element={<MarketingLayout onOpenQuote={handleOpenQuote} />}>
              <Route
                path="/"
                element={
                  <HomePage
                    selectedService={selectedService}
                    onSelectPackage={handleSelectPackage}
                    onOpenQuote={handleOpenQuote}
                  />
                }
              />
              <Route
                path="/services"
                element={<ServicesPage onSelectPackage={handleSelectPackage} />}
              />
              <Route
                path="/pricing"
                element={<PricingPage onSelectPackage={handleSelectPackage} />}
              />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/contact"
                element={<ContactPage selectedService={selectedService} />}
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
