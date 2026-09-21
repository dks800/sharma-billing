import { useMemo } from "react";
import { useClients } from "./useClients";

export function useClientById(clientId: string | null) {
  const clientList = useClients();

  const client = useMemo(() => {
    if (!clientId || !clientList?.data?.length) return {};

    return (
      clientList.data.find(
        (c: any) =>
          c.gstin === clientId || c.id === clientId || c.customerGSTIN === clientId,
      ) || {}
    );
  }, [clientId, clientList?.data]);

  return { client };
}
