interface GradientWordProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientWord({ children, className = "" }: GradientWordProps) {
  return (
    <span
      className={`landing-gradient-text italic font-[800] ${className}`}
      style={{ fontStyle: "italic" }}
    >
      {children}
    </span>
  );
}
