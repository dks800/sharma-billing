import { useMemo } from "react";
import { useCompanies } from "./useCompanies";

export function useCompanyById(companyId: string | null) {
  const companyList = useCompanies();

  const company = useMemo(() => {
    if (!companyId || !companyList?.data?.length) return {};

    return (
      companyList.data.find(
        (c: any) =>
          c.gstin === companyId || c.id === companyId || c.companyId === companyId,
      ) || {}
    );
  }, [companyId, companyList?.data]);

  return { company };
}
