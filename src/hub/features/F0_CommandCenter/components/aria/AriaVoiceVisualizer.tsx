// src/hub/features/F0_CommandCenter/components/aria/AriaVoiceVisualizer.tsx
import React from 'react';
import { motion } from 'framer-motion';

const AriaVoiceVisualizer: React.FC = () => {
  const bars = Array.from({ length: 40 });

  return (
    <div className="flex items-center justify-center space-x-[2px] h-8 w-full overflow-hidden">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [
              Math.random() * 20 + 4,
              Math.random() * 30 + 10,
              Math.random() * 20 + 4
            ]
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-[2px] bg-purple-500/40 rounded-full"
          style={{
            backgroundColor: i % 5 === 0 ? '#a855f7' : '#7c3aed'
          }}
        />
      ))}
    </div>
  );
};

export default AriaVoiceVisualizer;
