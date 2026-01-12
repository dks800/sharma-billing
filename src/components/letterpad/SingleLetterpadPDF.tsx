import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatDate } from "../../utils/commonUtils";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },

  /* ---------- HEADER ---------- */
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 8,
    marginBottom: 15,
    textAlign: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
  },

  /* ---------- META ---------- */
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaText: {
    fontSize: 10,
  },

  /* ---------- CONTENT ---------- */
  toSection: {
    marginBottom: 8,
  },
  subject: {
    marginVertical: 8,
    fontSize: 11,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  body: {
    textAlign: "justify",
    whiteSpace: "pre-line",
  },

  /* ---------- SIGNATURE ---------- */
  signatureBlock: {
    marginTop: 20,
  },
  signText: {
    fontSize: 11,
  },
  signName: {
    marginTop: 15,
    fontWeight: "bold",
  },

  /* ---------- FOOTER ---------- */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    fontSize: 9,
    textAlign: "center",
  },
});

export default function SingleLetterpadPDF({
  letter,
  company,
  companyWatermarkNode,
  companyLogoNode,
  companyStampNode,
}: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {companyWatermarkNode}
        {/* Header */}
        <View style={styles.header}>
          <View style={{ margin: "auto", marginBottom: 4 }}>
            {companyLogoNode}
          </View>
          <Text style={styles.companyName}>
            {company?.name || "Company Name"}
          </Text>
          <Text style={styles.companyDetails}>
            {company?.address || "Company Address"}
          </Text>
          <Text style={styles.companyDetails}>
            <Text style={{ fontWeight: "bold" }}>Phone: </Text>
            {company?.contactNumber || "-"} |{" "}
            <Text style={{ fontWeight: "bold" }}>Email: </Text>
            {company?.email || "-"}
          </Text>
          <Text style={styles.companyDetails}>
            {company?.manufacturerDetails || "Manufacturer Details"}
          </Text>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            <Text style={{ fontWeight: "bold" }}>Letter No:</Text>{" "}
            {letter.letterNumber}
          </Text>
          <Text style={styles.metaText}>
            <Text style={{ fontWeight: "bold" }}>Date:</Text>{" "}
            {formatDate(letter.letterDate)}
          </Text>
        </View>

        {/* To */}
        <View style={styles.toSection}>
          <Text>To,</Text>
          <Text>{letter.to}</Text>
          <Text>{letter.toLine1}</Text>
          <Text>{letter.toLine2}</Text>
        </View>

        {/* Subject */}
        <Text style={styles.subject}>Subject: {letter.subject}</Text>

        {/* Body */}
        <Text style={styles.body}>{letter.body}</Text>

        {/* Signature */}
        <View style={styles.signatureBlock}>
          <Text style={styles.signText}>Thanking you,</Text>
          <Text style={styles.signText}>Yours sincerely,</Text>

          <Text style={styles.signName}>For {company?.name}</Text>
          {companyStampNode}
          <Text style={styles.signText}>
            {company?.owner || "Authorized Signatory"}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is a system generated letter and does not require physical
            signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
