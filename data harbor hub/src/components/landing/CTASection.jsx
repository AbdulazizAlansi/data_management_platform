import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Anchor } from "lucide-react";

const PLATFORM_URL = "https://bmdata-insight-flow.base44.app";

export default function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-12 sm:p-16 lg:p-20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[60px]" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8">
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Start your journey</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Ready to explore{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">DataHarbor</span>?
            </h2>

            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              Join organizations that trust DataHarbor to manage, govern, and unlock the full potential of their data.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`${PLATFORM_URL}/dashboard`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-8 h-12 text-base shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 group">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
              <a href={PLATFORM_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/15 text-white bg-white/[0.04] hover:bg-white/[0.08] font-semibold px-8 h-12 text-base backdrop-blur-sm transition-all duration-300 group">
                  Go to DataHarbor Platform
                  <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}