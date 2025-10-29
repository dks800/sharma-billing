export interface BillItem {
  unit: string;
  rate: number | string;
  description: string;
  qty: number | string;
  hsnCode: string;
}

export interface SalesBill {
  id: string;
  billDate: string;
  companyId: string;
  companyName: string;
  currency: string;
  billNumber: string;
  financialYear: string;
  paymentStatus: string;
  customerGSTIN: string;
  totalAmount: string;
  roundUp: string;
  dispatchBy: string;
  locationFrom: string;
  locationTo: string;
  ewayBillNo: string;
  ewayBillDate: string;
  totalGST: string;
  externalComments: string;
  internalComments: string;
  customerName: string;
  totalBeforeTax: string;
  taxType: string;
  items: BillItem[];
}

export interface Company {
  id: string;
  lutArn: string;
  establishmentDate: string;
  ieCode: string;
  owner: string;
  bankAccounts: {
    city: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    bankName: string;
  }[];
  gstin: string;
  msme: string;
  website: string;
  contactNumber: string;
  email: string;
  name: string;
  address: string;
}

export interface Client {
  id: string;
  taxType: string;
  address: string;
  poc: string;
  phone: string;
  createdAt: {
    type: string;
    seconds: number;
    nanoseconds: number;
  };
  name: string;
  gstin: string;
  lutArn: string;
  email: string;
}
