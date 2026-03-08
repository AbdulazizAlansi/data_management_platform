import React from "react";
import { motion } from "framer-motion";
import { Upload, Tags, Activity, ShieldCheck, LayoutDashboard } from "lucide-react";

const capabilities = [
  {
    icon: Upload,
    title: "Upload Datasets",
    description: "Easily bring your CSV, Excel, and other datasets into a centralized, secure workspace.",
  },
  {
    icon: Tags,
    title: "Organize Metadata",
    description: "Tag, categorize, and enrich your datasets with structured metadata for better discoverability.",
  },
  {
    icon: Activity,
    title: "Monitor Data Quality",
    description: "Track completeness, accuracy, and consistency of your data with automated quality checks.",
  },
  {
    icon: ShieldCheck,
    title: "Track Governance",
    description: "Maintain full oversight of data lineage, ownership, and compliance requirements.",
  },
  {
    icon: LayoutDashboard,
    title: "Explore Dashboards",
    description: "Visualize trends, patterns, and KPIs through interactive analytics dashboards.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 block">About DataHarbor</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Your single platform for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">data excellence</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            DataHarbor brings together everything you need to manage, understand, and trust your data — 
            from upload to insight, all in one intuitive workspace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative p-7 rounded-2xl border border-slate-100 bg-white hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-cyan-50/30 hover:border-blue-100 transition-all duration-500 ${
                i === 4 ? "md:col-start-1 lg:col-start-2" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 transition-colors duration-500 shrink-0">
                  <cap.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">{cap.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{cap.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}