import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Services from "./components/Services/Services.jsx";
import TechStack from "./components/TechStack/TechStack.jsx";
import Portfolio from "./components/Portfolio/Portfolio.jsx";
import About from "./components/About/About.jsx";
import Contact from "./components/Contact/Contact.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Testimonials from "./components/Testimonials/Testimonials.jsx";
import FAQ from "./components/FAQ/FAQ.jsx";
import CTA from "./components/CTA/CTA.jsx";
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <TechStack />
      <Testimonials />
      <Portfolio />
      <FAQ />
      <Contact/>
      <Footer />
      <CTA/>
    </>
  );
}

export default App;