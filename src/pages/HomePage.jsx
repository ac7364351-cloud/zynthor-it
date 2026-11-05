import { useEffect } from "react";
import Hero from "../components/Hero/Hero.jsx";
import BusinessOSPromo from "../components/BusinessOSPromo/BusinessOSPromo.jsx";
import Services from "../components/Services/Services.jsx";
import Pricing from "../components/Pricing/Pricing.jsx";
import Process from "../components/Process/Process.jsx";
import Portfolio from "../components/Portfolio/Portfolio.jsx";
import TechStack from "../components/TechStack/TechStack.jsx";
import About from "../components/About/About.jsx";
import Testimonials from "../components/Testimonials/Testimonials.jsx";
import FAQ from "../components/FAQ/FAQ.jsx";
import CTA from "../components/CTA/CTA.jsx";
import Contact from "../components/Contact/Contact.jsx";

const HomePage = ({ selectedService, onSelectPackage, onOpenQuote }) => {
  useEffect(() => {
    document.title = "Zynthor IT — Software Engineering, Web Applications & Zynthor Business OS";
  }, []);
  return (
    <>
      <Hero onOpenQuote={onOpenQuote} />
      <BusinessOSPromo />
      <Services onSelectService={onSelectPackage} />
      <Pricing onSelectPackage={onSelectPackage} />
      <Process />
      <Portfolio onOpenQuote={onOpenQuote} />
      <TechStack />
      <About onOpenQuote={onOpenQuote} />
      <Testimonials />
      <FAQ />
      <CTA onOpenQuote={onOpenQuote} />
      <Contact preselectedService={selectedService} initialTab="quote" />
    </>
  );
};

export default HomePage;
