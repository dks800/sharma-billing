import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
    page: {
        padding: 10,
        fontSize: 9,
        fontFamily: "Helvetica",
    },
    pageBox: {
        flex: 1,
        padding: 20,
        paddingTop: 10,
        borderWidth: 0.6,
        borderStyle: "solid",
        borderColor: "#000",
    },
    title: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
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
        borderWidth: 0.5,
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
        textAlign: "center",
        fontSize: 9,
        borderBottomWidth: 0.6,
    },
    colSr: {
        flex: 0.5,
        textAlign: "center",
    },
    colDescription: {
        flex: 4,
        paddingLeft: 4,
    },
    colHSN: {
        flex: 0.6,
        textAlign: "center",
    },
    colQty: {
        flex: 0.6,
        textAlign: "center",
    },
    colUnit: {
        flex: 0.6,
        textAlign: "center",
    },
    colRate: {
        flex: 1.2,
        textAlign: "right",
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
    statRows: {
        borderBottomWidth: 0.6,
        borderStyle: "solid",
        borderColor: "#000",
        padding: 3,
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
        fontSize: 8, textAlign: "center", marginBottom: 2,
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
        marginRight: 3,
    },

    invValue: {
        fontSize: 8,
    },
});