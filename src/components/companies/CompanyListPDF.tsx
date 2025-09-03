import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  table: {
    width: "auto",
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
  },
  col: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 9,
  },
  header: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
  },
  colSr: {
    width: 30,
    textAlign: "center",
  },
  colName: {
    flex: 1,
  },
  colEmail: {
    flex: 1.2,
  },
  colPhone: {
    width: 80,
    textAlign: "center",
  },
  colAddress: {
    flex: 2,
  },
});

interface Company {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  gstin: string;
}

interface Props {
  companies: Company[];
}

const CompanyListPDF: React.FC<Props> = ({ companies }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Company List</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.col, styles.colSr, styles.header]}>Sr</Text>
          <Text style={[styles.col, styles.colName, styles.header]}>Name</Text>
          <Text style={[styles.col, styles.colEmail, styles.header]}>Email</Text>
          <Text style={[styles.col, styles.colPhone, styles.header]}>Phone</Text>
          <Text style={[styles.col, styles.colAddress, styles.header]}>Address</Text>
        </View>
        {companies.map((c, idx) => (
          <View style={styles.row} key={c.id}>
            <Text style={[styles.col, styles.colSr]}>{idx + 1}</Text>
            <Text style={[styles.col, styles.colName]}>{`${c.name}\n(${c.gstin})`}</Text>
            <Text style={[styles.col, styles.colEmail]}>{c.email}</Text>
            <Text style={[styles.col, styles.colPhone]}>{c.contactNumber}</Text>
            <Text style={[styles.col, styles.colAddress]}>{c.address}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default CompanyListPDF;
