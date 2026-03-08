import React from "react";
import { motion } from "framer-motion";
import { Database, BookOpen, Activity, ShieldCheck, GitBranch, Lock } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Dataset Management",
    description: "Upload, organize, and manage all your datasets in a centralized repository with version control.",
    gradient: "from-blue-500 to-blue-600",
    bg: "from-blue-50 to-blue-100/50",
  },
  {
    icon: BookOpen,
    title: "Metadata Cataloging",
    description: "Build a rich, searchable catalog of metadata — descriptions, tags, schemas, and ownership details.",
    gradient: "from-cyan-500 to-teal-500",
    bg: "from-cyan-50 to-teal-50/50",
  },
  {
    icon: Activity,
    title: "Data Quality Monitoring",
    description: "Automated quality checks to track completeness, accuracy, timeliness, and consistency scores.",
    gradient: "from-emerald-500 to-green-500",
    bg: "from-emerald-50 to-green-50/50",
  },
  {
    icon: ShieldCheck,
    title: "Governance Dashboard",
    description: "Comprehensive oversight of data policies, compliance status, and governance metrics in one view.",
    gradient: "from-violet-500 to-purple-500",
    bg: "from-violet-50 to-purple-50/50",
  },
  {
    icon: GitBranch,
    title: "Dataset Version Tracking",
    description: "Track every change to your datasets with full version history, diffs, and rollback capabilities.",
    gradient: "from-orange-500 to-amber-500",
    bg: "from-orange-50 to-amber-50/50",
  },
  {
    icon: Lock,
    title: "Secure User Workspaces",
    description: "Isolated, role-based workspaces ensure your teams access only the data they need — securely.",
    gradient: "from-rose-500 to-pink-500",
    bg: "from-rose-50 to-pink-50/50",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 block">Key Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">master your data</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Powerful tools designed for modern data teams, packaged in an intuitive interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group relative p-7 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-500"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bg} flex items-center justify-center mb-5`}>
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>

              {/* Hover gradient accent */}
              <div className={`absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}