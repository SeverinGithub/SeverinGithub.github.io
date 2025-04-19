
import React, { useEffect } from "react";
import BirthdayGreeting from "../components/BirthdayGreeting";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const confettiSetup = () => {
  if (typeof window === "undefined") return;

  const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  interface ConfettiParticle {
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncremental: number;
    tiltAngle: number;
    velocityY: number;
    velocityX: number;
    state: "shooting" | "falling";
  }

  // Male summer color palette for confetti
  const colors = [
    "#33C3F0", // sky blue
    "#2563eb", // blue
    "#22c55e", // green
    "#f97316", // orange
    "#eab308", // yellow
    "#059669", // teal
  ];

  const confetti: ConfettiParticle[] = [];

  const maxConfetti = 200; // more confetti
  const shootingDuration = 2800; // longer shooting phase
  const startTime = performance.now();

  for (let i = 0; i < maxConfetti; i++) {
    confetti.push({
      x: W / 2 + (Math.random() - 0.5) * 320, // wider horizontal spread
      y: H + Math.random() * 150,
      r: Math.random() * 6 + 4,
      d: Math.random() * maxConfetti + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 15) - 10,
      tiltAngleIncremental: Math.random() * 0.08 + 0.05,
      tiltAngle: 0,
      velocityY: -(Math.random() * 23 + 20), // higher flying
      velocityX: (Math.random() - 0.5) * 6,
      state: "shooting",
    });
  }

  let animationFrameId: number;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    confetti.forEach((p) => {
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    update();
  }

  function update() {
    let now = performance.now();
    let elapsed = now - startTime;

    confetti.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;

      if (p.state === "shooting") {
        p.y += p.velocityY;
        p.x += p.velocityX;
        p.velocityY += 0.7; // gravity stronger

        if (elapsed > shootingDuration || p.velocityY >= 0) {
          p.state = "falling";
          p.velocityY = Math.random() * 6 + 3;
          p.velocityX = (Math.random() - 0.5) * 1.8;
          p.y += 5;
        }
      } else if (p.state === "falling") {
        p.y += p.velocityY;
        p.x += p.velocityX;

        p.tilt = Math.sin(p.tiltAngle) * 13;

        // Reset position if below bottom
        if (p.y > H + 15) {
          p.y = H + 15;
        }
      }
    });
  }

  let fadeOpacity = 1;
  function loop() {
    if (!ctx) return;

    draw();

    const allBelow = confetti.every((p) => p.y >= H + 15);
    if (allBelow) {
      fadeOpacity -= 0.004; // slow fade out
      if (fadeOpacity <= 0) {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, W, H);
        return;
      }
      canvas.style.opacity = fadeOpacity.toString();
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  loop();

  const handleResize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(animationFrameId);
    if (ctx) ctx.clearRect(0, 0, W, H);
  };
};

const drinks = [
  { id: 1, name: "Cappuccino" },
  { id: 2, name: "Espresso" },
  { id: 3, name: "Iced Coffee" },
  { id: 4, name: "Coca Cola" },
  { id: 5, name: "Fanta" },
  { id: 6, name: "Spezi" },
  { id: 7, name: "Mineralwasser" },
  { id: 8, name: "Aperol Spritz" },
  { id: 9, name: "Grapefruit-Rosmarin Spritz (Alkoholfrei)" },
  { id: 10, name: "Sanbitter-Ginger Spritz (Alkoholfrei)" },
  { id: 11, name: "Virgin Sunrise" },
  { id: 12, name: "The Red Lemon" },
  { id: 13, name: "Shirly Temple" },
  { id: 14, name: "Moscow Mule" },
];

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = confettiSetup();
    return cleanup;
  }, []);

  return (
    <>
      <BirthdayGreeting />
      <canvas
        id="confetti-canvas"
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-20"
      />
      <main className="max-w-5xl mx-auto px-6 py-12 scroll-smooth select-none">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-gray-900">
          Getränke
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {drinks.map((drink) => (
            <li
              key={drink.id}
              className="border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition cursor-pointer bg-white flex justify-center items-center font-semibold text-gray-800"
              aria-label={drink.name}
            >
              {drink.name}
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-10">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/order")}
            aria-label="Zur Bestellung"
          >
            Zur Bestellung
          </Button>
        </div>
      </main>
    </>
  );
};

export default Index;

