import React from "react";
import { Upload, ArrowRight, Database, BarChart3, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-800 via-teal-700 to-slate-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize:"40px 40px"}} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">No Datasets Yet</h1>
          <p className="text-base text-slate-200">Your private workspace is ready. Start by uploading your first dataset to begin exploring DataHarbor's powerful features.</p>
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-4 py-2 max-w-sm mt-4">
            <p className="text-emerald-300 text-sm font-medium">💚 Free tier: Up to 20 datasets, 100MB per file</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Primary: Upload Dataset */}
        <Link to={createPageUrl("Datasets")} className="block">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload First Dataset</h3>
            <p className="text-sm text-teal-100 mb-6 flex-1">CSV, Excel, or JSON formats. Start analyzing in seconds.</p>
            <Button className="w-full bg-white text-teal-600 hover:bg-teal-50 font-semibold">
              Upload Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Link>

        {/* Secondary: View Demo */}
        <div className="block">
          <div className="bg-white border-2 border-dashed border-blue-300 rounded-2xl p-6 hover:shadow-lg hover:border-blue-400 transition-all h-full flex flex-col cursor-not-allowed opacity-60">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">View Demo Dataset</h3>
            <p className="text-sm text-slate-600 mb-6 flex-1">Explore sample data and features (Coming soon).</p>
            <Button variant="outline" className="w-full text-slate-500" disabled>
              Coming Soon
            </Button>
          </div>
        </div>

        {/* Tertiary: Learn About Metadata */}
        <Link to={createPageUrl("Metadata")} className="block">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Learn About Metadata</h3>
            <p className="text-sm text-slate-600 mb-6 flex-1">Organize data with tags, descriptions, and ownership.</p>
            <Button variant="outline" className="w-full text-slate-700">
              Explore <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Link>

        {/* Quaternary: Learn About Data Quality */}
        <Link to={createPageUrl("DataQuality")} className="block">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-emerald-200 transition-all h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Learn About Quality</h3>
            <p className="text-sm text-slate-600 mb-6 flex-1">Auto-detect issues, missing values, and inconsistencies.</p>
            <Button variant="outline" className="w-full text-slate-700">
              Explore <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-8 border border-violet-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Start Tips</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-3">
            <span className="text-teal-600 font-bold mt-0.5">1.</span>
            <span>Upload your first CSV or Excel file from the Datasets page</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-teal-600 font-bold mt-0.5">2.</span>
            <span>Fill in metadata to describe your dataset (category, department, owner)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-teal-600 font-bold mt-0.5">3.</span>
            <span>View automatic quality analysis and data insights on the Insights page</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-teal-600 font-bold mt-0.5">4.</span>
            <span>Monitor your data catalog and quality metrics from the dashboard</span>
          </li>
        </ul>
      </div>
    </div>
  );
}