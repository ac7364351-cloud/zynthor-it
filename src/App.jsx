import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ScrollManager from "./components/ScrollManager/ScrollManager.jsx";

// Page Views
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProductBusinessOSPage from "./pages/ProductBusinessOSPage.jsx";
import BookDemoPage from "./pages/BookDemoPage.jsx";

function AppContent() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  const handleOpenQuote = () => {
    const contactElem = document.getElementById("contact-form") || document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/contact");
    }
  };

  const handleSelectPackage = (packageName) => {
    setSelectedService(packageName);
    const contactElem = document.getElementById("contact-form") || document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/contact");
    }
  };

  return (
    <>
      {/* Scroll restoration and route change reset manager */}
      <ScrollManager />

      <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white flex flex-col justify-between">
        <Navbar onOpenQuote={handleOpenQuote} />

        <main className="flex-grow">
          <Routes>
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
            <Route path="/products" element={<ProductBusinessOSPage />} />
            <Route path="/products/business-os" element={<ProductBusinessOSPage />} />
            <Route
              path="/pricing"
              element={<PricingPage onSelectPackage={handleSelectPackage} />}
            />
            <Route path="/book-demo" element={<BookDemoPage />} />
            <Route
              path="/services"
              element={<ServicesPage onSelectPackage={handleSelectPackage} />}
            />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/contact"
              element={<ContactPage selectedService={selectedService} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer onOpenQuote={handleOpenQuote} />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;