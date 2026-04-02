// FeatureCard — individual static card
interface FeatureCardProps {
  icon: string;
  label: string;
  description: string;
  badge?: string;
  accentColor: string;
}

function FeatureCard({ icon, label, description, badge, accentColor }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-black/6 shadow-sm hover:shadow-md transition-shadow duration-200 min-w-[260px]">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
        style={{ background: accentColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--landing-heading)" }}>
            {label}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--landing-body)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: "📸",
    label: "Comparte momentos",
    description: "Subí fotos, contá tu historia y conectá con personas reales.",
    badge: "Nuevo",
    accentColor: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
  },
  {
    icon: "👥",
    label: "Conecta con amigos",
    description: "Seguí a quienes te inspiran y construí tu comunidad.",
    accentColor: "linear-gradient(135deg, #FCE7F3, #FBCFE8)",
  },
  {
    icon: "💬",
    label: "Conversaciones reales",
    description: "Comentá, reaccioná y mantenete cerca de lo importante.",
    accentColor: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
  },
];

export function FeaturesPreview() {
  return (
    <section className="relative pb-32 overflow-hidden">
      {/* Fade gradient at top to blend with hero */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.0))",
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section label */}
        <p
          className="text-center text-xs font-semibold tracking-[0.15em] uppercase mb-8"
          style={{ color: "var(--landing-muted)" }}
        >
          Todo lo que necesitás, en un solo lugar
        </p>

        {/* Cards row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.label} {...feature} />
          ))}
        </div>
      </div>

      {/* Bottom fade out */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, white)",
        }}
      />
    </section>
  );
}
