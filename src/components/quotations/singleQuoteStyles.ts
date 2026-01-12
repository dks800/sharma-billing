import { StyleSheet } from "@react-pdf/renderer";

export const getStyles = (companyId: string) => {
  const brandColor =
    companyId === "24BFYPS0683D1Z1"
      ? "#D62B26" // dev
      : companyId === "24AWKPS0186R1ZQ"
      ? "#0033CC" // hqt
      : companyId === "24HXBPS0898M1ZP"
      ? "#597515" // ssb
      : "#000000"; // default black

  return StyleSheet.create({
    page: {
      padding: 10,
      fontSize: 9,
      fontFamily: "Helvetica",
    },
    companyName: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginBottom: 6,
      color: brandColor,
      //   fontSize: 30, // TODO: update this to large
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    companyDetails: {
      flex: 1,
      paddingLeft: 10,
    },
    leftText: {
      color: "gray",
      opacity: 0.8,
      fontSize: 25,
      fontWeight: "bold",
      flex: 1,
      textAlign: "right",
    },
    centerText: {
      fontSize: 14,
      fontWeight: "bold",
      flex: 1,
      textAlign: "center",
    },
    pageBox: {
      flex: 1,
      padding: 20,
      paddingTop: 10,
      borderWidth: 0.6,
      borderColor: "#000",
      borderStyle: "solid",
    },
    title: {
      fontSize: 14,
      marginBottom: 10,
      textAlign: "center",
      fontWeight: "bold",
      color: brandColor,
    },
    topBox: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    invDetails: {
      borderBottomWidth: 0.6,
      borderRightWidth: 0.6,
      borderStyle: "solid",
      borderColor: "#000",
      padding: 5,
      marginBottom: 5,
    },
    invMainDetails: {
      display: "flex",
      flexDirection: "row",
    },
    tableContainer: {
      width: "100%",
      marginTop: 10,
      borderStyle: "solid",
      borderWidth: 0.6,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    row: {
      flexDirection: "row",
    },
    col: {
      borderStyle: "solid",
      borderWidth: 0.6,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 3,
      justifyContent: "center",
      minHeight: "15pt",
    },
    header: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
      color: brandColor,
      textAlign: "center",
      fontSize: 9,
      borderBottomWidth: 0.6,
    },
    colDescription: {
      flex: 4,
      paddingLeft: 4,
    },
    colHSN: {
      flex: 0.6,
      textAlign: "center",
    },
    colTotal: {
      flex: 1.5,
      textAlign: "right",
    },
    colComments: {
      flex: 2.5,
      fontSize: 6.5,
    },
    finYear: {
      fontSize: 6,
      color: "#555",
      fontStyle: "italic",
    },
    stats: {
      marginTop: 10,
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    statsLeft: {
      borderWidth: 0.6,
      borderBottom: 0,
      borderRight: 0,
      borderStyle: "solid",
    },
    statsRight: {
      flex: 0.24,
      textAlign: "right",
      borderWidth: 0.6,
      borderBottom: 0,
      borderStyle: "solid",
    },
    italics: {
      fontStyle: "italic",
    },
    exempted: {
      fontSize: 8.5,
      lineHeight: "10px",
    },
    statRows: {
      borderBottomWidth: 0.6,
      borderStyle: "solid",
      borderColor: "#000",
      padding: 3,
    },
    brandLabel: {
      fontWeight: "bold",
      color: brandColor,
    },
    statWords: {
      borderWidth: 0.6,
      borderRight: 0,
      borderStyle: "solid",
      padding: 3,
      flex: 1,
      justifyContent: "flex-start",
      flexDirection: "column",
      fontSize: 8,
    },
    wordsRow: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 5,
      gap: 4,
    },
    bankBox: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 0.6,
      borderStyle: "solid",
      padding: 2,
    },
    bankRow: {
      display: "flex",
      flexDirection: "column",
      marginBottom: 2,
    },
    bankLabel: {
      fontSize: 8,
      textAlign: "center",
      marginBottom: 2,
    },
    bankDetailsLabel: {
      fontSize: 8,
      textAlign: "left",
      marginTop: 8,
      marginBottom: 2,
      fontWeight: "bold",
      color: brandColor,
      textTransform: "uppercase",
    },
    companyLogo: {
      width: 30,
      // height: 30,
      // objectFit: "contain",
    },
    logo: {
      width: 80,
      height: 80,
      objectFit: "contain",
    },
    murlyLogo: {
      height: 8,
      width: 25,
      objectFit: "contain",
    },
    partyContainer: {
      flexDirection: "row",
      borderWidth: 0.6,
      borderColor: "#000",
      marginBottom: 10,
    },

    partyBox: {
      flex: 1,
      padding: 5,
      borderColor: "#000",
      borderRightWidth: 0.6,
    },

    partyHeading: {
      fontSize: 9,
      fontWeight: "bold",
      color: brandColor,
      marginBottom: 3,
    },

    partyAddress: {
      flexWrap: "wrap",
      width: "100%",
    },
    invDetailsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      borderWidth: 0.6,
      borderColor: "#000",
    },

    invGridCell: {
      width: "50%",
      flexDirection: "row",
      padding: 2,
      borderColor: "#000",
    },

    invLabel: {
      fontSize: 8,
      fontWeight: "bold",
      color: brandColor,
      marginRight: 3,
    },

    invValue: {
      fontSize: 8,
    },
    table: {
      marginTop: 10,
      borderWidth: 0.6,
      borderColor: "#000",
    },

    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.6,
      borderColor: "#000",
      minHeight: 22,
      alignItems: "center",
    },

    tableHeader: {
      backgroundColor: "#f0f0f0",
    },

    tableCell: {
      padding: 4,
      fontSize: 9,
      borderRightWidth: 0.6,
      borderColor: "#000",
    },

    // Column widths
    colSr: { width: "8%" },
    colDesc: { width: "52%" },
    colQty: { width: "10%", textAlign: "center" },
    colUnit: { width: "10%", textAlign: "center" },
    colRate: { width: "15%", textAlign: "right" },
    colAmount: { width: "15%", textAlign: "right", borderRightWidth: 0 },
  });
};
