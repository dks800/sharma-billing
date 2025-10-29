import React from "react";

type EmptyStateProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  // optional GIF URL (if you prefer animated GIF over inline SVG)
  gifUrl?: string | null;
  className?: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "",
  subtitle = "There are no bills to show right now.",
  ctaLabel,
  onCta,
  gifUrl = null,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 px-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* GIF fallback if provided */}
      {gifUrl ? (
        <img
          src={gifUrl}
          alt="No results illustration"
          className="w-40 h-40 object-contain"
        />
      ) : (
        /* Inline cartoon-ish SVG */
        <svg
          width="160"
          height="100"
          viewBox="0 0 160 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-40 h-40"
          aria-hidden
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#A7F3D0" />
              <stop offset="1" stopColor="#6EE7B7" />
            </linearGradient>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0" stopColor="#BFDBFE" />
              <stop offset="1" stopColor="#93C5FD" />
            </linearGradient>
          </defs>

          {/* Rounded card */}
          <rect
            x="12"
            y="24"
            width="136"
            height="96"
            rx="12"
            fill="url(#g2)"
            opacity="0.95"
            transform="translate(0 2)"
          />
          {/* Smiley box */}
          <rect
            x="30"
            y="44"
            width="100"
            height="64"
            rx="8"
            fill="white"
            stroke="#E6E9EF"
            strokeWidth="1.5"
          />

          {/* Eyes */}
          <circle cx="60" cy="70" r="4" fill="#1F2937" />
          <circle cx="100" cy="70" r="4" fill="#1F2937" />

          {/* Small smile */}
          <path
            d="M64 86c3 3 11 3 14 0"
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Little floating star (cartoon) */}
          <g transform="translate(120 38)">
            <path
              d="M3 0 L4.5 2.5 L7.5 3 L4.5 4 L3 6 L1.5 4 L-1.5 3 L1.5 2.5 Z"
              fill="#FDE68A"
              transform="scale(2)"
              opacity="0.95"
            />
          </g>
        </svg>
      )}

      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {ctaLabel && onCta && (
        <div>
          <button
            onClick={onCta}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
