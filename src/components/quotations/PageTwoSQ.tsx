import { Page, Text, View } from "@react-pdf/renderer";
import { Company, Quotation, SalesBill } from "../../types/bills";
import ProductTable from "./ProductTable";
import OrderConditions from "./OrderConditions";

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
        <ProductTable bill={bill} calculateGst={calculateGst} styles={styles} />
        <OrderConditions bill={bill} styles={styles} />
        {/* Footer */}
        <View style={styles.page1Footer}>{renderFooterImageSection}</View>
      </View>
    </Page>
  );
};

export default PageTwoSQ;
