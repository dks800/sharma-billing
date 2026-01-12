import { Item } from "./EditSalesBillForm";

export const getFormChanges = (
  bill: any,
  billNumber: string,
  billDate: string,
  paymentStatus: string,
  ewayBillNo: string,
  ewayBillDateTime: string,
  locationFrom: string,
  locationTo: string,
  dispatchBy: string,
  internalComments: string,
  externalComments: string,
  taxType: string,
  selectedCustomer: any,
  items: any
) => {
  if (!bill) return [];
  const changes: { field: string; before: any; after: any }[] = [];

  const fieldMap: Record<string, string> = {
    billNumber: "Bill Number",
    billDate: "Bill Date",
    paymentStatus: "Payment Status",
    ewayBillNo: "Eway Bill No.",
    ewayBillDateTime: "Eway Bill Date & Time",
    internalComments: "Internal Comments",
    externalComments: "External Comments",
    taxType: "Tax Type",
    customerName: "Customer",
    customerGSTIN: "Customer GSTIN",
    dispatchBy: "Dispatch By",
    locationFrom: "Location From",
    locationTo: "Location To",
  };

  if (bill.billNumber !== billNumber)
    changes.push({
      field: fieldMap.billNumber,
      before: bill.billNumber,
      after: billNumber,
    });
  if (bill.billDate?.substring(0, 10) !== billDate)
    changes.push({
      field: fieldMap.billDate,
      before: bill.billDate,
      after: billDate,
    });
  if (bill.paymentStatus !== paymentStatus)
    changes.push({
      field: fieldMap.paymentStatus,
      before: bill.paymentStatus,
      after: paymentStatus,
    });
  if (bill.internalComments !== internalComments)
    changes.push({
      field: fieldMap.internalComments,
      before: bill.internalComments,
      after: internalComments,
    });
  if (bill.externalComments !== externalComments)
    changes.push({
      field: fieldMap.externalComments,
      before: bill.externalComments,
      after: externalComments,
    });
  if (bill.taxType !== taxType)
    changes.push({
      field: fieldMap.taxType,
      before: bill.taxType,
      after: taxType,
    });
  if (bill.customerName !== selectedCustomer?.name)
    changes.push({
      field: fieldMap.customerName,
      before: bill.customerName,
      after: selectedCustomer?.name,
    });
  if (bill.customerGSTIN !== selectedCustomer?.gstin)
    changes.push({
      field: fieldMap.customerGSTIN,
      before: bill.customerGSTIN,
      after: selectedCustomer?.gstin,
    });

  if (bill?.ewayBillNo !== ewayBillNo)
    changes.push({
      field: fieldMap.ewayBillNo,
      before: bill.ewayBillNo,
      after: ewayBillNo,
    });

  if (bill?.ewayBillDateTime !== ewayBillDateTime)
    changes.push({
      field: fieldMap.ewayBillDateTime,
      before: bill.ewayBillDateTime,
      after: ewayBillDateTime,
    });

  if (bill?.locationFrom !== locationFrom)
    changes.push({
      field: fieldMap.locationFrom,
      before: bill.locationFrom,
      after: locationFrom,
    });
  if (bill?.locationTo !== locationTo)
    changes.push({
      field: fieldMap.locationTo,
      before: bill.locationTo,
      after: locationTo,
    });
  if (bill?.dispatchBy !== dispatchBy)
    changes.push({
      field: fieldMap.dispatchBy,
      before: bill.dispatchBy,
      after: dispatchBy,
    });

  items.forEach((item: any, idx: number) => {
    const orig = bill.items[idx] || {};
    (
      ["description", "hsnCode", "qty", "unit", "rate"] as (keyof Item)[]
    ).forEach((key) => {
      if (item[key] !== orig[key]) {
        changes.push({
          field: `Item ${idx + 1} → ${key}`,
          before: orig[key],
          after: item[key],
        });
      }
    });
  });

  return changes;
};

type Change = {
  field: string;
  before: any;
  after: any;
};

type ItemChange = {
  field: string;
  before: string;
  after: string;
};

export const getItemChanges = (
  originalItems: any[] = [],
  currentItems: any[] = []
): ItemChange[] => {
  const changes: ItemChange[] = [];

  const originalMap = new Map(originalItems.map((i) => [i.id, i]));

  const currentMap = new Map(currentItems.map((i) => [i.id, i]));

  // ➕ Added items
  currentItems.forEach((item) => {
    if (!originalMap.has(item.id)) {
      changes.push({
        field: "Item Added",
        before: "-",
        after: item.description || "New Item",
      });
    }
  });

  // ➖ Removed items
  originalItems.forEach((item) => {
    if (!currentMap.has(item.id)) {
      changes.push({
        field: "Item Removed",
        before: item.description,
        after: "-",
      });
    }
  });

  // ✏️ Modified items
  currentItems.forEach((item, index) => {
    const original = originalMap.get(item.id);
    if (!original) return;

    const compare = (label: string, a: any, b: any) => {
      if (a !== b) {
        changes.push({
          field: `${label}`,
          before: String(a ?? "-"),
          after: String(b ?? "-"),
        });
      }
    };

    compare(`Description(${index+1})`, original.description, item.description);
    compare(`Qty(${index+1})`, original.qty, item.qty);
    compare(`Rate(${index+1})`, original.rate, item.rate);
    compare(`Unit(${index+1})`, original.unit, item.unit);
    compare(`HSN(${index+1})`, original.hsnCode, item.hsnCode);
  });

  return changes;
};

export const getQuotationChanges = (original: any, current: any): Change[] => {
  const changes: Change[] = [];

  const compare = (label: string, a: any, b: any) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changes.push({
        field: label,
        before: a ?? "-",
        after: b ?? "-",
      });
    }
  };

  compare("Quote Number", original.quoteNumber, current.quoteNumber);
  compare("Quote Date", original.quoteDate, current.quoteDate);
  compare("Tax Type", original.taxType, current.taxType);
  compare("Currency", original.currency, current.currency);
  compare("Customer", original.customerGSTIN, current.customerGSTIN);
  compare("Quote Title", original.title, current.title);
  compare("Quote Sub Title", original.subTitle, current.subTitle);
  compare("Delivery Terms", original.delivery, current.delivery);
  compare("Payment Terms", original.paymentTerms, current.paymentTerms);
  compare("Freight", original.freight, current.freight);
  compare("Validity", original.validity, current.validity);

  // Items (important)
  if (JSON.stringify(original.items) !== JSON.stringify(current.items)) {
    const itemChanges = getItemChanges(original.items, current.items);
console.log("itemChanges --->", itemChanges)
    itemChanges.forEach((c) => changes.push(c));

    // changes.push({
    //   field: "Items",
    //   before: `${original.items?.length || 0} items`,
    //   after: `${current.items?.length || 0} items`,
    // });
  }

  return changes;
};
