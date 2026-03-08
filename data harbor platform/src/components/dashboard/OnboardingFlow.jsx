import React, { useState } from "react";
import { Upload, Zap, User, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "Welcome to DataHarbor",
    subtitle: "Enterprise Data Management Platform",
    description: "Organize, analyze, and govern your data assets with powerful data management capabilities.",
    image: "🏛️"
  },
  {
    title: "Centralized Data Catalog",
    subtitle: "Know What You Have",
    description: "Discover all your data assets in one place. Add metadata, tags, and descriptions to organize your growing data ecosystem.",
    image: "📊"
  },
  {
    title: "Quality Assurance",
    subtitle: "Trust Your Data",
    description: "Automatic quality analysis, completeness checks, and consistency validation to ensure your data meets the highest standards.",
    image: "✅"
  },
  {
    title: "Data Governance",
    subtitle: "Control & Compliance",
    description: "Monitor data lineage, track usage, and maintain compliance across your organization with built-in governance tools.",
    image: "🔐"
  }
];

export default function OnboardingFlow({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showActions, setShowActions] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowActions(true);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (showActions) {
    return (
      <div className="space-y-8">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-br from-slate-800 via-teal-700 to-slate-900 rounded-3xl p-12 relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize:"40px 40px"}} />
          <div className="relative">
            <div className="text-5xl mb-4">🚀</div>
            <h1 className="text-4xl font-bold text-white mb-3">You're All Set!</h1>
            <p className="text-lg text-slate-200 max-w-xl mx-auto">
              Your DataHarbor account is ready. Start by uploading your first dataset or exploring a demo to get familiar with the platform.
            </p>
          </div>
        </div>

        {/* 3 Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Action 1: Upload Dataset */}
          <Link to={createPageUrl("Datasets")} className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-teal-300 transition-all h-full flex flex-col">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload First Dataset</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Get started immediately by uploading your CSV, Excel, or JSON file and start analyzing your data.
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                Upload Now
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Action 2: Explore Demo */}
          <button
            onClick={onComplete}
            className="block group text-left"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all h-full flex flex-col">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Explore Demo Dataset</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Load a sample dataset to explore DataHarbor's features, insights, and quality analysis tools.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                View Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Action 3: Complete Profile */}
          <Link to={createPageUrl("Profile")} className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-emerald-300 transition-all h-full flex flex-col">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Complete Profile</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Update your profile information and preferences to personalize your DataHarbor experience.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                View Profile
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Start Tips */}
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-8 border border-violet-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Start Tips</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-teal-600 font-bold text-lg mt-0.5">1.</span>
              <span><strong>Upload your data:</strong> Start with CSV, Excel, or JSON formats</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 font-bold text-lg mt-0.5">2.</span>
              <span><strong>Add metadata:</strong> Describe category, department, and owner for better organization</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 font-bold text-lg mt-0.5">3.</span>
              <span><strong>Review insights:</strong> Explore quality scores, data preview, and column profiles</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-600 font-bold text-lg mt-0.5">4.</span>
              <span><strong>Monitor dashboard:</strong> Track all your datasets and quality metrics in one place</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-800 to-slate-900 flex items-center justify-center p-4 z-50">
      {/* Close button */}
      <button
        onClick={() => setShowActions(true)}
        className="fixed top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors z-50"
      >
        <X className="w-5 h-5 text-white/60 hover:text-white" />
      </button>

      {/* Content */}
      <div className="max-w-md w-full">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx <= currentStep
                  ? "bg-teal-400 w-8"
                  : "bg-white/20 w-2"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-6 animate-bounce">{step.image}</div>
          <h2 className="text-4xl font-bold text-white mb-2">{step.title}</h2>
          <p className="text-teal-200 text-sm font-semibold tracking-wide mb-4 uppercase">{step.subtitle}</p>
          <p className="text-lg text-slate-200 leading-relaxed">{step.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowActions(true)}
            className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors"
          >
            {isLastStep ? "Get Started" : "Next"}
          </button>
        </div>

        {/* Step count */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}