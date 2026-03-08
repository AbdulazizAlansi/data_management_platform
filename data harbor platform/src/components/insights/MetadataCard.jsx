import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users } from "lucide-react";
import moment from "moment";

export default function MetadataCard({ dataset }) {
  const infoFields = [
    ["Category", dataset.category],
    ["Department", dataset.department],
    ["Source", dataset.source],
    ["Region", dataset.region],
    ["Language", dataset.language],
    ["File Type", dataset.file_type],
    ["Update Frequency", dataset.update_frequency],
    ["Data Sensitivity", dataset.data_sensitivity],
    ["Created", moment(dataset.created_date).format("MMM D, YYYY")],
    ["Last Updated", moment(dataset.updated_date).format("MMM D, YYYY")],
  ].filter(([, v]) => v);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600" /> Dataset Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="space-y-2.5">
            {infoFields.map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd className="text-xs font-medium text-slate-800 text-right max-w-[180px] truncate">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> Ownership
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-0.5">Data Owner</p>
            <p className="text-sm font-semibold text-slate-800">{dataset.owner || "Not assigned"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-0.5">Business Owner</p>
            <p className="text-sm font-semibold text-slate-800">{dataset.business_owner || "Not assigned"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-0.5">Technical Owner</p>
            <p className="text-sm font-semibold text-slate-800">{dataset.technical_owner || "Not assigned"}</p>
          </div>
          {dataset.format && (
            <div className="p-3 bg-teal-50 rounded-xl">
              <p className="text-xs text-teal-600 mb-0.5">Format / Filename</p>
              <p className="text-sm font-mono text-teal-800 truncate">{dataset.format}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}