import React, { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useOrgConfig } from "@/components/useOrgConfig";

const STATUSES = ["Active", "Archived", "Draft", "Under Review"];
const SENSITIVITIES = ["Public", "Internal", "Confidential", "Restricted"];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={`All ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {options.map(o => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function DatasetFilters({ onFiltersChange, resultCount }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    department: "all",
    status: "all",
    region: "all",
    sensitivity: "all",
  });

  const { categories, departments, regions } = useOrgConfig();

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange?.({ search, ...next });
  };

  const handleSearch = (val) => {
    setSearch(val);
    onFiltersChange?.({ ...filters, search: val });
  };

  const clearAll = () => {
    const reset = { category: "all", department: "all", status: "all", region: "all", sensitivity: "all" };
    setFilters(reset);
    setSearch("");
    onFiltersChange?.({ ...reset, search: "" });
  };

  const activeCount = Object.values(filters).filter(v => v !== "all").length + (search ? 1 : 0);

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search datasets..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0 h-4">{activeCount}</Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute z-10 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-[520px] right-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <FilterSelect label="Category"    value={filters.category}    onChange={v => updateFilter("category", v)}    options={categories} />
              <FilterSelect label="Department"  value={filters.department}  onChange={v => updateFilter("department", v)}  options={departments} />
              <FilterSelect label="Status"      value={filters.status}      onChange={v => updateFilter("status", v)}      options={STATUSES} />
              <FilterSelect label="Region"      value={filters.region}      onChange={v => updateFilter("region", v)}      options={regions} />
              <FilterSelect label="Sensitivity" value={filters.sensitivity} onChange={v => updateFilter("sensitivity", v)} options={SENSITIVITIES} />
            </div>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="mt-3 text-slate-500 h-7" onClick={clearAll}>
                <X className="w-3.5 h-3.5 mr-1" /> Clear all
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active filter pills */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {search && (
            <Badge variant="outline" className="text-xs gap-1">
              "{search}" <X className="w-3 h-3 cursor-pointer" onClick={() => handleSearch("")} />
            </Badge>
          )}
          {Object.entries(filters).filter(([, v]) => v !== "all").map(([k, v]) => (
            <Badge key={k} variant="outline" className="text-xs gap-1 capitalize">
              {k}: {v} <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter(k, "all")} />
            </Badge>
          ))}
        </div>
      )}

      {resultCount !== undefined && (
        <p className="text-xs text-slate-400">{resultCount} dataset{resultCount !== 1 ? "s" : ""} found</p>
      )}
    </div>
  );
}