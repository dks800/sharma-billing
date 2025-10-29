import { useEffect, useState } from "react";
import { useClients } from "./useClients";

export function useClientById(clientId: string | null) {
  const [client, setClient] = useState<any>(null);
  const clientList = useClients();
  useEffect(() => {
    if (clientList && clientList?.data && clientList?.data.length > 0) {
      const clientData = clientList.data.find((c: any) => c.gstin === clientId);
      setClient(clientData || null);
    }
  }, [clientList]);
  return { client };
}
