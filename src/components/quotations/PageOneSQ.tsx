import { Image, Link, Page, Text, View } from "@react-pdf/renderer";
import { formatDate, getCompanyLogo } from "../../utils/commonUtils";
import { Client, Company, Quotation, SalesBill } from "../../types/bills";

type TypePageOneSQ = {
  styles: any;
  bill: Quotation & SalesBill;
  renderCompanyWatermark: React.ReactNode;
  selectedCompany: Company;
  selectedClient: Client;
  renderFooterImageSection: React.ReactNode;
};

const PageOneSQ = ({
  styles,
  bill,
  renderCompanyWatermark,
  selectedCompany,
  selectedClient,
  renderFooterImageSection,
}: TypePageOneSQ) => {
  const renderClientInfo = () => {
    const clientData = [
      { label: "Company", value: selectedClient?.name, case: "uppercase" },
      { label: "Address", value: selectedClient?.address },
      { label: "GSTIN", value: selectedClient?.gstin },
      { label: "Phone", value: selectedClient?.phone || "-" },
      { label: "Email", value: selectedClient?.email || "-" },
    ];
    return clientData?.map((data, index) => (
      <Text key={index}>
        <Text style={[styles?.bold, styles?.brandColor]}>{data.label}:</Text>{" "}
        <Text style={{ textTransform: data?.case as any }}>{data.value}</Text>
      </Text>
    ));
  };

  return (
    <Page size="A4" style={styles.page}>
      {renderCompanyWatermark}
      <View style={styles?.pageBox}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Image src={getCompanyLogo(selectedCompany?.gstin)} style={styles.logo} />
              <Text style={styles.companyName}>{selectedCompany?.name}</Text>
            </View>
            <Text style={styles.contactText}>{selectedCompany?.address}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Text style={styles.contactText}>
                <Text style={[styles?.bold, styles?.brandColor]}>Phone:</Text>{" "}
                <Text style={{ fontSize: 12 }}>
                  {selectedCompany?.contactNumber}
                </Text>
              </Text>

              {/* Email */}
              {selectedCompany?.email && (
                <>
                  <Text style={[styles.contactText, { marginHorizontal: 6 }]}>
                    {" "}
                    |{" "}
                  </Text>
                  <Text style={styles.contactText}>
                    <Text style={[styles?.bold, styles?.brandColor]}>
                      Email:
                    </Text>{" "}
                    {selectedCompany.email}
                  </Text>
                </>
              )}

              {/* Website */}
              {selectedCompany?.website && (
                <>
                  <Text style={[styles.contactText, { marginHorizontal: 6 }]}>
                    {" "}
                    |{" "}
                  </Text>
                  <Text style={styles.contactText}>
                    <Text style={[styles?.bold, styles?.brandColor]}>
                      Web:{" "}
                    </Text>
                    <Link src={selectedCompany.website}>
                      {selectedCompany.website.replace(/^https?:\/\//, "")}
                    </Link>
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles?.page1Row2}>
          <View style={styles.section}>
            <Text>
              <Text style={[styles?.bold, styles?.brandColor]}>GSTIN:</Text>{" "}
              {selectedCompany?.gstin}
            </Text>
            {selectedCompany?.lutArn ? (
              <Text>
                <Text style={[styles?.bold, styles?.brandColor]}>LUT/ARN:</Text>{" "}
                {selectedCompany?.lutArn}
              </Text>
            ) : null}
            {selectedCompany?.ieCode ? (
              <Text>
                <Text style={[styles?.bold, styles?.brandColor]}>IE Code:</Text>{" "}
                {selectedCompany?.ieCode}
              </Text>
            ) : null}
            <Text>
              <Text style={[styles?.bold, styles?.brandColor]}>MSME:</Text>{" "}
              {selectedCompany?.msme || ""}
            </Text>
          </View>
          <View style={styles.rightInfo}>
            <Text>
              <Text style={[styles?.bold, styles?.brandColor]}>
                Quotation Number:
              </Text>{" "}
              {bill?.quoteNumber}
            </Text>
            <Text>
              <Text style={[styles?.bold, styles?.brandColor]}>Date:</Text>{" "}
              {formatDate(bill?.quoteDate)}
            </Text>
          </View>
        </View>

        {/* Quotation Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.quotationFor, styles?.brandColor]}>
            QUOTATION FOR
          </Text>
          <Text
            style={[
              styles.quotationFor,
              styles?.brandColor,
              { textDecoration: "underline" },
            ]}
          >
            {bill?.title}
          </Text>
          <Text style={styles.subText}>
            {bill?.subTitle ?? "As per your requirements"}
          </Text>
        </View>

        {/* Client Details */}
        <View style={styles.section}>
          <Text style={styles.label}>
            <Text style={styles?.brandColor}>Kind Attention:</Text>{" "}
            {selectedClient?.poc ?? ""}
          </Text>
          {renderClientInfo()}
        </View>

        {/* Footer */}
        <View style={styles.page1Footer}>
          <View style={styles.parentFirm}>
            <Text style={styles?.brandColor}>
              {selectedCompany?.manufacturerDetails || ""}
            </Text>
            <Text style={[styles?.bold, styles?.brandColor]}>Other Firms:</Text>
            <Text>{selectedCompany?.otherFirms || ""}</Text>
          </View>
          {renderFooterImageSection}
        </View>
      </View>
    </Page>
  );
};

export default PageOneSQ;
