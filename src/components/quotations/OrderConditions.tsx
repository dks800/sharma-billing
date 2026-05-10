import { Text, View } from "@react-pdf/renderer";

const OrderConditions = ({ bill, styles }: any) => {
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
  return (
    <View style={styles.table}>
      {orderConditions?.map((con: any, idx: number) => (
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
  );
};

export default OrderConditions;
