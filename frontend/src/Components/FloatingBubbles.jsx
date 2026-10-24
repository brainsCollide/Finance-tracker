
import { motion, useReducedMotion } from "framer-motion";

const bubbles = [
  {
    size: 100,
    left: "8%",
    duration: 22,
    delay: -8,
    x: [0, 25, -10, 0],
  },
  {
    size: 160,
    left: "25%",
    duration: 30,
    delay: -16,
    x: [0, -30, 20, 0],
  },
  {
    size: 65,
    left: "45%",
    duration: 20,
    delay: -4,
    x: [0, 20, -15, 0],
  },
  {
    size: 130,
    left: "68%",
    duration: 27,
    delay: -12,
    x: [0, -25, 15, 0],
  },
  {
    size: 85,
    left: "88%",
    duration: 24,
    delay: -7,
    x: [0, 15, -20, 0],
  },
];

const FloatingBubbles = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Soft ambient gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(147,197,253,0.35),transparent_40%),radial-gradient(ellipse_at_85%_75%,rgba(103,232,249,0.28),transparent_40%),linear-gradient(135deg,#f8fbff,#eff6ff_50%,#f8fcff)]" />

      {!shouldReduceMotion &&
        bubbles.map((bubble, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full border border-white/70 bg-gradient-to-br from-white/70 to-blue-200/10 shadow-[inset_0_0_25px_rgba(255,255,255,0.5),0_8px_32px_rgba(59,130,246,0.06)] backdrop-blur-sm"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.left,
              bottom: -bubble.size,
            }}
            animate={{
              y: [
                0,
                -window.innerHeight * 0.45,
                -window.innerHeight * 0.8,
                -window.innerHeight * 1.2,
              ],
              x: bubble.x,
              scale: [0.9, 1.05, 1, 0.95],
              opacity: [0, 0.6, 0.45, 0],
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.4, 0.75, 1],
            }}
          />
        ))}
    </div>
  );
};

export default FloatingBubbles;
