import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 9,
        fontFamily: "Helvetica",
    },
    title: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
    },
    table: {
        width: "100%",
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
        padding: 3,
        justifyContent: "center",
    },
    header: {
        backgroundColor: "#f2f2f2",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 9,
    },
    colSr: {
        flex: 0.4,
        textAlign: "center",
    },
    colBill: {
        flex: 0.7,
    },
    colDate: {
        flex: 0.9,
    },
    colNet: {
        flex: 0.9,
        textAlign: "right",
    },
    colGST: {
        flex: 0.7,
        textAlign: "right",
    },
    colTotal: {
        flex: 1,
        textAlign: "right",
    },
    colPayment: {
        flex: 1,
        textAlign: "center",
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

});