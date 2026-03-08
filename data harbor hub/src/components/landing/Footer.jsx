import React from "react";
import { Anchor } from "lucide-react";

const PLATFORM_URL = "https://bmdata-insight-flow.base44.app";

const scrollTo = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", action: () => scrollTo("#features") },
      { label: "How It Works", action: () => scrollTo("#how-it-works") },
      { label: "Who It's For", action: () => scrollTo("#audience") },
      { label: "Why DataHarbor", action: () => scrollTo("#why") },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Sign Up", href: `${PLATFORM_URL}/dashboard` },
      { label: "Sign In", href: `${PLATFORM_URL}/login` },
      { label: "Go to Platform", href: PLATFORM_URL },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">DataHarbor</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              A modern data management and analytics platform — your safe harbor for organizing, governing, and understanding your data.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link, j) => (
                  <li key={j}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button
                        onClick={link.action}
                        className="text-sm text-slate-500 hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} DataHarbor. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            A Safe Harbor for Your Data
          </p>
        </div>
      </div>
    </footer>
  );
}