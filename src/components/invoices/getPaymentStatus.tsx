import React from "react";

const renderPaymentStatus = (status: string) => {
  if (!status) return "-";
  const baseClass =
    "inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium";
  switch (status.toLowerCase()) {
    case "paid":
      return (
        <span className={`${baseClass} bg-green-100 text-green-700`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Paid
        </span>
      );
    case "partially paid":
      return (
        <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 5a7 7 0 110 14a7 7 0 010-14z"
            />
          </svg>
          Partially Paid
        </span>
      );
    case "pending":
      return (
        <span className={`${baseClass} bg-red-100 text-red-700`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Pending
        </span>
      );
    default:
      return status;
  }
};

export default renderPaymentStatus;
