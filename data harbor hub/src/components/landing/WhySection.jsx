import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, BadgeCheck, Lightbulb, Layers, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Centralize your data assets",
    description: "One unified platform for all your datasets — no more scattered files across tools and drives.",
  },
  {
    icon: Eye,
    title: "Improve data visibility",
    description: "Know what data exists, where it lives, who owns it, and how it's being used across the organization.",
  },
  {
    icon: BadgeCheck,
    title: "Increase trust in data quality",
    description: "Automated quality checks give you confidence that the data you're using is accurate and reliable.",
  },
  {
    icon: Lightbulb,
    title: "Support better decision making",
    description: "With trustworthy data and clear dashboards, your team can make faster, more informed decisions.",
  },
  {
    icon: Layers,
    title: "Manage data in one platform",
    description: "Metadata, governance, quality, and analytics — everything under one roof, one login, one workflow.",
  },
];

export default function WhySection() {
  return (
    <section id="why" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 block">Why DataHarbor</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              The smarter way to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">manage your data</span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Stop juggling spreadsheets, scattered files, and disconnected tools. 
              DataHarbor gives your team a single source of truth with built-in governance and analytics.
            </p>

            {/* Quick stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: "100%", label: "Cloud-based" },
                { value: "5 min", label: "Setup time" },
                { value: "∞", label: "Scalable" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex items-start gap-4 p-5 rounded-xl hover:bg-slate-50 transition-colors duration-300"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 transition-colors shrink-0">
                  <benefit.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}