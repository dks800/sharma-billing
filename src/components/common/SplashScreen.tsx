import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#212121] text-white z-50">
      <img
        src="/rocket512.png"
        alt="Sharma Billing Logo"
        className="w-24 h-24 animate-bounce-slow"
      />
      <h1 className="mt-4 text-2xl font-semibold animate-fadeInScale">
        Sharma Billing
      </h1>
    </div>
  );
}
