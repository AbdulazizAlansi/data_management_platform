import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Tag, Globe, LayoutGrid, Plus, X, Save, Shield, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/components/LanguageContext";

const DEFAULTS = {
  departments: ["Finance", "Marketing", "Engineering", "HR", "Sales", "Operations", "Legal", "Research", "Executive", "IT"],
  categories:  ["Transactional", "Analytical", "Master Data", "Reference Data", "Operational", "Customer Data", "Financial Data", "Product Data", "Behavioral", "Other"],
  tags:        ["quarterly", "annual", "kpi", "raw", "processed", "external", "internal"],
  regions:     ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa", "Global"],
};

const CONFIG_DEFS = (t) => [
  { type: "departments", label: t["Departments"] || "Departments",             icon: Building2,  color: "teal",   desc: t["Organizational units that own datasets"] || "Organizational units that own datasets" },
  { type: "categories",  label: t["Dataset Categories"] || "Dataset Categories", icon: LayoutGrid, color: "violet", desc: t["Business categories for classifying datasets"] || "Business categories for classifying datasets" },
  { type: "tags",        label: t["Tags"] || "Tags",                           icon: Tag,        color: "amber",  desc: t["Labels for tagging and filtering datasets"] || "Labels for tagging and filtering datasets" },
  { type: "regions",     label: t["Regions"] || "Regions",                     icon: Globe,      color: "sky",    desc: t["Geographic regions for datasets"] || "Geographic regions for datasets" },
];

const COLOR_MAP = {
  teal:   { bg: "bg-teal-50",   icon: "text-teal-600",   badge: "bg-teal-50 text-teal-700 border-teal-200",   btn: "bg-teal-600 hover:bg-teal-700" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-200", btn: "bg-violet-600 hover:bg-violet-700" },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  badge: "bg-amber-50 text-amber-700 border-amber-200",  btn: "bg-amber-600 hover:bg-amber-700" },
  sky:    { bg: "bg-sky-50",    icon: "text-sky-600",    badge: "bg-sky-50 text-sky-700 border-sky-200",        btn: "bg-sky-600 hover:bg-sky-700" },
};

function ConfigSection({ def, configs, onSave, t }) {
  const existing = configs.find(c => c.config_type === def.type);
  const [values, setValues] = useState(existing?.values || DEFAULTS[def.type]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const colors = COLOR_MAP[def.color];
  const Icon = def.icon;

  useEffect(() => {
    const found = configs.find(c => c.config_type === def.type);
    setValues(found?.values?.length ? found.values : DEFAULTS[def.type]);
  }, [configs, def.type]);

  const addValue = () => {
    const v = input.trim();
    if (!v || values.includes(v)) return;
    setValues(prev => [...prev, v]);
    setInput("");
  };

  const removeValue = (val) => setValues(prev => prev.filter(x => x !== val));

  const handleReset = () => setValues(DEFAULTS[def.type]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(def.type, values, existing?.id);
    setSaving(false);
  };

  const isDirty = JSON.stringify(values) !== JSON.stringify(existing?.values || DEFAULTS[def.type]);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <Icon className={`w-4.5 h-4.5 ${colors.icon}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">{def.label}</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{def.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 h-7 px-2">
              <RefreshCw className="w-3 h-3 mr-1" /> {t["Reset"] || "Reset"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !isDirty} className={`h-7 px-3 text-xs text-white ${colors.btn} disabled:opacity-40`}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
              {t["Save"] || "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new value */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addValue()}
            placeholder={t["Add new value"] || `Add new ${def.label.toLowerCase().replace(/s$/, "")}...`}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={addValue} disabled={!input.trim()} className="h-8 px-3 bg-slate-800 hover:bg-slate-700">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Values */}
        <div className="flex flex-wrap gap-1.5 min-h-[40px]">
          {values.map(val => (
            <span
              key={val}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.badge}`}
            >
              {val}
              <button onClick={() => removeValue(val)} className="ml-0.5 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {values.length === 0 && (
            <p className="text-xs text-slate-400 italic">{t["No values configured"] || "No values — add some above"}</p>
          )}
        </div>

        <p className="text-[11px] text-slate-400">{values.length} {t["values configured"] || (values.length !== 1 ? "values configured" : "value configured")}</p>
      </CardContent>
    </Card>
  );
}

export default function OrgSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  const { t } = useLang();

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["org-config"],
    queryFn: () => base44.entities.OrgConfig.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ type, values, existingId }) => {
      if (existingId) {
        return base44.entities.OrgConfig.update(existingId, { values });
      } else {
        return base44.entities.OrgConfig.create({ config_type: type, values });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["org-config"] }),
  });

  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t["Access Restricted"] || "Access Restricted"}</h2>
        <p className="text-sm text-slate-500 mt-2">{t["Admin privileges are required to manage organization settings."] || "Admin privileges are required to manage organization settings."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t["Organization Settings"] || "Organization Settings"}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t["Configure departments, categories, tags, and regions used across the platform"] || "Configure departments, categories, tags, and regions used across the platform"}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONFIG_DEFS(t).map(def => (
            <ConfigSection
              key={def.type}
              def={def}
              configs={configs}
              t={t}
              onSave={(type, values, existingId) =>
                saveMutation.mutateAsync({ type, values, existingId })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}