import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <BrowserRouter>
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
          </Routes>
        </main>

        <Footer onOpenQuote={handleOpenQuote} />
      </div>
    </BrowserRouter>
  );
}

export default App;