import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo-horizontal.png";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand${light ? " brand-light" : ""}`} aria-label="Victors Holdings home">
      <Image src={logo} alt="Victors Holdings" priority height={40} />
    </Link>
  );
}
