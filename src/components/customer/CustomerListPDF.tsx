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
        padding: 4,
        fontSize: 9,
        justifyContent: "center",
    },
    header: {
        backgroundColor: "#f2f2f2",
        fontWeight: "bold",
    },
    colSr: {
        flex: 0.5,
        textAlign: "center",
    },
    colName: {
        flex: 1.5,
    },
    colEmail: {
        flex: 1,
    },
    colPhone: {
        flex: 1,
        textAlign: "center",
    },
    colContact: {
        flex: 1,
        textAlign: "center",
    },
    colAddress: {
        flex: 2,
    },
});


interface Clients {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin: string;
    poc: string;
}

interface Props {
    clients: Clients[];
}

const CustomerListPDF: React.FC<Props> = ({ clients }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Client List</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={[styles.col, styles.colSr, styles.header]}>Sr</Text>
                    <Text style={[styles.col, styles.colName, styles.header]}>Name</Text>
                    <Text style={[styles.col, styles.colEmail, styles.header]}>Email</Text>
                    <Text style={[styles.col, styles.colPhone, styles.header]}>Phone</Text>
                    <Text style={[styles.col, styles.colContact, styles.header]}>Contact Person</Text>
                    <Text style={[styles.col, styles.colAddress, styles.header]}>Address</Text>
                </View>

                {clients.map((c, idx) => (
                    <View style={styles.row} key={c.id}>
                        <Text style={[styles.col, styles.colSr]}>{idx + 1}</Text>
                        <Text style={[styles.col, styles.colName]}>{`${c.name}\n(${c.gstin})`}</Text>
                        <Text style={[styles.col, styles.colEmail]}>{c.email || "-"}</Text>
                        <Text style={[styles.col, styles.colPhone]}>{c.phone || "-"}</Text>
                        <Text style={[styles.col, styles.colContact]}>{c.poc || "-"}</Text>
                        <Text style={[styles.col, styles.colAddress]}>{c.address || "-"}</Text>
                    </View>
                ))}
            </View>

        </Page>
    </Document>
);

export default CustomerListPDF;
