import React from "react";
import { Text, View, Document, Image, StyleSheet } from "@react-pdf/renderer";
import anb from "../../images/anb.png";
import min from "../../images/min.png";
import sb from "../../images/sb.png";
import sj from "../../images/sj.png";
import PageOneSQ from "./PageOneSQ";
import PageTwoSQ from "./PageTwoSQ";
import PageThreeSQ from "./PageThreeSQ";
import PageFourSQ from "./PageFourSQ";
import { getCompanyWatermark } from "../../utils/commonUtils";

interface Props {
  data: any;
  calculateGst?: boolean;
}

const SingleQuotationPDF: React.FC<Props> = ({ data, calculateGst = true }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Document>
        <Text>No Bill Data Available</Text>
      </Document>
    );
  }

  const { selectedCompany, selectedClient, billData } = data;

  const brandColor =
    billData?.companyId === "24BFYPS0683D1Z1"
      ? "#D62B26" // dev
      : billData?.companyId === "24AWKPS0186R1ZQ"
      ? "#0033CC" // hqt
      : billData?.companyId === "24HXBPS0898M1ZP"
      ? "#597515" // ssb
      : "#000000"; // default black

  // ✅ PDF Styles
  const styles = StyleSheet.create({
    brandColor: { color: brandColor },
    page: {
      fontFamily: "Helvetica",
      fontSize: 11,
      padding: 25,
      color: "#000",
      lineHeight: 1.4,
      position: "relative",
    },
    pageBox: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: "#000",
      padding: 20,
    },
    header: {
      borderBottom: "0.6pt solid #999",
      paddingBottom: 4,
      marginBottom: 8,
    },
    topRow: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    logo: {
      width: 60,
    },
    companyName: {
      fontSize: 20,
      color: brandColor,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "left",
    },
    contactText: {
      textAlign: "center",
      fontSize: 10,
      color: "#333",
    },
    page1Row2: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 15,
      fontSize: 12,
    },
    section: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },
    line: {
      borderBottom: "0.6pt solid #ccc",
      marginVertical: 6,
    },
    bold: {
      fontWeight: "bold",
    },
    label: {
      fontWeight: "bold",
      color: "#333",
    },
    rightInfo: {
      display: "flex",
      gap: 10,
    },
    titleSection: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      textAlign: "center",
      marginTop: 100,
      marginBottom: 100,
    },
    quotationFor: {
      fontSize: 14,
      fontWeight: "bold",
    },
    subText: {
      fontSize: 10,
      color: "#777",
      marginTop: 4,
      fontStyle: "italic",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 10,
    },
    footer: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 9,
      lineHeight: 1.5,
    },
    parentFirm: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      textAlign: "center",
      marginTop: 15,
    },
    page1Footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      paddingVertical: 6,
      paddingHorizontal: 15,
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerImageSection: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      width: "100%",
      marginTop: 4,
    },
    footerImage: {
      width: 35,
      height: 35,
      objectFit: "contain",
    },
    table: {
      width: "100%",
      marginTop: 10,
      borderStyle: "solid",
      borderWidth: 0.6,
      borderColor: "#000",
    },

    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.6,
      borderColor: "#000",
      alignItems: "stretch",
    },

    tableHeader: {
      backgroundColor: "#f0f0f0",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 10,
    },

    tableCell: {
      padding: 4,
      fontSize: 10,
      borderColor: "#000",
      borderStyle: "solid",
      borderWidth: 0.6,
    },

    colSr: { width: "8%", textAlign: "center" },
    colDesc: { width: "52%" },
    colQty: { width: "10%", textAlign: "center" },
    colUnit: { width: "10%" },
    colRate: { width: "15%", textAlign: "center" },
    colAmount: { width: "15%", textAlign: "center", borderRightWidth: 0 },
    specText: { fontStyle: "italic", color: "gray" },
    noVerticalPadding: { paddingVertical: 0 },
    specCell: {
      fontStyle: "italic",
      color: "gray",
      paddingVertical: 0,
      paddingTop: 2,
    },

    specDescPadding: { paddingLeft: 10 },
    colCategory: {
      width: 90,
    },
    colDescription: {
      flex: 1,
      borderRightWidth: 0,
    },
  });

  const quotationNumberPageHeaderNode = (
    <Text
      style={{
        position: "absolute",
        top: 6,
        right: 25,
        opacity: 0.3,
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: 15,
      }}
    >
      #{billData?.quoteNumber}
    </Text>
  );

  const companyWatermarkNode = (
    <Image
      src={getCompanyWatermark(billData?.companyId || "")}
      style={{
        position: "absolute",
        top: "35%",
        left: "20%",
        width: "60%",
        opacity: 0.06,
      }}
    />
  );

  const footerImageSectionNode = (
    <View style={styles.footerImageSection}>
      <Image src={anb} style={styles.footerImage} />
      <Image src={min} style={styles.footerImage} />
      <Image src={sb} style={styles.footerImage} />
      <Image src={sj} style={styles.footerImage} />
    </View>
  );

  const renderClientList = () => {
    if (!billData || billData?.companyId !== "24AWKPS0186R1ZQ") return null;
    return (
      <PageFourSQ
        styles={styles}
        renderQuotationNumberPageHeader={quotationNumberPageHeaderNode}
        renderCompanyWatermark={companyWatermarkNode}
        renderFooterImageSection={footerImageSectionNode}
      />
    );
  };

  return (
    <Document>
      <PageOneSQ
        styles={styles}
        bill={billData}
        selectedCompany={selectedCompany}
        selectedClient={selectedClient}
        renderCompanyWatermark={companyWatermarkNode}
        renderFooterImageSection={footerImageSectionNode}
      />
      <PageTwoSQ
        styles={styles}
        bill={billData}
        calculateGst={calculateGst}
        selectedCompany={selectedCompany}
        renderCompanyWatermark={companyWatermarkNode}
        renderFooterImageSection={footerImageSectionNode}
        renderQuotationNumberPageHeader={quotationNumberPageHeaderNode}
      />
      <PageThreeSQ
        bill={billData}
        styles={styles}
        renderCompanyWatermark={companyWatermarkNode}
        renderQuotationNumberPageHeader={quotationNumberPageHeaderNode}
        selectedCompany={selectedCompany}
      />
      {renderClientList()}
    </Document>
  );
};

export default SingleQuotationPDF;
