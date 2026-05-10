import { Text, View } from "@react-pdf/renderer";
import { formatCurrency, numberToWords } from "../../utils/commonUtils";

const ProductTable = ({
  bill,
  calculateGst,
  styles,
}: {
  bill: any;
  calculateGst: any;
  styles: any;
}) => {
  let srCounter = 1;
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
      {
        label: getTaxType(),
        value: calculateGst ? formatCurrency(bill?.totalGST) : "EXTRA",
      },
      bill?.roundUp ? {
        label: "Round Up",
        value: calculateGst ? formatCurrency(bill?.roundUp) : "0.00",
      } : null,
      {
        label: "Grand Total",
        value: calculateGst
          ? formatCurrency(bill?.totalAmount)
          : formatCurrency(bill?.totalBeforeTax),
        fontWeight: "bold",
      },
    ]?.filter(Boolean);
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
              {agg?.label}
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
              {agg?.value}
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
          {numberToWords(
            Number(calculateGst ? bill?.totalAmount : bill?.totalBeforeTax),
          )}
        </Text>
      </View>
    );
  };
  return (
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
        <Text style={[styles.tableCell, styles.colDesc, styles?.brandColor]}>
          Description
        </Text>
        <Text style={[styles.tableCell, styles.colQty, styles?.brandColor]}>
          Qty
        </Text>
        <Text style={[styles.tableCell, styles.colRate, styles?.brandColor]}>
          Rate
        </Text>
        <Text style={[styles.tableCell, styles.colAmount, styles?.brandColor]}>
          Amount
        </Text>
      </View>
      {bill?.items?.map((item: any, index: number) => {
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
              index !== bill?.items?.length - 1 ? { borderBottomWidth: 0 } : {},
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
  );
};

export default ProductTable;
