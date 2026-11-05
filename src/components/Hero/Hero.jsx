import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiShield, FiClock, FiCpu, FiDatabase, FiLayers } from "react-icons/fi";
import heroWorkspaceImg from "../../assets/images/hero-workspace.jpg";

const Hero = ({ onOpenQuote }) => {
  const shouldReduceMotion = useReducedMotion();
  const [rotateX, setRotateX] = useState(3);
  const [rotateY, setRotateY] = useState(-6);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rY = ((x - centerX) / centerX) * 8;
    const rX = -((y - centerY) / centerY) * 8;
    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(3);
    setRotateY(-6);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const fadeIn = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        delay: shouldReduceMotion ? 0 : custom * 0.12,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] bg-slate-950 flex items-center pt-32 pb-20 overflow-hidden"
    >
      {/* Background ambient lighting and subtle tech pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute -top-10 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
            backgroundSize: `40px 40px`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <motion.div
            className="lg:col-span-7 text-left"
            initial="hidden"
            animate="visible"
          >
            {/* Top Pill Badge */}
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Full-Stack Web Development • Modern Digital Studio</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeIn}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.12]"
            >
              Engineering Modern{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">
                Websites & Software
              </span>{" "}
              for Growing Businesses
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeIn}
              custom={2}
              className="text-slate-300 text-base sm:text-lg mt-6 max-w-2xl leading-relaxed font-normal"
            >
              From business websites to data dashboards, we help companies build effective digital 
              experiences — wherever they are. Clean architecture, transparent milestone pricing, 
              and 100% complete source code ownership.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              variants={fadeIn}
              custom={3}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8"
            >
              <button
                type="button"
                onClick={onOpenQuote}
                className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Request a Project Quote</span>
                <FiArrowRight className="text-base" />
              </button>

              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-200 hover:text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
              >
                <span>View Affordable Packages (from ₹1,499)</span>
              </a>
            </motion.div>

            {/* Trust Guarantees */}
            <motion.div
              variants={fadeIn}
              custom={4}
              className="flex flex-wrap items-center gap-5 mt-8 text-xs text-slate-400 font-medium pt-6 border-t border-slate-800/60"
            >
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-400" />
                <span>100% Code Ownership</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiShield className="text-blue-400" />
                <span>NDA & Privacy Assured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiClock className="text-blue-400" />
                <span>Fast 24h Response</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Interactive Device & Workstation Showcase */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: 0.25, ease: "easeOut" }}
          >
            <div
              className="relative mx-auto max-w-md lg:max-w-none [perspective:1200px]"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Outer Decorative 3D Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 to-cyan-500/20 rounded-3xl blur-2xl opacity-40 pointer-events-none transition-opacity duration-500" />

              {/* 3D Perspective Card Container */}
              <div
                className="relative rounded-2xl bg-slate-900/95 border border-slate-700/70 overflow-hidden shadow-2xl transition-transform duration-200 ease-out [transform-style:preserve-3d]"
                style={{
                  transform: shouldReduceMotion
                    ? "none"
                    : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(59, 130, 246, 0.15)",
                }}
              >
                {/* Dynamic Specular Glare */}
                <div
                  className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, transparent 60%)`,
                  }}
                />

                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800 [transform:translateZ(10px)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/90 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-green-500/90 shadow-sm" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    zynthor.engineering.studio
                  </span>
                  <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live
                  </div>
                </div>

                {/* Visual Content: High-Resolution Real Developer Workstation */}
                <div className="relative h-64 sm:h-76 w-full overflow-hidden bg-slate-950 group">
                  <img
                    src={heroWorkspaceImg}
                    alt="Authentic Modern Web Development Studio Workstation"
                    className="w-full h-full object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  {/* Subtle dark gradient overlay for text readability without washing out colors */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* 3D Floating Chip: Top Left Feature */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg [transform:translateZ(20px)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-slate-200">Modern Architecture</span>
                  </div>

                  {/* 3D Floating Analytics / Stack Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-md shadow-2xl [transform:translateZ(28px)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Full-Stack Production Stack
                      </span>
                      <span className="text-blue-400 font-mono text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                        Fast SLAs
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/90 shadow-sm flex flex-col items-center justify-center">
                        <FiLayers className="text-blue-400 text-xs mb-0.5" />
                        <span className="block font-bold text-white text-xs">React 19</span>
                        <span className="text-slate-400 text-[9px]">Frontend</span>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/90 shadow-sm flex flex-col items-center justify-center">
                        <FiCpu className="text-blue-400 text-xs mb-0.5" />
                        <span className="block font-bold text-white text-xs">Node.js</span>
                        <span className="text-slate-400 text-[9px]">REST APIs</span>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/90 shadow-sm flex flex-col items-center justify-center">
                        <FiDatabase className="text-blue-400 text-xs mb-0.5" />
                        <span className="block font-bold text-white text-xs">MySQL</span>
                        <span className="text-slate-400 text-[9px]">Database</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;