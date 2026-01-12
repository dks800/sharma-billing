import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";
import {
  formatCurrency,
  formatDate,
  formatFinYear,
} from "../../utils/commonUtils";
import { styles } from "./salesListPdfStyles";

interface SalesBill {
  id: string;
  billDate: string;
  billNumber: string;
  financialYear: string;
  paymentStatus: string;
  customerGSTIN: string;
  totalAmount: string;
  totalGST: string;
  comments: string;
  customerName: string;
  totalBeforeTax: string;
  companyId: string;
  companyName: string;
}

interface Props {
  billList: SalesBill[];
}

const SalesListPDF: React.FC<Props> = ({ billList }) => {
  if (!billList || billList.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>No Bills Available</Text>
        </Page>
      </Document>
    );
  }
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Sales Bill List ({billList?.[0]?.companyName})
        </Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.col, styles.colSr, styles.header]}>Sr</Text>
            <Text style={[styles.col, styles.colBill, styles.header]}>
              Bill No
            </Text>
            <Text style={[styles.col, styles.colDate, styles.header]}>
              Date
            </Text>
            <Text style={[styles.col, styles.colClientName, styles.header]}>
              Client
            </Text>
            <Text style={[styles.col, styles.colNet, styles.header]}>Net</Text>
            <Text style={[styles.col, styles.colGST, styles.header]}>GST</Text>
            <Text style={[styles.col, styles.colTotal, styles.header]}>
              Total
            </Text>
            <Text style={[styles.col, styles.colPayment, styles.header]}>
              Status
            </Text>
            <Text style={[styles.col, styles.colComments, styles.header]}>
              Comments
            </Text>
          </View>
          {billList.map((c, idx) => (
            <View style={styles.row} key={c.id}>
              <Text style={[styles.col, styles.colSr]}>{idx + 1}</Text>
              <Text style={[styles.col, styles.colBill]}>
                {`${c.billNumber} \n`}
                <Text style={styles.finYear}>
                  ({formatFinYear(c.financialYear)})
                </Text>
              </Text>

              <Text style={[styles.col, styles.colDate]}>
                {formatDate(c.billDate) || "-"}
              </Text>
              <Text style={[styles.col, styles.colClientName]}>
                {c.customerName || "-"}
              </Text>
              <Text style={[styles.col, styles.colNet]}>
                {formatCurrency(c.totalBeforeTax)}
              </Text>
              <Text style={[styles.col, styles.colGST]}>
                {formatCurrency(c.totalGST)}
              </Text>
              <Text style={[styles.col, styles.colTotal]}>
                {formatCurrency(c.totalAmount)}
              </Text>
              <Text style={[styles.col, styles.colPayment]}>
                {c.paymentStatus || "-"}
              </Text>
              <Text style={[styles.col, styles.colComments]}>
                {c.comments || "-"}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default SalesListPDF;
