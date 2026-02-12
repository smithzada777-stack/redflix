"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'style'> {
    variant?: "primary" | "glass" | "success" | "outline";
    size?: "sm" | "md" | "lg" | "xl";
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-[#E50914] text-white hover:bg-[#b00710] shadow-[0_0_20px_rgba(229,9,20,0.5)] border border-transparent hover:shadow-[0_0_30px_rgba(229,9,20,0.7)]",
            glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 shadow-lg",
            success: "bg-[#22c55e] text-black font-bold hover:bg-[#16a34a] shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] border border-green-400/50",
            outline: "bg-transparent border border-white/30 text-white hover:bg-white/5 hover:border-white/60",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg font-bold uppercase tracking-wider",
            xl: "px-10 py-5 text-xl font-black uppercase tracking-widest w-full md:w-auto",
        };

        return (
            <motion.button
                ref={ref} // Framer Motion handles ref slightly differently if passed directly but for simple animate ok
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || props.disabled}
                className={twMerge(
                    "rounded-full transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                    variants[variant],
                    sizes[size],
                    loading && "opacity-70 cursor-not-allowed grayscale",
                    className
                )}
                {...props} // Standard button props
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <span className={clsx(loading && "opacity-0")}>{children}</span>

                {/* Shine effect on hover for primary/success */}
                {(variant === 'primary' || variant === 'success') && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

export { Button };
