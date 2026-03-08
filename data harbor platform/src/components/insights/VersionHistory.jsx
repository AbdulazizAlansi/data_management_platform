import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Download, Eye, CheckCircle2, Clock, User, FileText, ChevronDown, ChevronUp } from "lucide-react";
import moment from "moment";

export default function VersionHistory({ dataset }) {
  const [expanded, setExpanded] = useState(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["versions", dataset.id],
    queryFn: () => base44.entities.DatasetVersion.filter({ dataset_id: dataset.id }, "-version_number", 50),
    enabled: !!dataset.id,
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-10 text-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-14 text-center">
          <GitBranch className="w-9 h-9 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No version history yet</p>
          <p className="text-xs text-slate-400 mt-1">Upload a new file to create a version. Versions are created automatically from the next upload.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-teal-600" />
          Version History
          <span className="text-slate-400 font-normal">({versions.length} version{versions.length !== 1 ? "s" : ""})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-slate-100" />

          <div className="space-y-3">
            {versions.map((v, i) => {
              const isOpen = expanded === v.id;
              const isLatest = i === 0;
              return (
                <div key={v.id} className="relative flex gap-4">
                  {/* Dot */}
                  <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${
                    isLatest ? "bg-teal-500 border-teal-500" : "bg-white border-slate-200"
                  }`}>
                    {isLatest
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : <span className="text-xs font-bold text-slate-400">v{v.version_number}</span>
                    }
                  </div>

                  {/* Card */}
                  <div className={`flex-1 rounded-xl border transition-colors ${
                    isLatest ? "border-teal-200 bg-teal-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                  }`}>
                    <button
                      className="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
                      onClick={() => setExpanded(isOpen ? null : v.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">Version {v.version_number}</span>
                          {isLatest && (
                            <Badge className="bg-teal-500 text-white text-[10px] px-2 py-0 h-4">Latest</Badge>
                          )}
                          {v.file_type && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-slate-500 border-slate-200">
                              {v.file_type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {moment(v.created_date).fromNow()}
                          </span>
                          {v.uploaded_by_name && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <User className="w-3 h-3" />
                              {v.uploaded_by_name}
                            </span>
                          )}
                          {v.file_name && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <FileText className="w-3 h-3" />
                              {v.file_name}
                            </span>
                          )}
                        </div>
                        {v.changes_summary && !isOpen && (
                          <p className="text-xs text-slate-500 mt-1 truncate">{v.changes_summary}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {v.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 gap-1"
                            onClick={(e) => { e.stopPropagation(); window.open(v.file_url, "_blank"); }}
                          >
                            <Download className="w-3 h-3" /> Download
                          </Button>
                        )}
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />
                        }
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Version", value: `v${v.version_number}` },
                            { label: "Rows", value: v.row_count?.toLocaleString() || "—" },
                            { label: "Columns", value: v.column_count || "—" },
                            { label: "Uploaded", value: moment(v.created_date).format("MMM D, YYYY") },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                              <p className="text-sm font-semibold text-slate-700 mt-0.5">{value}</p>
                            </div>
                          ))}
                        </div>
                        {v.uploaded_by_email && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <User className="w-3.5 h-3.5" />
                            Uploaded by <span className="font-medium text-slate-700">{v.uploaded_by_name || v.uploaded_by_email}</span>
                            <span className="text-slate-400">({v.uploaded_by_email})</span>
                          </div>
                        )}
                        {v.changes_summary && (
                          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            <p className="text-xs font-medium text-amber-700 mb-0.5">Changes Summary</p>
                            <p className="text-xs text-amber-600">{v.changes_summary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}