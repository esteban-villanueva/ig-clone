// FloatingCard — individual photo card with rotation CSS custom property
interface FloatingCardProps {
  imageUrl: string;
  alt: string;
  rotateDeg: number;
  animationDelay: string;
  side: "left" | "right";
  className?: string;
}

export function FloatingCard({
  imageUrl,
  alt,
  rotateDeg,
  animationDelay,
  side,
  className = "",
}: FloatingCardProps) {
  return (
    <div
      className={`
        absolute hidden lg:block
        rounded-2xl overflow-hidden
        shadow-2xl shadow-black/15
        border-4 border-white
        animate-gentle-float
        ${side === "left" ? "animate-float-in-left" : "animate-float-in-right"}
        ${className}
      `}
      style={
        {
          "--card-rotate": `${rotateDeg}deg`,
          transform: `rotate(${rotateDeg}deg)`,
          animationDelay,
          width: "var(--landing-card-w)",
          height: "var(--landing-card-h)",
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

// FloatingPhotoGrid — positions the cards around the hero
const CARDS = [
  // Left side
  {
    imageUrl: "https://picsum.photos/seed/ig-card-1/320/420",
    alt: "Foto de usuario",
    rotateDeg: -8,
    animationDelay: "0.5s",
    side: "left" as const,
    className: "left-[2%] top-[12%]",
  },
  {
    imageUrl: "https://picsum.photos/seed/ig-card-2/280/360",
    alt: "Momento compartido",
    rotateDeg: 5,
    animationDelay: "0.65s",
    side: "left" as const,
    className: "left-[6%] bottom-[8%]",
  },
  // Right side
  {
    imageUrl: "https://picsum.photos/seed/ig-card-3/300/400",
    alt: "Historia personal",
    rotateDeg: 7,
    animationDelay: "0.55s",
    side: "right" as const,
    className: "right-[1%] top-[8%]",
  },
  {
    imageUrl: "https://picsum.photos/seed/ig-card-4/260/340",
    alt: "Conexión social",
    rotateDeg: -4,
    animationDelay: "0.7s",
    side: "right" as const,
    className: "right-[7%] bottom-[12%]",
  },
];

export function FloatingPhotoGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CARDS.map((card, i) => (
        <FloatingCard key={i} {...card} />
      ))}
    </div>
  );
}
