// src/components/common/Modal.tsx
import React from "react";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  type?: string;
  onClose: () => void;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "fullscreen";
  footer?: React.ReactNode;
};

const sizeClasses = {
  sm: "max-w-md max-h-[80vh]",
  md: "max-w-xl max-h-[80vh]",
  lg: "max-w-3xl max-h-[90vh]",
  fullscreen: "w-full h-full max-h-full",
};

export default function Modal({
  isOpen,
  title,
  onClose,
  type,
  children = null,
  size = "md",
  footer = null,
}: ModalProps) {
  if (!isOpen) return null;

  const getTitleStyles = () => {
    const colorMap: Record<string, string> = {
      warning: "yellow",
      error: "red",
    };
    const textColor = colorMap[type!] ?? "black";
    return `text-lg font-semibold text-${textColor}-600`;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`bg-white shadow-lg w-full overflow-auto flex flex-col transform transition-all duration-300 ease-out
      ${sizeClasses[size]}
      ${size === "fullscreen" ? "rounded-none" : "rounded-2xl"}
      scale-95 opacity-0 animate-fadeInScale`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex justify-between items-center border-b px-4 py-2">
              <h3 className={getTitleStyles()}>{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 text-xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
          )}
          <div className="p-4 flex-grow overflow-auto">{children}</div>
          {footer && (
            <div className="flex justify-end items-center border-t px-4 py-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
