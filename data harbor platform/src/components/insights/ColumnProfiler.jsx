import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Columns3, ChevronDown, ChevronUp } from "lucide-react";

const TYPE_COLORS = {
  number: "bg-blue-50 text-blue-700",
  date: "bg-violet-50 text-violet-700",
  string: "bg-slate-100 text-slate-600",
};

export default function ColumnProfiler({ dataset, quality }) {
  const [expanded, setExpanded] = useState(null);
  const columns = dataset.columns_info || [];

  if (columns.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-12 text-center">
          <Columns3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No column metadata available. Upload a CSV or Excel file to generate column profiles.</p>
        </CardContent>
      </Card>
    );
  }

  const colQualityMap = {};
  (quality?.column_quality || []).forEach(c => { colQualityMap[c.column_name] = c; });

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Columns3 className="w-4 h-4 text-teal-600" />
          Column Profiles <span className="text-slate-400 font-normal">({columns.length} columns)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {columns.map((col, i) => {
            const cq = colQualityMap[col.name];
            const completeness = cq?.completeness ?? 100;
            const isOpen = expanded === i;
            return (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden hover:border-teal-200 transition-colors">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/80 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <span className="w-6 h-6 rounded bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-mono flex-shrink-0">{i + 1}</span>
                  <span className="font-medium text-sm text-slate-800 flex-1 truncate">{col.name}</span>
                  <Badge variant="outline" className={`text-xs ${TYPE_COLORS[col.type] || TYPE_COLORS.string}`}>{col.type}</Badge>
                  <div className="flex items-center gap-2 ml-2 min-w-[80px]">
                    <Progress value={completeness} className="h-1.5 w-14" />
                    <span className="text-xs text-slate-500 whitespace-nowrap">{completeness}%</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">Sample Values</p>
                        <div className="flex flex-wrap gap-1.5">
                          {col.sample_values?.length > 0
                            ? col.sample_values.map((v, j) => (
                                <span key={j} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-700 font-mono">{String(v)}</span>
                              ))
                            : <span className="text-xs text-slate-400">No samples</span>
                          }
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500">Statistics</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Completeness</span>
                          <span className="font-medium text-slate-700">{completeness}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Data Type</span>
                          <span className="font-medium text-slate-700 capitalize">{col.type}</span>
                        </div>
                        {cq?.issues?.length > 0 && (
                          <div>
                            <p className="text-xs text-red-500 mt-1">Issues: {cq.issues.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}