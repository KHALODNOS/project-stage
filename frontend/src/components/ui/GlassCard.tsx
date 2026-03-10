import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    animate?: boolean;
    hover3d?: boolean;
}

export const GlassCard = ({ children, className, animate = true, hover3d = false }: GlassCardProps) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 20 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : false}
            whileHover={hover3d ? {
                rotateY: 10,
                rotateX: -5,
                scale: 1.02,
                transition: { duration: 0.3 }
            } : { scale: 1.01 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={cn(
                "glass rounded-2xl p-4 transition-all duration-300",
                hover3d && "preserve-3d perspective-1000",
                className
            )}
        >
            <div className={cn(hover3d && "translate-z-10")}>
                {children}
            </div>
        </motion.div>
    );
};
