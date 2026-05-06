export default function BatSkull({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TatBook"
    >
      {/* Left wing */}
      <path
        d="M0 18 C4 10, 12 8, 16 14 C12 12, 8 16, 10 22 C6 20, 2 22, 0 18Z"
        fill="white"
      />
      {/* Right wing */}
      <path
        d="M64 18 C60 10, 52 8, 48 14 C52 12, 56 16, 54 22 C58 20, 62 22, 64 18Z"
        fill="white"
      />
      {/* Skull dome */}
      <ellipse cx="32" cy="26" rx="14" ry="13" fill="white" />
      {/* Jaw */}
      <rect x="22" y="36" width="20" height="10" rx="2" fill="white" />
      {/* Left eye socket */}
      <ellipse cx="27" cy="25" rx="4" ry="4.5" fill="#0a0a0a" />
      {/* Right eye socket */}
      <ellipse cx="37" cy="25" rx="4" ry="4.5" fill="#0a0a0a" />
      {/* Nose */}
      <path d="M30 31 L32 28 L34 31 Z" fill="#0a0a0a" />
      {/* Teeth */}
      <rect x="23" y="38" width="4" height="5" rx="1" fill="#0a0a0a" />
      <rect x="30" y="38" width="4" height="5" rx="1" fill="#0a0a0a" />
      <rect x="37" y="38" width="4" height="5" rx="1" fill="#0a0a0a" />
    </svg>
  );
}
