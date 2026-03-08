import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  departments: ["Finance", "Marketing", "Engineering", "HR", "Sales", "Operations", "Legal", "Research", "Executive", "IT"],
  categories:  ["Transactional", "Analytical", "Master Data", "Reference Data", "Operational", "Customer Data", "Financial Data", "Product Data", "Behavioral", "Other"],
  tags:        ["quarterly", "annual", "kpi", "raw", "processed", "external", "internal"],
  regions:     ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa", "Global"],
};

export function useOrgConfig() {
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["org-config"],
    queryFn: () => base44.entities.OrgConfig.list(),
    staleTime: 60_000,
  });

  const get = (type) => {
    const found = configs.find(c => c.config_type === type);
    return found?.values?.length ? found.values : DEFAULTS[type];
  };

  return {
    isLoading,
    departments: get("departments"),
    categories:  get("categories"),
    tags:        get("tags"),
    regions:     get("regions"),
    configs,
  };
}