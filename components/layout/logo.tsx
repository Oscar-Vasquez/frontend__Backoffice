import Link from "next/link";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={className}>
      <img src="/LOGO-WORKEXPRES.png"  className="hidden dark:block" alt="logo letra roja" />
      <img src="/LOGO-ROJO-LETRA.png" className="block dark:hidden" alt="logo letra blanca" />
    </Link>
  );
}
