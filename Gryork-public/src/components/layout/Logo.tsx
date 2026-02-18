import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-10 w-auto" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Gryork"
      width={40}
      height={40}
      className={className}
    />
  );
}
