import { motion } from "framer-motion";

export function ProbabilityMeter({
  userPercentile,
  cutoff,
  size = 64,
  strokeWidth = 6,
}) {
  // Logistic function to map percentile difference to probability %
  // k=2 means a difference of +1.5 percentile yields ~95% chance
  const diff = userPercentile - cutoff;
  const k = 2;
  const probabilityRaw = 1 / (1 + Math.exp(-k * diff));
  // Cap at 99% and floor at 1% for realism
  const probability = Math.min(
    99,
    Math.max(1, Math.round(probabilityRaw * 100)),
  );

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  let colorClass = "text-red-500";
  let bgClass = "text-red-500/20";
  if (probability >= 80) {
    colorClass = "text-emerald-500";
    bgClass = "text-emerald-500/20";
  } else if (probability >= 40) {
    colorClass = "text-amber-500";
    bgClass = "text-amber-500/20";
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background Circle */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          className={bgClass}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Animated Progress Circle */}
        <motion.circle
          className={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Text Inside */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-sm text-white leading-none">
          {probability}%
        </span>
      </div>
    </div>
  );
}
