import React, { useState, useEffect } from "react";
import { Menu, X, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLATFORM_URL = "https://bmdata-insight-flow.base44.app";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Who It's For", href: "#audience" },
  { label: "Why DataHarbor", href: "#why" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 group">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${scrolled ? "bg-gradient-to-br from-blue-600 to-cyan-500" : "bg-white/15 backdrop-blur-sm"}`}>
              <Anchor className={`w-5 h-5 transition-colors duration-300 ${scrolled ? "text-white" : "text-white"}`} />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${scrolled ? "text-slate-900" : "text-white"}`}>
              DataHarbor
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a href={`${PLATFORM_URL}/login`} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                className={`text-sm font-medium transition-all duration-300 ${
                  scrolled ? "text-slate-700 hover:text-slate-900" : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                Sign In
              </Button>
            </a>
            <a href={`${PLATFORM_URL}/dashboard`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold px-5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-700" : "text-white"}`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a href={`${PLATFORM_URL}/login`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">Sign In</Button>
            </a>
            <a href={`${PLATFORM_URL}/dashboard`} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white">Get Started</Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}