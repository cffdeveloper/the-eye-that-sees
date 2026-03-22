import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const defaultVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  className?: string;
};

/**
 * Scroll-triggered fade/slide — use for section content below the fold.
 */
export function Reveal({ children, className, delay = 0, ...rest }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-48px", amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      variants={defaultVariants}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
