import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

interface Props {
  list: any;
}

const QuotationListPDF: React.FC<Props> = ({ list }) => {
  const styles = StyleSheet.create({
    page: {
      padding: 20,
      fontSize: 8,
      fontFamily: "Helvetica",
    },
    table: {
      width: "100%",
      borderWidth: 0.8,
      borderColor: "#000",
      marginTop: 10,
    },

    row: {
      flexDirection: "row",
      borderBottomWidth: 0.6,
      borderBottomColor: "#000",
      alignItems: "center",
      minHeight: 22,
    },

    headerRow: {
      backgroundColor: "#f2f2f2",
    },

    col: {
      paddingVertical: 2,
      paddingHorizontal: 2,
      fontSize: 9,
      borderRightWidth: 0.6,
      borderRightColor: "#000",
    },

    header: {
      fontSize: 9.5,
      fontWeight: "bold",
      textAlign: "center",
    },
    fileHeader: {
      fontSize: 16,
      marginBottom: 10,
      textAlign: "center",
      fontWeight: "bold",
    },

    center: { textAlign: "center" },
    right: { textAlign: "right" },

    sr: { width: "4%" },
    quoteNum: { width: "8%" },
    date: { width: "8%" },
    customer: { width: "19%" },
    title: { width: "25%" },
    net: { width: "12%" },
    gst: { width: "12%" },
    total: { width: "12%", borderRightWidth: 0 }, // last column
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.fileHeader}>
          Quotation List ({list?.[0]?.companyName})
        </Text>
        <View style={styles.table}>
          {/* Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.col, styles.sr, styles.header]}>#</Text>
            <Text style={[styles.col, styles.quoteNum, styles.header]}>
              Quote#
            </Text>
            <Text style={[styles.col, styles.date, styles.header]}>Date</Text>
            <Text style={[styles.col, styles.customer, styles.header]}>
              Customer Name
            </Text>
            <Text style={[styles.col, styles.title, styles.header]}>Title</Text>
            <Text style={[styles.col, styles.net, styles.header]}>Net</Text>
            <Text style={[styles.col, styles.gst, styles.header]}>GST</Text>
            <Text style={[styles.col, styles.total, styles.header]}>Total</Text>
          </View>

          {/* Rows */}
          {list.map((c: any, idx: number) => (
            <View style={styles.row} key={idx}>
              <Text style={[styles.col, styles.sr, styles.center]}>
                {idx + 1}
              </Text>
              <Text style={[styles.col, styles.quoteNum, styles.center]}>
                {c.quoteNumber || "-"}
              </Text>
              <Text style={[styles.col, styles.date, styles.center]}>
                {c.date || "-"}
              </Text>
              <Text style={[styles.col, styles.customer]}>
                {c.customerName || "-"}
              </Text>
              <Text style={[styles.col, styles.title]}>{c.title || "-"}</Text>
              <Text style={[styles.col, styles.net, styles.right]}>
                {c.totalBeforeTax}
              </Text>
              <Text style={[styles.col, styles.gst, styles.right]}>
                {c.totalGST}
              </Text>
              <Text style={[styles.col, styles.total, styles.right]}>
                {c.totalAmount}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default QuotationListPDF;
