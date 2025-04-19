
import React, { useEffect, useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const gradientMeshStyle: CSSProperties = {
  background:
    `radial-gradient(circle at 20% 20%, rgba(51, 195, 240, 0.7), transparent 70%), ` + // sky blue circle
    `radial-gradient(circle at 75% 70%, rgba(249, 115, 115, 0.4), transparent 70%), ` + // soft red circle
    `radial-gradient(circle at 50% 50%, rgba(254, 247, 205, 0.6), transparent 90%)`,   // soft yellow circle
  filter: "blur(160px) contrast(160%) saturate(140%)",
  position: "absolute",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 5,
  pointerEvents: "none",
  mixBlendMode: "screen" as const,
};

const noiseTextureStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  pointerEvents: "none",
  zIndex: 6,
  background:
    "url('https://www.transparenttextures.com/patterns/noise.png') repeat",
  opacity: 0.2,
  mixBlendMode: "multiply" as const,
};

const BirthdayGreeting = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-visible">
      {/* Gradient Mesh Background */}
      <div style={gradientMeshStyle} />
      {/* Noise overlay for texture */}
      <div style={noiseTextureStyle} />

      {/* Text Container */}
      <div
        className={`relative z-30 text-center font-sans select-none transition-opacity duration-[1500ms] ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Happy Birthday Christian"
      >
        <h1 className="text-6xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-600 to-purple-700 drop-shadow-lg">
          Happy Birthday
        </h1>
        <h2 className="mt-4 text-4xl sm:text-5xl font-semibold text-slate-900 drop-shadow-sm tracking-wide">
          Christian
        </h2>
      </div>
    </div>
  );
};

export default BirthdayGreeting;

