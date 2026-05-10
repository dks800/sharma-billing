import { Page, Text, View, Image, Link } from "@react-pdf/renderer";
import { formatDate, getCompanyLogo } from "../../utils/commonUtils";
import ProductTable from "./ProductTable";
import OrderConditions from "./OrderConditions";

const SinglePageQuotation = ({
  styles,
  bill,
  selectedCompany,
  selectedClient,
  calculateGst,
  renderCompanyWatermark,
  renderFooterImageSection,
}: any) => {
  return (
    <Page size="A4" style={[styles.page]}>
      {renderCompanyWatermark}
      <View style={styles?.pageBox}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 0.6,
            paddingBottom: 6,
          }}
        >
          <View>
            <Text
              style={[
                styles.companyName,
                {
                  fontSize: 16,
                  marginBottom: 5,
                  textTransform: "uppercase",
                },
              ]}
            >
              {selectedCompany?.name}
            </Text>

            <Text style={[styles.contactText, { fontSize: 9 }]}>
              {selectedCompany?.address}
            </Text>

            <Text style={[styles.contactText, { fontSize: 9 }]}>
              GSTIN: {selectedCompany?.gstin} | Phone:{" "}
              {selectedCompany?.contactNumber}
            </Text>

            <Text style={[styles.contactText, { fontSize: 9 }]}>
              {selectedCompany?.email && (
                <Text style={[styles.contactText, { fontSize: 9 }]}>
                  Email: {selectedCompany.email.replace(/^https?:\/\//, "")}
                </Text>
              )}
              {selectedCompany?.website && (
                <>
                  {" "}
                  |{" "}
                  <Link src={selectedCompany.website}>
                    <Text style={[styles.contactText, { fontSize: 9 }]}>
                      {selectedCompany.website.replace(/^https?:\/\//, "")}
                    </Text>
                  </Link>
                </>
              )}
            </Text>
          </View>
          <View>
            <Image
              src={getCompanyLogo(selectedCompany?.gstin)}
              style={styles.logo}
            />
          </View>
        </View>

        {/* TITLE */}
        <View
          style={{
            marginTop: 8,
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles?.brandColor,
              styles?.bold,
              {
                fontSize: 10,
                textDecoration: "underline",
              },
            ]}
          >
            QUOTATION - {bill?.title || ""}
          </Text>
          {bill?.subTitle && (
            <Text style={[styles.subText, { margin: 0, fontSize: 8 }]}>
              ({bill?.subTitle ?? "As per your requirements"})
            </Text>
          )}
        </View>

        {/* BUYER */}
        <View
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              fontSize: 9,
              width: "65%",
            }}
          >
            <Text
              style={[
                styles.bold,
                styles.brandColor,
                { textTransform: "uppercase", fontSize: 10 },
              ]}
            >
              For: {selectedClient?.name}
            </Text>
            <Text>Address: {selectedClient?.address}</Text>
            <Text>GSTIN: {selectedClient?.gstin || "-"}</Text>
            {selectedClient?.phone && (
              <Text>Contact: {selectedClient?.phone || "-"}</Text>
            )}
            {selectedClient?.email && (
              <Text>Email: {selectedClient?.email || "-"}</Text>
            )}
          </View>
          <View
            style={{
              width: "30%",
              fontSize: 9,
              gap: 3,
              textAlign: "right",
            }}
          >
            <Text style={{ fontSize: 10 }}>
              <Text style={[styles.bold, styles.brandColor]}>Quotation #:</Text>{" "}
              {bill?.quoteNumber}
            </Text>

            <Text style={{ fontSize: 10 }}>
              <Text style={[styles.bold, styles.brandColor]}>Date:</Text>{" "}
              {formatDate(bill?.quoteDate)}
            </Text>
          </View>
        </View>

        {/* PRODUCTS TABLE */}
        <ProductTable bill={bill} calculateGst={calculateGst} styles={styles} />

        {/* TERMS */}
        <OrderConditions bill={bill} styles={styles} />

        {/* FOOTER */}
        <View style={styles.page1Footer}>
          <View style={styles.parentFirm}>
            <Text style={styles?.brandColor}>
              {selectedCompany?.manufacturerDetails || ""}
            </Text>
            <Text style={[styles?.bold, styles?.brandColor]}>Other Firms:</Text>
            <Text style={{ fontSize: 8 }}>
              {selectedCompany?.otherFirms || ""}
            </Text>
          </View>
          {renderFooterImageSection}
        </View>
      </View>
    </Page>
  );
};

export default SinglePageQuotation;
