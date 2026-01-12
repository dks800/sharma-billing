import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "../../utils/commonUtils";
import { styles } from "./salesListPdfStyles";

interface PurchaseBill {
  id: string;
  billDate: string;
  billNumber: string;
  financialYear: string;
  paymentStatus: string;
  customerGSTIN: string;
  supplierName: string;
  totalAmount: string;
  totalGST: string;
  comments: string;
  customerName: string;
  totalBeforeTax: string;
  companyId: string;
}

interface Props {
  billList?: PurchaseBill[]; // optional prop
  companyName?: string;
}

const PurchaseListPDF: React.FC<Props> = ({
  billList = [],
  companyName = "",
}) => {
  if (!billList || !Array.isArray(billList) || billList.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>No Bills Available</Text>
        </Page>
      </Document>
    );
  }
  const safeBills = Array.isArray(billList) ? billList : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Purchase Bill List {companyName ? `(${companyName})` : ""}
        </Text>

        {safeBills.length === 0 ? (
          <View style={{ marginTop: 30, textAlign: "center" }}>
            <Text>No purchase bills available.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.row}>
              <Text style={[styles.col, styles.colSr, styles.header]}>Sr</Text>
              <Text style={[styles.col, styles.colBill, styles.header]}>
                Bill No
              </Text>
              <Text style={[styles.col, styles.colDate, styles.header]}>
                Date
              </Text>
              <Text style={[styles.col, styles.colSupplierName, styles.header]}>
                Supplier Name
              </Text>
              <Text style={[styles.col, styles.colNet, styles.header]}>
                Net
              </Text>
              <Text style={[styles.col, styles.colGST, styles.header]}>
                GST
              </Text>
              <Text style={[styles.col, styles.colTotal, styles.header]}>
                Total
              </Text>
              <Text style={[styles.col, styles.colPayment, styles.header]}>
                Payment
              </Text>
              <Text style={[styles.col, styles.colComments, styles.header]}>
                Comments
              </Text>
            </View>

            {/* Bill Rows */}
            {safeBills.map((c, idx) => {
              const billDate = c?.billDate ? formatDate(c.billDate) : "-";
              const totalAmount = Number(c?.totalAmount || 0);
              const totalGST = Number(c?.totalGST || 0);
              const net = totalAmount - totalGST;

              return (
                <View style={styles.row} key={c.id || idx}>
                  <Text style={[styles.col, styles.colSr]}>{idx + 1}</Text>
                  <Text style={[styles.col, styles.colBill]}>
                    {c?.billNumber || "-"}
                  </Text>
                  <Text style={[styles.col, styles.colDate]}>{billDate}</Text>
                  <Text style={[styles.col, styles.colSupplierName]}>
                    {c?.supplierName || "-"}
                  </Text>
                  <Text style={[styles.col, styles.colNet]}>
                    {formatCurrency(net)}
                  </Text>
                  <Text style={[styles.col, styles.colGST]}>
                    {formatCurrency(totalGST)}
                  </Text>
                  <Text style={[styles.col, styles.colTotal]}>
                    {formatCurrency(totalAmount)}
                  </Text>
                  <Text style={[styles.col, styles.colPayment]}>
                    {c?.paymentStatus || "-"}
                  </Text>
                  <Text style={[styles.col, styles.colComments]}>
                    {c?.comments || "-"}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PurchaseListPDF;
