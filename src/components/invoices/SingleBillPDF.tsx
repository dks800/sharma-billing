import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import {
  formatCurrency,
  formatDate,
  numberToWords,
} from "../../utils/commonUtils";
import { useCompanyById } from "../../hooks/useCompanyById";
import { useClientById } from "../../hooks/useClientById";
import HQTStamp from "../../images/HQTStamp.png";
import DevStamp from "../../images/DevStamp.png";
import SSBStamp from "../../images/SSBStamp.png";
import SLEStamp from "../../images/SLEStamp.png";
import Heart from "../../images/heart.png";
import Murly from "../../images/MurlyLogo.png";
import HQTWatermark from "../../images/HQTLogo.png";
import DevWatermark from "../../images/DEVLogo.png";
import { Client, Company, SalesBill } from "../../types/bills";
import { getStyles } from "./singleBillPdfStyles";
import { globalCurrencies } from "../../constants";

interface Props {
  bill: SalesBill;
}

const SingleBillPDF: React.FC<Props> = ({ bill }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company>(
    {} as Company
  );
  const [selectedClient, setSelectedClient] = useState<Client>({} as Client);
  const [billData, setBillData] = useState<SalesBill>({} as SalesBill);
  const { company } = useCompanyById(bill?.companyId || "");
  const { client } = useClientById(bill?.customerGSTIN || "");
  const styles = getStyles(bill?.companyId || "");
  useEffect(() => {
    if (client && Object.keys(client).length > 0) setSelectedClient(client);
    if (company && Object.keys(company).length > 0) setSelectedCompany(company);
  }, [client, company]);

  useEffect(() => {
    if (bill && Object.keys(bill).length > 0) {
      const _bill = { ...bill, items: [...(bill.items || [])] };
      const maxRows = 17;
      const emptyRows = maxRows - (_bill.items.length || 0);
      Array.from({ length: emptyRows }).forEach(() =>
        _bill.items.push({
          description: "",
          hsnCode: "",
          qty: "",
          rate: "",
          unit: "",
        })
      );
      setBillData(_bill);
    }
  }, [bill]);

  const getCompanyStamp = () => {
    const companyMap: Record<string, string> = {
      "24AWKPS0186R1ZQ": HQTStamp,
      "24BFYPS0683D1Z1": DevStamp,
      "24HXBPS0898M1ZP": SSBStamp,
      "24GHHPS2424G1ZC": SLEStamp,
    };
    return companyMap[bill?.companyId || ""] || "";
  };

  const getCompanyWatermark = () => {
    const watermarkMap: Record<string, string> = {
      "24AWKPS0186R1ZQ": HQTWatermark,
      "24BFYPS0683D1Z1": DevWatermark,
    };
    return watermarkMap[bill?.companyId || ""] || "";
  };

  const getBankAccounts = () => {
    if (!selectedCompany?.bankAccounts?.length) return [];
    return selectedCompany.bankAccounts.slice(0, 2);
  };

  const termsAndConditions = [
    "Goods once sold will not be taken back",
    "Interest @24% p.a. will be charged on overdue accounts",
    "Subject to Vijapur jurisdiction only",
    selectedCompany?.gstin !== "24HXBPS0898M1ZP"
      ? "No warranty/guarantee/replacement against electrical equipments"
      : false,
    "E. & O.E. - Errors & Omissions Expected",
  ].filter(Boolean);

  const renderGSTLabels = (bill: SalesBill) => {
    const { taxType } = bill || {};
    if (taxType === "NA")
      return (
        <Text style={[styles?.statRows, styles.brandLabel]}>Total GST:</Text>
      );
    if (taxType !== "18") {
      const percent = Number(taxType) || 0;
      return (
        <>
          <Text style={[styles?.statRows, styles.brandLabel]}>
            SGST @ {percent}%:
          </Text>
          <Text style={[styles?.statRows, styles.brandLabel]}>
            CGST @ {percent}%:
          </Text>
        </>
      );
    }
    return (
      <Text style={[styles?.statRows, styles.brandLabel]}>
        IGST @ {taxType}%:
      </Text>
    );
  };

  const renderGSTStats = (bill: SalesBill) => {
    const { taxType, totalGST } = bill || {};
    const gstValue = Number(totalGST) || 0;
    if (taxType === "NA")
      return (
        <Text style={[styles?.statRows, styles?.exempted]}>
          (Exempted/Non-GST)
        </Text>
      );
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image
          src={getCompanyWatermark()}
          style={{
            position: "absolute",
            top: "35%",
            left: "20%",
            width: "60%",
            height: "auto",
            opacity: 0.08,
          }}
        />

        <View style={styles.pageBox}>
          <Text style={[styles.title, styles?.brandLabel]}>
            Tax Invoice ({bill?.financialYear})
          </Text>

          <View>
            <View style={styles.partyContainer}>
              <View style={[styles.partyBox, { borderRightWidth: 0.6 }]}>
                <Text style={styles.partyHeading}>Seller (Bill From):</Text>
                <Text
                  style={[
                    styles?.brandLabel,
                    { fontSize: 10, textTransform: "uppercase" },
                  ]}
                >
                  {selectedCompany?.name || bill?.companyName}
                </Text>
                <Text style={styles.partyAddress}>
                  {selectedCompany?.address}
                </Text>
                <Text>
                  <Text style={styles?.brandLabel}>GSTIN: </Text>
                  {selectedCompany?.gstin || bill?.companyId}
                </Text>
                {selectedCompany?.msme && (
                  <Text>
                    <Text style={styles?.brandLabel}>MSME: </Text>
                    {selectedCompany?.msme}
                  </Text>
                )}
                {selectedCompany?.ieCode && (
                  <Text>
                    <Text style={styles?.brandLabel}>IEC: </Text>
                    {selectedCompany?.ieCode}
                  </Text>
                )}
                {selectedCompany?.email && (
                  <Text>
                    <Text style={styles?.brandLabel}>Email: </Text>
                    {selectedCompany?.email}
                  </Text>
                )}
                {selectedCompany?.website && (
                  <Text>
                    <Text style={styles?.brandLabel}>Website: </Text>
                    {selectedCompany?.website}
                  </Text>
                )}
                {selectedCompany?.contactNumber && (
                  <Text>
                    <Text style={styles?.brandLabel}>Phone: </Text>
                    {selectedCompany?.contactNumber}
                  </Text>
                )}
              </View>
              <View style={[styles.partyBox, { borderRightWidth: 0 }]}>
                <Text style={styles.partyHeading}>Buyer (Bill To):</Text>
                <Text
                  style={[styles?.brandLabel, { textTransform: "uppercase" }]}
                >
                  {selectedClient?.name}
                </Text>
                <Text style={styles.partyAddress}>
                  {selectedClient?.address}
                </Text>
                <Text>
                  <Text style={styles?.brandLabel}>GSTIN: </Text>
                  {selectedClient?.gstin}
                </Text>
                {selectedClient?.lutArn && (
                  <Text>
                    <Text style={styles?.brandLabel}>LUT/ARN: </Text>
                    {selectedClient?.lutArn}
                  </Text>
                )}
                {selectedClient?.poc && (
                  <Text>
                    <Text style={styles?.brandLabel}>Contact Person: </Text>
                    {selectedClient?.poc}
                  </Text>
                )}
                {selectedClient?.phone && (
                  <Text>
                    <Text style={styles?.brandLabel}>Phone: </Text>
                    {selectedClient?.phone}
                  </Text>
                )}
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

          {/* Table */}
          <View style={styles.tableContainer}>
            <View style={styles.row}>
              <Text style={[styles.col, styles.colSr, styles.header]}>Sr</Text>
              <Text style={[styles.col, styles.colDescription, styles.header]}>
                Description
              </Text>
              <Text style={[styles.col, styles.colHSN, styles.header]}>
                HSNC
              </Text>
              <Text style={[styles.col, styles.colQty, styles.header]}>
                Qty
              </Text>
              <Text style={[styles.col, styles.colUnit, styles.header]}>
                Unit
              </Text>
              <Text style={[styles.col, styles.colRate, styles.header]}>
                Rate
              </Text>
              <Text style={[styles.col, styles.colTotal, styles.header]}>
                Amount
              </Text>
            </View>
            {billData?.items?.map((c, idx) => (
              <View
                key={idx}
                style={{
                  ...styles.row,
                  ...(idx === billData?.items?.length - 1
                    ? { borderBottomWidth: 0.6 }
                    : {}),
                }}
              >
                <Text style={[styles.col, styles.colSr]}>
                  {c?.rate ? idx + 1 : ""}
                </Text>
                <Text
                  style={[
                    styles.col,
                    styles.colDescription,
                    !c?.qty && !c?.rate ? styles?.italics : {},
                  ]}
                >
                  {c?.description}
                </Text>
                <Text style={[styles.col, styles.colHSN]}>{c?.hsnCode}</Text>
                <Text style={[styles.col, styles.colQty]}>{c?.qty || ""}</Text>
                <Text style={[styles.col, styles.colUnit]}>{c?.unit}</Text>
                <Text style={[styles.col, styles.colRate]}>
                  {c?.rate ? formatCurrency(c?.rate) : ""}
                </Text>
                <Text style={[styles.col, styles.colTotal]}>
                  {c?.qty && c?.rate
                    ? formatCurrency(Number(c?.qty) * Number(c?.rate))
                    : ""}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.stats}>
            <View style={styles.statWords}>
              <View style={styles.wordsRow}>
                <Text style={styles?.brandLabel}>Total Tax:</Text>
                <Text>{`${formatCurrency(bill?.totalGST)} (${numberToWords(
                  Number(bill?.totalGST),
                  bill?.currency
                )})`}</Text>
              </View>

              <View style={styles.wordsRow}>
                <Text style={styles?.brandLabel}>Grand Total In Words:</Text>
                <Text>
                  {numberToWords(
                    Math.round(Number(Number(bill?.totalAmount)?.toFixed(2))),
                    bill?.currency
                  )}
                </Text>
              </View>

              <View style={styles.wordsRow}>
                <Text style={styles?.brandLabel}>Invoice Currency:</Text>
                <Text>{`${bill?.currency} (${
                  globalCurrencies?.find((gc) => gc?.code === bill?.currency)
                    ?.name || ""
                })`}</Text>
              </View>
              <View style={styles.wordsRow}>
                <Text style={styles?.brandLabel}>Comments:</Text>
                <Text>{bill?.externalComments}</Text>
              </View>
            </View>

            <View style={styles.statsLeft}>
              <Text style={[styles.statRows, styles.brandLabel]}>
                Sub Total:
              </Text>
              {renderGSTLabels(bill)}
              <Text style={[styles.statRows, styles.brandLabel]}>
                Round Up:
              </Text>
              <Text style={[styles.statRows, styles.brandLabel]}>
                Grand Total:
              </Text>
            </View>

            <View style={styles.statsRight}>
              <Text style={styles.statRows}>
                {formatCurrency(bill?.totalBeforeTax)}
              </Text>
              {renderGSTStats(bill)}
              <Text style={styles.statRows}>
                {formatCurrency(bill?.roundUp)}
              </Text>
              <Text style={styles.statRows}>
                {formatCurrency(bill?.totalAmount)}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 5, textAlign: "right", marginTop: 2 }}>
            (E.&O.E.)
          </Text>
          <View>
            <Text style={styles?.bankDetailsLabel}>Bank Details:</Text>
            <View style={styles.bankBox}>
              {getBankAccounts()?.map((b, i) => (
                <View key={i}>
                  <Text style={styles.bankLabel}>
                    Bank Name:{" "}
                    <Text style={styles?.brandLabel}>{b?.bankName}</Text>
                  </Text>
                  <Text style={styles.bankLabel}>
                    A/C:{" "}
                    <Text style={styles?.brandLabel}>{b.accountNumber}</Text>
                  </Text>
                  <Text style={styles.bankLabel}>
                    IFSC: <Text style={styles?.brandLabel}>{b.ifsc}</Text>
                  </Text>
                  <Text style={styles.bankLabel}>
                    Branch:{" "}
                    <Text style={styles?.brandLabel}>
                      {b.branch}, {b.city}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Terms + Stamp */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <View style={{ fontSize: 7 }}>
              <Text style={styles?.brandLabel}>Terms & Conditions:</Text>
              {termsAndConditions?.map((term, index) => (
                <Text style={{ marginBottom: 2 }} key={index}>
                  {index + 1}. {term}
                </Text>
              ))}
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <Text>
                For,{" "}
                <Text
                  style={[styles?.brandLabel, { textTransform: "uppercase" }]}
                >
                  {selectedCompany?.name}
                </Text>
              </Text>
              <Image src={getCompanyStamp()} style={styles.logo} />
              <Text>Authorised Signatory</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View>
          <Text
            style={{
              fontSize: 7,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            This is a computer-generated invoice and does not require a physical
            signature.
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 6 }}>Made with</Text>
            <Image
              src={Heart}
              style={{ width: 7, height: 7, marginHorizontal: 2 }}
            />
            <Text style={{ fontSize: 6 }}>by</Text>
            <Image
              src={Murly}
              style={{ width: 20, height: 7, marginLeft: 2 }}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SingleBillPDF;
