import Image from "next/image";

/**
 * Bat skull brand mark — save bat-skull.png to /public.
 * mix-blend-mode:screen makes the black background invisible so only
 * the white skull shows against the dark UI.
 */
export default function BatSkull({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/bat-skull.png"
      alt="TatBook"
      width={size}
      height={size}
      className="object-contain"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
