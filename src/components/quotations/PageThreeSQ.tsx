import { Image, Page, Text, View } from "@react-pdf/renderer";
import HDFCLogo from "../../images/hdfclogo.png";
import iciciLogo from "../../images/icicilogo.png";

import { Company, Quotation, SalesBill } from "../../types/bills";

type TypePageThreeProps = {
  styles: any;
  bill: Quotation & SalesBill;
  renderCompanyWatermark: React.ReactNode;
  renderQuotationNumberPageHeader: React.ReactNode;
  selectedCompany: Company;
};

const PageThreeSQ = ({
  styles,
  bill,
  renderCompanyWatermark,
  renderQuotationNumberPageHeader,
  selectedCompany,
}: TypePageThreeProps) => {
  const getBankAccounts = () => {
    if (!selectedCompany?.bankAccounts?.length) return [];
    return selectedCompany.bankAccounts.slice(0, 2);
  };

  const getBankImage = (bankName?: string) => {
    const _bankName = bankName?.toLocaleLowerCase() || "";
    const name = _bankName?.includes("hdfc")
      ? "hdfc"
      : _bankName?.includes("icici")
      ? "icici"
      : "";
    const bankLogos: Record<string, string> = {
      hdfc: HDFCLogo,
      icici: iciciLogo,
    };
    return bankName && bankLogos[name] ? (
      <Image src={bankLogos[name]} style={{ height: 20, marginBottom: 10 }} />
    ) : (
      <Text>{bankName}</Text>
    );
  };

  // to add on firebase company wise
  const quoteConditions = [
    {
      label: "Order Currency",
      value: `The order currecy will be ${bill?.currency || "INR"}`,
    },
    {
      label: "Insurance",
      value:
        "If required by Buyer, we will be arrange at Extra cost. The seller is not responsible for product safety during transit.",
    },
    {
      label: "Transportation",
      value: "Ex. Works Buyer factory. Buyer has to arrange transportation.",
    },
    {
      label: "Delivery",
      value: `${
        bill?.delivery ?? ""
      } The delivery timelines are estimates and may change due to factors beyond our control (force majeure, labour issues, breakdowns, transport delays, legislative changes, etc.). We are not liable for any direct or indirect loss caused by such delays, and delivery delay cannot be a reason to refuse the goods.`,
    },
    {
      label: "Taxes",
      value:
        "All taxes, duties, levies, and other government charges are extra and will be charged as applicable at the time of invoicing.",
    },
    {
      label: "Payment",
      value: `${bill?.paymentTerms ?? "100% advance with Purchase Order."}`,
    },
    {
      label: "Warranty",
      value:
        "Motor & Gear warranty is as per manufacturer standard warranty terms.",
    },
    {
      label: "Commissioning",
      value:
        "If required by the Buyer, we will arrange our site engineers, they will supervise the erection & commissioning of the machines and Buyer have to arrange required labor & staff & all masonry work included material. We will charge Extra amount for this work.",
    },

    {
      label: "Requiered Machineries",
      value:
        "Crane / Hydra / Forklift / Gas cutter / Welding Machine / Oxygen and other Tools Required. Cables & wires for electrification has to be arranged by Buyer.",
    },
    {
      label: "Arrangements",
      value:
        "Food, Tea, Accommodation and Transportation has to be arranged by Buyer.",
    },
    {
      label: "Travel",
      value:
        "All travel & conveyance expenses for our site engineers/technicians will be borne by the Buyer.",
    },
    {
      label: "General Terms",
      value:
        "- No order shall be binding on us unless it is confirmed. \n- Manufacturing process will be commenced once advance & PO are received. \n- An order in progress cannot be cancelled except with our previous consent in writing, the advance payment has to be made for work done or expenses incurred. \n- Interest at 2% per month will be charged in case payment is not made within 10 days from the date of our invoice. \n- On the failure of the purchaser to pay for the goods and / or to take delivery within the stipulated time the seller may retain any deposit advance or installment in respect of the purchase price already paid by purchaser and apply the same in satisfaction or part satisfaction of any charges expenses loss or damage incurred or sustained by seller shall be entitled to the sale or dispose of the goods on account and risk of purchaser or recover any shortfall with all expenses from the purchaser",
    },
  ];

  return (
    <Page size="A4" style={styles.page}>
      {renderCompanyWatermark}
      {renderQuotationNumberPageHeader}
      <View style={styles.pageBox}>
        <Text style={[styles.companyName]}>Bank Details:</Text>
        <View
          style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "row",
            gap: 2,
          }}
        >
          <Text>Beneficiary Name:</Text>
          <Text style={{ textTransform: "uppercase" }}>
            {selectedCompany?.name}
          </Text>
        </View>
        <View
          style={{
            marginVertical: 15,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {getBankAccounts().map((bank, idx) => (
            <View key={idx}>
              <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                {getBankImage(bank?.bankName)}
              </View>
              <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                <Text>Account No.:</Text>
                <Text
                  style={[styles?.bold, styles?.brandColor, { fontSize: 12 }]}
                >
                  {bank?.accountNumber}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                <Text>IFS Code:</Text>
                <Text
                  style={[styles?.bold, styles?.brandColor, { fontSize: 12 }]}
                >
                  {bank?.ifsc}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                <Text>Branch:</Text>
                <Text>
                  {bank?.branch}, {bank?.city}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text
          style={[
            styles.quotationFor,
            styles?.brandColor,
            { marginVertical: 5 },
          ]}
        >
          Terms & Conditions:
        </Text>
        <Text>
          All the deeds for quotation and sales are subject to the following
          mentioned terms & conditions:
        </Text>
        <View style={styles.table}>
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              { lineHeight: 1, borderBottomWidth: 0 },
            ]}
          >
            <Text style={[styles.tableCell, styles.colSr, styles?.brandColor]}>
              Sr No
            </Text>
            <Text
              style={[styles.tableCell, styles.colCategory, styles?.brandColor]}
            >
              Category
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colDescription,
                styles?.brandColor,
              ]}
            >
              Description
            </Text>
          </View>
          {quoteConditions?.map((cond, idx) => (
            <View
              style={[
                styles.tableRow,
                { fontSize: 8, lineHeight: 1.5, borderBottomWidth: 0 },
              ]}
              key={idx}
            >
              <Text style={[styles.tableCell, styles.colSr]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, styles.colCategory]}>
                {cond?.label}
              </Text>
              <Text style={[styles.tableCell, styles.colDescription]}>
                {cond?.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
};

export default PageThreeSQ;
