import Image from "next/image";

export function Logo({
  size = 32,
  glow = false,
}: {
  size?: number;
  glow?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        glow ? "shadow-glow" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Rota logo"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );
}
