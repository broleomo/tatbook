import Image from "next/image";

export default function BatSkull({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/bat-skull.jpg"
      alt="TatBook"
      width={size}
      height={size}
      className="object-contain"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
