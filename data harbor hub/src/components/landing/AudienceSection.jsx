import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Wrench, ShieldCheck, Briefcase, FileSpreadsheet } from "lucide-react";

const audiences = [
  {
    icon: BarChart3,
    title: "Data Analysts",
    description: "Quickly find, understand, and trust the data you need for accurate analysis.",
  },
  {
    icon: Wrench,
    title: "Data Engineers",
    description: "Manage datasets, track versions, and maintain data pipelines with full visibility.",
  },
  {
    icon: ShieldCheck,
    title: "Governance Teams",
    description: "Enforce policies, monitor compliance, and maintain audit trails effortlessly.",
  },
  {
    icon: Briefcase,
    title: "Business Teams",
    description: "Access dashboards and reports without technical complexity — data-driven decisions, simplified.",
  },
  {
    icon: FileSpreadsheet,
    title: "Organizations with CSV & Excel",
    description: "Turn spreadsheet chaos into structured, governed, and discoverable data assets.",
  },
];

export default function AudienceSection() {
  return (
    <section id="audience" className="py-24 lg:py-32 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 block">Who It's For</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Built for teams who{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">care about data</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Whether you're an analyst, engineer, or business leader — DataHarbor adapts to your workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {audiences.map((aud, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-500 ${
                i >= 3 ? "sm:col-span-1 lg:col-span-1" : ""
              } ${i === 3 ? "lg:col-start-1" : ""} ${i === 4 ? "lg:col-start-2 sm:col-start-1" : ""}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center mb-5">
                <aud.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{aud.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{aud.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}