import { useEffect, useState } from "react";
import { useCompanies } from "./useCompanies";

export function useCompanyById(companyId: string | null) {
  const [company, setCompany] = useState<any>(null);
  const companyList = useCompanies();

  useEffect(() => {
    if (companyList && companyList?.data && companyList?.data.length > 0) {
      const clientData = companyList.data.find((c: any) => c.gstin === companyId);
      setCompany(clientData || null);
    }
  }, [companyList]);
  return { company };
}
