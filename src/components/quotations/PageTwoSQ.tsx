import { Page, Text, View } from "@react-pdf/renderer";
import { Company, Quotation, SalesBill } from "../../types/bills";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";

type TypePageTwoProps = {
  styles: any;
  selectedCompany: Company;
  bill: Quotation & SalesBill;
  calculateGst: boolean;
  renderCompanyWatermark: React.ReactNode;
  renderFooterImageSection: React.ReactNode;
  renderQuotationNumberPageHeader: React.ReactNode;
};

const PageTwoSQ = ({
  styles,
  bill,
  calculateGst,
  renderCompanyWatermark,
  renderFooterImageSection,
  renderQuotationNumberPageHeader,
  selectedCompany,
}: TypePageTwoProps) => {
  let srCounter = 1;

  const orderConditions = [
    {
      label: "Delivery:",
      value: bill?.delivery || "As discussed",
    },
    {
      label: "Payment:",
      value:
        bill?.paymentTerms ||
        "60% Advance Payment with PO and 40% before dispatch",
    },
    { label: "Tax:", value: "Extra" },
    { label: "Freight:", value: bill?.freight || "Extra and Ex-works Factory" },
    {
      label: "Validity:",
      value:
        bill?.validity ||
        "Document is valid up to next 15 days from quotation date",
    },
    {
      label: "Note:",
      value: "Please refer T&C page",
      backgroundColor: "yellow",
    },
  ];

  const getTotals = () => {
    const getTaxType = () => {
      if (bill?.taxType === "NA") return "Exempted/Non-GST";
      if (bill?.taxType === "18") return `IGST ${bill?.taxType}%`;
      return `SGST ${bill?.taxType}% + CGST ${bill?.taxType}%`;
    };

    const aggregation = [
      {
        label: "Sub Total",
        value: formatCurrency(bill?.totalBeforeTax),
        fontWeight: "bold",
      },
      { label: getTaxType(), value: calculateGst ? formatCurrency(bill?.totalGST) : "EXTRA" },
      { label: "Round Up", value: calculateGst ? formatCurrency(bill?.roundUp) : "0.00" },
      {
        label: "Grand Total",
        value: calculateGst ? formatCurrency(bill?.totalAmount) : formatCurrency(bill?.totalBeforeTax),
        fontWeight: "bold",
      },
    ];
    return (
      <View>
        {aggregation?.map((agg, idx) => (
          <View
            key={idx}
            style={[
              styles.tableRow,
              idx === aggregation.length - 1 ? { borderBottomWidth: 0 } : {},
              { fontSize: 9, lineHeight: 1.0 },
            ]}
          >
            <Text
              style={[
                styles?.brandColor,
                {
                  width: "85%",
                  textAlign: "right",
                  fontWeight: agg?.fontWeight || "normal",
                  padding: "4px",
                  borderRightWidth: 0.6,
                },
              ]}
            >
              {agg.label}
            </Text>
            <Text
              style={[
                styles.colAmount,
                {
                  fontWeight: agg?.fontWeight || "normal",
                  padding: "4px",
                  textAlign: "right",
                },
              ]}
            >
              {agg.value}
            </Text>
          </View>
        ))}
        <Text
          style={[
            {
              fontSize: 9,
              width: "100%",
              padding: "4px",
              lineHeight: 1.0,
              borderTopWidth: 0.6,
            },
          ]}
        >
          <Text style={[styles?.bold, styles?.brandColor]}>In Words:</Text>{" "}
          {numberToWords(Number(calculateGst ? bill?.totalAmount : bill?.totalBeforeTax))}
        </Text>
      </View>
    );
  };

  return (
    <Page size="A4" style={styles.page}>
      {renderCompanyWatermark}
      {renderQuotationNumberPageHeader}
      <View style={styles.pageBox}>
        <Text>
          We,{" "}
          <Text
            style={[
              styles?.bold,
              styles?.brandColor,
              { textTransform: "uppercase" },
            ]}
          >
            {selectedCompany?.name}
          </Text>{" "}
          have great pleasure in presenting our best quotation. Please find
          details for your requirement as given below:
        </Text>

        {/* Items Table */}
        <View style={styles.table}>
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              { borderBottomWidth: 0, lineHeight: 1.0 },
            ]}
          >
            <Text style={[styles.tableCell, styles.colSr, styles?.brandColor]}>
              Sr No
            </Text>
            <Text
              style={[styles.tableCell, styles.colDesc, styles?.brandColor]}
            >
              Descriptions
            </Text>
            <Text style={[styles.tableCell, styles.colQty, styles?.brandColor]}>
              Qty
            </Text>
            <Text
              style={[styles.tableCell, styles.colRate, styles?.brandColor]}
            >
              Rate
            </Text>
            <Text
              style={[styles.tableCell, styles.colAmount, styles?.brandColor]}
            >
              Amount
            </Text>
          </View>

          {bill?.items?.map((item, index) => {
            const isAmountValid = Number(item.qty) > 0 && Number(item.rate) > 0;
            const isValid = isAmountValid && item?.hsnCode;
            const isSpec = !isValid;
            const sr = isValid ? srCounter++ : "";
            const specCellStyle = isSpec ? styles.specCell : {};
            return (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index !== bill?.items?.length - 1
                    ? { borderBottomWidth: 0 }
                    : {},
                  { lineHeight: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    styles.colSr,
                    isSpec ? styles.noVerticalPadding : {},
                  ]}
                >
                  {sr || "\u00A0"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colDesc,
                    specCellStyle,
                    isSpec ? styles.specDescPadding : {},
                  ]}
                >
                  {item.description || "\u00A0"}
                </Text>
                <Text style={[styles.tableCell, styles.colQty, specCellStyle]}>
                  {item?.qty ? `${item.qty} ${item.unit || ""}` : "\u00A0"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colRate,
                    isSpec ? styles.noVerticalPadding : {},
                    { paddingTop: "4px" },
                  ]}
                >
                  {isAmountValid ? formatCurrency(item.rate) : "\u00A0"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                    isSpec ? styles.noVerticalPadding : {},
                    { paddingTop: "4px" },
                  ]}
                >
                  {isAmountValid
                    ? formatCurrency(Number(item.qty) * Number(item.rate))
                    : "\u00A0"}
                </Text>
              </View>
            );
          })}
          {getTotals()}
        </View>

        <View style={styles.table}>
          {orderConditions?.map((con, idx) => (
            <View
              style={[styles.tableRow, { lineHeight: 1.0, fontSize: 10 }]}
              key={idx}
            >
              <Text
                style={[
                  styles?.bold,
                  styles?.brandColor,
                  {
                    minWidth: 50,
                    backgroundColor: con?.backgroundColor || "transparent",
                    borderRightWidth: 0.6,
                    padding: "4px",
                  },
                ]}
              >
                {con?.label}
              </Text>
              <Text
                style={[
                  {
                    borderRightWidth: 0,
                    backgroundColor: con?.backgroundColor || "transparent",
                    width: "100%",
                    padding: "4px",
                  },
                ]}
              >
                {con?.value}
              </Text>
            </View>
          ))}
        </View>
        {/* Footer */}
        <View style={styles.page1Footer}>{renderFooterImageSection}</View>
      </View>
    </Page>
  );
};

export default PageTwoSQ;
