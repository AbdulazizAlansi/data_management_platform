import React from "react";
import { Bug } from "lucide-react";
import moment from "moment";

export default function QualityDebugBadge({ q, dataset }) {
  return (
    <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs space-y-1">
      <p className="font-semibold text-amber-800 flex items-center gap-1">
        <Bug className="w-3.5 h-3.5" /> Debug Info
      </p>
      <p className="text-amber-700">File: <span className="font-mono font-semibold">{dataset?.format || "unknown"}</span></p>
      <p className="text-amber-700">Rows detected: <span className="font-semibold">{q.row_count ?? dataset?.row_count ?? "—"}</span></p>
      <p className="text-amber-700">Columns detected: <span className="font-semibold">{q.column_count ?? dataset?.column_count ?? "—"}</span></p>
      <p className="text-amber-700">Analysis saved: <span className="font-semibold">{moment(q.updated_date || q.created_date).format("MMM D, YYYY h:mm:ss A")}</span></p>
      <p className="text-amber-700">Quality record ID: <span className="font-mono text-[10px]">{q.id}</span></p>
    </div>
  );
}