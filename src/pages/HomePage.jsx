import Hero from "../components/Hero/Hero.jsx";
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
  return (
    <>
      <Hero onOpenQuote={onOpenQuote} />
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
