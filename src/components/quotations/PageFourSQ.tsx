import { Page, Text, View } from "@react-pdf/renderer";
import { useClientsForQuotations } from "../../hooks/useInvoices";

type TypePageFourProps = {
  styles: any;
  renderCompanyWatermark: React.ReactNode;
  renderQuotationNumberPageHeader: React.ReactNode;
  renderFooterImageSection: React.ReactNode;
};

const PageFourSQ = ({
  styles,
  renderCompanyWatermark,
  renderQuotationNumberPageHeader,
  renderFooterImageSection,
}: TypePageFourProps) => {
  const { data } = useClientsForQuotations();

  const clientList =
    data?.[0]?.clients?.sort((a: string, b: string) => a.localeCompare(b)) ||
    [];

  if (!clientList || clientList?.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      {renderCompanyWatermark}
      {renderQuotationNumberPageHeader}
      <View style={styles.pageBox}>
        <Text
          style={[
            styles.companyName,
            { textAlign: "left", textDecoration: "underline" },
          ]}
        >
          Our Valuable Customers:
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          {clientList?.map((clientName: string, idx: number) => (
            <View
              key={idx}
              style={{
                flexBasis: "33.33%",
                flexGrow: 1,
                borderWidth: 0.6,
                padding: 6,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>{clientName}</Text>
            </View>
          ))}
        </View>
        <View style={styles.page1Footer}>{renderFooterImageSection}</View>
      </View>
    </Page>
  );
};

export default PageFourSQ;
