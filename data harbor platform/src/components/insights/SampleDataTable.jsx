import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableIcon } from "lucide-react";

export default function SampleDataTable({ dataset }) {
  const rows = dataset.sample_rows || [];
  const [showAll, setShowAll] = useState(false);

  if (rows.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-12 text-center">
          <TableIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No sample data available. Upload a CSV or Excel file to preview rows.</p>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(rows[0]);
  const displayRows = showAll ? rows : rows.slice(0, 5);

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-teal-600" />
            Sample Data <span className="text-slate-400 font-normal">(first {rows.length} rows)</span>
          </CardTitle>
          {rows.length > 5 && (
            <button
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              onClick={() => setShowAll(p => !p)}
            >
              {showAll ? "Show less" : `Show all ${rows.length}`}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs text-slate-400 w-10">#</TableHead>
                {headers.map(h => (
                  <TableHead key={h} className="text-xs font-semibold text-slate-700 whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50">
                  <TableCell className="text-xs text-slate-400 font-mono">{i + 1}</TableCell>
                  {headers.map(h => (
                    <TableCell key={h} className="text-xs text-slate-600 whitespace-nowrap max-w-[200px] truncate font-mono">
                      {row[h] === "" || row[h] === null || row[h] === undefined
                        ? <span className="text-slate-300 italic">null</span>
                        : String(row[h])
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}