"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function ScrollVehicles() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  // 🚗 Blue Car - Scrolls left to right
  const carX = useTransform(smoothProgress, [0, 1], ["-20vw", "120vw"]);
  const carY = useTransform(smoothProgress, [0, 1], [0, 200]);
  const carRotate = useTransform(smoothProgress, [0, 0.5, 1], [-5, 5, -5]);

  // 🛵 Scooter - Scrolls right to left
  const bikeX = useTransform(smoothProgress, [0, 1], ["120vw", "-20vw"]);
  const bikeY = useTransform(smoothProgress, [0, 1], [50, -150]);
  const bikeRotate = useTransform(smoothProgress, [0, 0.5, 1], [10, -10, 10]);

  // 🛺 Auto - Scrolls left to right, slowly
  const autoX = useTransform(smoothProgress, [0, 1], ["-10vw", "90vw"]);
  const autoY = useTransform(smoothProgress, [0, 1], [300, -50]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      
      {/* Car 1 */}
      <motion.div 
        style={{ x: carX, y: carY, rotate: carRotate }}
        className="absolute top-[15%] text-6xl drop-shadow-2xl"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        🚗
      </motion.div>

      {/* Bike */}
      <motion.div 
        style={{ x: bikeX, y: bikeY, rotate: bikeRotate }}
        className="absolute top-[45%] text-5xl drop-shadow-2xl"
        animate={{ 
          y: [0, 15, 0],
          x: [0, 10, -10, 0]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🛵
      </motion.div>

      {/* Auto */}
      <motion.div 
        style={{ x: autoX, y: autoY }}
        className="absolute bottom-[25%] text-7xl drop-shadow-2xl"
        animate={{ 
          y: [0, -30, 0],
          rotate: [-4, 4, -4]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        🛺
      </motion.div>
      
    </div>
  );
}
