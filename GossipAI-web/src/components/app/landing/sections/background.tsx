import AuroraShader from "@/components/lightswind/aurora-shader";

export function LandingBackground({ onReady }: { onReady?: () => void }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-62 mix-blend-screen saturate-125">
        <AuroraShader
          colorStops={["#6f3cff", "#4f67ff", "#b164ff"]}
          amplitude={1.14}
          blend={0.56}
          speed={0.64}
          onReady={onReady}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-[#07060d]/12 via-[#0a0813]/20 to-[#0a0813]/32" />
      <div className="pointer-events-none absolute -left-28 -top-20 -z-10 h-72 w-72 rounded-full bg-(--dt-primary-container)/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-16 -z-10 h-64 w-64 rounded-full bg-(--dt-secondary)/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 -z-10 h-72 w-80 rounded-full bg-(--dt-surface-high)/35 blur-3xl" />
    </>
  );
}
