import { toast } from "react-toastify";

export function handleError(error: any, message?: string) {
  console.error("🔥 Error:", error);

  const errMsg =
    message ||
    error?.message ||
    error?.code ||
    "Something went wrong. Please try again.";

  toast.error(`${errMsg}`);
}
