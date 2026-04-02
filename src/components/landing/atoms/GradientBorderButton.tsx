import Link from "next/link";

interface GradientBorderButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function GradientBorderButton({
  href,
  onClick,
  children,
  type = "button",
  disabled = false,
  className = "",
}: GradientBorderButtonProps) {
  const baseStyles = `
    landing-gradient-border
    relative inline-flex items-center justify-center
    px-5 py-2.5 rounded-full
    text-sm font-semibold
    text-[--landing-heading]
    transition-all duration-200
    hover:shadow-lg hover:shadow-pink-200/40
    hover:scale-[1.03]
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer select-none
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseStyles}>
      {children}
    </button>
  );
}
