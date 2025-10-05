export function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const scales = [
    { value: 10000000, word: "Crore" },
    { value: 100000, word: "Lakh" },
    { value: 1000, word: "Thousand" },
    { value: 100, word: "Hundred" },
  ];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");

    for (const scale of scales) {
      if (n >= scale.value) {
        const quotient = Math.floor(n / scale.value);
        const remainder = n % scale.value;
        return (
          inWords(quotient) +
          " " +
          scale.word +
          (remainder ? " " + inWords(remainder) : "")
        );
      }
    }

    return "";
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let words = inWords(rupees) + " Rupees";
  if (paise > 0) {
    words += " and " + inWords(paise) + " Paise";
  }

  return words + " Only";
}

export function formatCurrency(amount: string | number, showCurrency = false): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return `${showCurrency ? "Rs. " : ""}0.00`;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)?.replace("₹", showCurrency ? "Rs. " : "");
}

export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const formatFinYear = (input: string) => {
  if (!input) return "";
  return input?.replace(/(\d{2})(\d{2})\D+(\d{2})(\d{2})/, "$2-$4");
};

