import { formatCurrency } from "../../utils/commonUtils";

const SalesSummary = ({ sales }: { sales: any[] }) => {
  const totalBills = sales.length;

  const totalAmount = sales.reduce(
    (sum, sale) => sum + (sale.totalAmount || 0),
    0,
  );

  return (
    <div className="w-full bg-white shadow-md rounded-xl p-4 my-2 flex flex-col md:flex-row justify-between items-center gap-4 border">
      <div className="flex flex-col items-center">
        <span className="text-gray-500 text-sm">Total Bills</span>
        <span className="text-2xl font-bold text-blue-600">{totalBills}</span>
      </div>
      <div className="hidden md:block h-10 w-px bg-gray-200"></div>
      <div className="flex flex-col items-center">
        <span className="text-gray-500 text-sm">Total Amount</span>
        <span className="text-2xl font-bold text-green-600">
          ₹{formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
};

export default SalesSummary;
