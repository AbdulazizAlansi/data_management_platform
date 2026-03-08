// Free tier usage limits for DataHarbor
export const FREE_TIER_LIMITS = {
  MAX_DATASETS: 20,
  MAX_FILE_SIZE_MB: 100, // 100 MB per file
  MAX_STORAGE_MB: 1000, // 1 GB total storage
  MAX_ROWS_PER_DATASET: 1000000, // 1 million rows
  MAX_MONTHLY_UPLOADS: 50,
};

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function checkFileSize(fileSizeBytes) {
  const maxSizeBytes = FREE_TIER_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024;
  if (fileSizeBytes > maxSizeBytes) {
    return {
      valid: false,
      message: `File size exceeds ${FREE_TIER_LIMITS.MAX_FILE_SIZE_MB}MB limit. Your file is ${formatFileSize(fileSizeBytes)}.`,
    };
  }
  return { valid: true };
}

export function checkDatasetLimit(currentDatasetCount) {
  if (currentDatasetCount >= FREE_TIER_LIMITS.MAX_DATASETS) {
    return {
      valid: false,
      message: `You have reached the maximum of ${FREE_TIER_LIMITS.MAX_DATASETS} datasets on the free tier.`,
    };
  }
  return { valid: true };
}

// Original PageNotFound component
import React from "react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}