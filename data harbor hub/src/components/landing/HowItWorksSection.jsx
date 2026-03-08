import React from "react";
import { motion } from "framer-motion";
import { Upload, FileText, SearchCheck, BarChart3, FolderOpen } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your dataset",
    description: "Drag and drop your CSV, Excel, or other data files into your secure workspace.",
  },
  {
    icon: FileText,
    number: "02",
    title: "Add metadata and tags",
    description: "Enrich datasets with descriptions, categories, ownership info, and custom tags.",
  },
  {
    icon: SearchCheck,
    number: "03",
    title: "Monitor data quality",
    description: "Automated checks validate completeness, accuracy, and consistency of your data.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Explore dashboards & insights",
    description: "Visualize governance metrics, quality scores, and dataset analytics in real time.",
  },
  {
    icon: FolderOpen,
    number: "05",
    title: "Manage data in one place",
    description: "A single hub for all your data assets — organized, governed, and always accessible.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            From upload to insight in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">five simple steps</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Getting started with DataHarbor is straightforward. Follow these steps to take full control of your data.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-[39px] top-8 bottom-8 w-px bg-gradient-to-b from-blue-200 via-blue-300 to-cyan-200" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex items-start gap-6 group"
              >
                {/* Step circle */}
                <div className="relative z-10 shrink-0 w-20 h-20 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-200 shadow-sm group-hover:shadow-md group-hover:shadow-blue-100/50 flex flex-col items-center justify-center transition-all duration-500">
                  <step.icon className="w-5 h-5 text-blue-600 mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">{step.number}</span>
                </div>

                {/* Content */}
                <div className="pt-2 pb-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}