import React, { useEffect, useState } from "react";
import {
    Page,
    Text,
    View,
    Document,
    Image,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate, numberToWords } from "../../utils/commonUtils";
import { useCompanyById } from "../../hooks/useCompanyById";
import { useClientById } from "../../hooks/useClientById";
import HQTStamp from "../../images/HQTStamp.png";
import DevStamp from "../../images/DevStamp.png";
import SSBStamp from "../../images/SSBStamp.png";
import SLEStamp from "../../images/SLEStamp.png";
import Heart from "../../images/heart.png";
import Murly from "../../images/MurlyLogo.png";
import { styles } from "./singleBillPdfStyles";
import { Client, Company, SalesBill } from "../../types/bills";

interface Props {
    bill: SalesBill;
}

const SingleBillPDF: React.FC<Props> = ({ bill }) => {
    const [selectedCompany, setSelectedCompany] = useState<Company>({} as Company);
    const [selectedClient, setSelectedClient] = useState<Client>({} as Client);
    const [billData, setBillData] = useState<SalesBill>({} as SalesBill);
    const { company } = useCompanyById(bill?.companyId || "");
    const { client } = useClientById(bill?.customerGSTIN || "");

    useEffect(() => {
        if (client && Object.keys(client).length > 0) {
            setSelectedClient(client);
        }
        if (company && Object.keys(company).length > 0) {
            setSelectedCompany(company);
        }
    }, [client, company]);

    useEffect(() => {
        if (bill && Object.keys(bill).length > 0) {
            const _bill = {
                ...bill,
                items: [...(bill.items || [])],
            };
            const maxRows = 17;
            const currentRows = bill?.items?.length || 0;
            const emptyRows = maxRows - currentRows;
            Array.from({ length: emptyRows }).forEach(() => {
                _bill?.items?.push({
                    description: "",
                    hsnCode: "",
                    qty: "",
                    rate: "",
                    unit: "",
                });
            });
            setBillData(_bill);
        }
    }, [bill]);

    const getCompanyStamp = () => {
        const companyMap: Record<string, string> = {
            "24AWKPS0186R1ZQ": HQTStamp, // Hindustan Quartz Technology,
            "24BFYPS0683D1Z1": DevStamp, // Dev Engineering,
            "24HXBPS0898M1ZP": SSBStamp, // Shiv Shakti Buildcon,
            "24GHHPS2424G1ZC": SLEStamp, // Shree Lakshmi Engineering,
        }
        return companyMap[bill?.companyId || ""] || "null";
    }

    const getBankAccounts = () => {
        if (!selectedCompany?.bankAccounts || selectedCompany?.bankAccounts?.length === 0) return [];
        if (selectedCompany?.bankAccounts?.length < 1) return selectedCompany?.bankAccounts;
        return selectedCompany?.bankAccounts?.slice(0, 2);
    };

    const termsAndConditions = [
        "Goods once sold will not be taken back",
        "Interest @24% p.a. will be charged on overdue accounts",
        "Subject to Vijapur jurisdiction only",
        selectedCompany?.gstin !== "24HXBPS0898M1ZP" ? "No warranty/guarantee/replacement against electrical equipments" : false,
        "E. & O.E. - Errors & Omissions Expected"
    ]?.filter(Boolean);

    const renderGSTLabels = (bill: SalesBill) => {
        const { taxType } = bill || {};
        if (taxType === "NA") {
            return <Text style={styles?.statRows}>Total GST:</Text>;
        }
        if (taxType !== "18") {
            const percent = Number(taxType) || 0;
            return (
                <>
                    <Text style={styles?.statRows}>SGST @ {percent}%:</Text>
                    <Text style={styles?.statRows}>CGST @ {percent}%:</Text>
                </>
            );
        }
        return <Text style={styles?.statRows}>IGST @ {taxType}%:</Text>;
    };


    const renderGSTStats = (bill: SalesBill) => {
        const { taxType, totalGST } = bill || {};
        const gstValue = Number(totalGST) || 0;
        if (taxType === "NA") {
            return <Text style={styles?.statRows}>(Exempted/Non-GST)</Text>;
        }
        if (taxType !== "18") {
            const halfGST = formatCurrency(gstValue / 2);
            return (
                <>
                    <Text style={styles?.statRows}>{halfGST}</Text>
                    <Text style={styles?.statRows}>{halfGST}</Text>
                </>
            );
        }
        return <Text style={styles?.statRows}>{formatCurrency(gstValue)}</Text>;
    };

    return <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.pageBox}>
                <Text style={styles.title}>Tax Invoice ({bill?.financialYear})</Text>
                <View>
                    <View style={styles.partyContainer}>
                        {/* Seller */}
                        <View style={[styles.partyBox, { borderRightWidth: 0.6 }]}>
                            <Text style={styles.partyHeading}>Seller (Bill From):</Text>
                            <Text style={{ fontWeight: "bold", textTransform: "uppercase" }}>{selectedCompany?.name || bill?.companyName}</Text>
                            <Text style={styles.partyAddress}>{selectedCompany?.address}</Text>
                            <Text>GSTIN: {selectedCompany?.gstin || bill?.companyId}</Text>
                            {selectedCompany?.msme && <Text>MSME: {selectedCompany?.msme}</Text>}
                            {selectedCompany?.ieCode && <Text>IEC: {selectedCompany?.ieCode}</Text>}
                            {selectedCompany?.email && <Text>Email: {selectedCompany?.email}</Text>}
                            {selectedCompany?.website && <Text>Website: {selectedCompany?.website}</Text>}
                            {selectedCompany?.contactNumber && <Text>Phone: {selectedCompany?.contactNumber}</Text>}
                        </View>

                        {/* Buyer */}
                        <View style={[styles.partyBox, { borderRightWidth: 0 }]}>
                            <Text style={styles.partyHeading}>Buyer (Bill To):</Text>
                            <Text style={{ fontWeight: "bold", textTransform: "uppercase" }}>{selectedClient?.name}</Text>
                            <Text style={styles.partyAddress}>{selectedClient?.address}</Text>
                            <Text>GSTIN: {selectedClient?.gstin}</Text>
                            {selectedClient?.poc && <Text>Contact Person: {selectedClient?.poc}</Text>}
                            {selectedClient?.phone && <Text>Phone: {selectedClient?.phone}</Text>}
                        </View>
                    </View>


                    <View style={styles.invDetailsGrid}>
                        {[
                            { label: "Invoice No:", value: bill?.billNumber },
                            { label: "Invoice Date:", value: formatDate(bill?.billDate) },
                            { label: "From:", value: bill?.locationFrom },
                            { label: "To:", value: bill?.locationTo },
                            { label: "Payment:", value: bill?.paymentStatus },
                            { label: "Dispatch By:", value: bill?.dispatchBy },
                            { label: "Eway Bill No:", value: bill?.ewayBillNo },
                            { label: "Date & Time:", value: bill?.ewayBillDate },
                        ].map((item, idx, arr) => {
                            const isLastColumn = idx % 2 === 1;
                            const isLastRow = idx >= arr.length - 2;
                            return (
                                <View
                                    key={idx}
                                    style={[
                                        styles.invGridCell,
                                        {
                                            borderRightWidth: isLastColumn ? 0 : 0.6,
                                            borderBottomWidth: isLastRow ? 0 : 0.6,
                                        },
                                    ]}
                                >
                                    <Text style={styles.invLabel}>{item.label}</Text>
                                    <Text style={styles.invValue}>{item.value}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
                <View style={styles?.tableContainer}>
                    <View style={styles.row}>
                        <Text style={[styles.col, styles.colSr, styles.header]}>Sr</Text>
                        <Text style={[styles.col, styles.colDescription, styles.header]}>Description</Text>
                        <Text style={[styles.col, styles.colHSN, styles.header]}>HSNC</Text>
                        <Text style={[styles.col, styles.colQty, styles.header]}>Qty</Text>
                        <Text style={[styles.col, styles.colUnit, styles.header]}>Unit</Text>
                        <Text style={[styles.col, styles.colRate, styles.header]}>Rate</Text>
                        <Text style={[styles.col, styles.colTotal, styles.header]}>Amount</Text>
                    </View>
                    {bill?.items?.map((c, idx) => (
                        <View
                            key={idx}
                            style={{
                                ...styles.row,
                                ...(idx === bill?.items?.length - 1 ? { borderBottomWidth: 0.6 } : {}),
                            }}
                        >
                            <Text style={[styles.col, styles.colSr]}>{c?.rate ? idx + 1 : ""}</Text>
                            <Text style={[styles.col, styles.colDescription]}>{c?.description}</Text>
                            <Text style={[styles.col, styles.colHSN]}>{c?.hsnCode}</Text>
                            <Text style={[styles.col, styles.colQty]}>{c?.qty}</Text>
                            <Text style={[styles.col, styles.colUnit]}>{c?.unit}</Text>
                            <Text style={[styles.col, styles.colRate]}>{c?.rate ? formatCurrency(c?.rate) : ""}</Text>
                            <Text style={[styles.col, styles.colTotal]}>{c?.qty && c?.rate ? formatCurrency(Number(c?.qty) * Number(c?.rate)) : ""}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles?.stats}>
                    <View style={styles?.statWords}>
                        <View style={styles?.wordsRow}>
                            <Text style={{ fontWeight: "bold" }}>Total Tax:</Text>
                            <Text>{`${formatCurrency(bill?.totalGST)} (${numberToWords(Number(bill?.totalGST))})`}</Text>
                        </View>

                        <View style={styles?.wordsRow}>
                            <Text style={{ fontWeight: "bold" }}>Grand Total In Words:</Text>
                            <Text>{numberToWords(Math.round(Number(Number(bill?.totalAmount)?.toFixed(2))))}</Text>
                        </View>
                        <View style={styles?.wordsRow}>
                            <Text style={{ fontWeight: "bold" }}>Comments:</Text>
                            <Text>{bill?.comments}</Text>
                        </View>
                    </View>
                    <View style={styles?.statsLeft}>
                        <Text style={styles?.statRows}>Sub Total:</Text>
                        {renderGSTLabels(bill)}
                        <Text style={styles?.statRows}>Round Up:</Text>
                        <Text style={styles?.statRows}>Grand Total:</Text>
                    </View>
                    <View style={styles?.statsRight}>
                        <Text style={styles?.statRows}>{formatCurrency(bill?.totalBeforeTax)}</Text>
                        {renderGSTStats(bill)}
                        <Text style={styles?.statRows}>{formatCurrency(bill?.roundUp)}</Text>
                        <Text style={styles?.statRows}>{formatCurrency(bill?.totalAmount)}</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 5, textAlign: "right", marginTop: 2 }}>(E.&O.E.)</Text>
                {/* Bank Details */}
                <View>
                    <Text style={{ fontSize: 7, textAlign: "left", marginTop: 8, fontWeight: "bold" }}>Bank Details:</Text>
                    <View style={styles?.bankBox}>
                        {getBankAccounts()?.map((b, i) => (
                            <View key={i}>
                                <Text style={styles?.bankLabel}>Bank Name: <Text style={{ fontWeight: "bold" }}> {b?.bankName}</Text></Text>
                                <Text style={styles?.bankLabel}>A/C: <Text style={{ fontWeight: "bold" }}> {b.accountNumber}</Text></Text>
                                <Text style={styles?.bankLabel}>IFSC: <Text style={{ fontWeight: "bold" }}> {b.ifsc}</Text></Text>
                                <Text style={styles?.bankLabel}>Branch: <Text style={{ fontWeight: "bold" }}> {b.branch}, {b.city}</Text></Text>
                            </View>
                        ))}

                    </View>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10 }}>
                    {/* Terms & Conditions */}
                    <View style={{ fontSize: 7 }}>
                        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Terms & Conditions:</Text>
                        {
                            termsAndConditions?.map((term, index) => (
                                <Text style={{ marginBottom: 2 }} key={index}>{index + 1}. {term}</Text>
                            ))
                        }
                    </View>
                    {/* Stamp & Sign */}
                    <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
                        <Text>For, <Text style={{ fontWeight: "bold" }}>{selectedCompany?.name}</Text></Text>
                        <Image src={getCompanyStamp()} style={styles.logo} />
                        <Text>Authotised Signatory</Text>
                    </View>
                </View>
            </View>
            <View>
                <Text style={{ fontSize: 7, textAlign: "center", marginTop: 10 }}>This is a computer-generated invoice and does not require a physical signature.</Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 6 }}>Made with</Text>
                    <Image src={Heart} style={{ width: 7, height: 7, marginHorizontal: 2 }} />
                    <Text style={{ fontSize: 6 }}>by</Text>
                    <Image src={Murly} style={{ width: 20, height: 7, marginLeft: 2 }} />
                </View>
            </View>
        </Page>
    </Document>
};

export default SingleBillPDF;
