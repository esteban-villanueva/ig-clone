interface EyebrowLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function EyebrowLabel({ children, className = "" }: EyebrowLabelProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-4 py-1.5
        rounded-full
        text-xs font-medium tracking-wide
        bg-white/70 backdrop-blur-sm
        border border-black/8
        text-[--landing-body]
        shadow-sm
        ${className}
      `}
    >
      {children}
    </span>
  );
}
