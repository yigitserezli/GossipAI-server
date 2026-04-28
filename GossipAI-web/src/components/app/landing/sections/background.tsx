import AuroraShader from "@/components/lightswind/aurora-shader";

export function LandingBackground({ onReady }: { onReady?: () => void }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#02010a]" />
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-78 mix-blend-screen saturate-145">
        <AuroraShader
          colorStops={["#4e2dff", "#ff4fd8", "#3a8dff"]}
          amplitude={1.2}
          blend={0.62}
          speed={1.25}
          onReady={onReady}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-b from-[#02010a]/16 via-[#03010f]/40 to-[#02010a]/70" />
      <div className="pointer-events-none absolute -left-40 -top-28 -z-10 h-80 w-80 rounded-full bg-[#572dff]/32 blur-[140px]" />
      <div className="pointer-events-none absolute -right-24 top-8 -z-10 h-72 w-72 rounded-full bg-[#ff4fd8]/24 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-7rem] left-[28%] -z-10 h-80 w-[26rem] rounded-full bg-[#3b8eff]/22 blur-[150px]" />
    </>
  );
}
