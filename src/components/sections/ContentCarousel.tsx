"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { ContentItem } from "@/data/content";
import { ChevronRight } from "lucide-react";

interface ContentCarouselProps {
    title: string;
    items: ContentItem[];
    variant?: "poster" | "landscape";
}

export const ContentCarousel = ({ title, items, variant = "poster" }: ContentCarouselProps) => {
    const [width, setWidth] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (carouselRef.current) {
            // Calculate the full scroll width minus the visible width to know how much to drag
            // We add some padding to the end so it doesn't stop abruptly
            setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth + 50);
        }
    }, [items]);

    // Dimensions based on variant
    // Sports/Channels often look better a bit wider, movies strictly vertical
    const itemWidth = variant === "poster" ? "w-[160px] md:w-[220px]" : "w-[260px] md:w-[320px]";
    const itemHeight = variant === "poster" ? "aspect-[2/3]" : "aspect-[16/9]";

    return (
        <section className="py-4 md:py-8 overflow-hidden">
            {/* Title / Header (Optional inside component, but flexible) */}
            {title && (
                <div className="flex items-center gap-2 mb-4 px-4 md:px-12 group cursor-pointer">
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-[var(--color-rf-red)] transition-colors">
                        {title}
                    </h2>
                    <div className="text-[var(--color-rf-red)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            )}

            {/* Carousel Container */}
            <motion.div
                ref={carouselRef}
                className="cursor-grab active:cursor-grabbing pl-4 md:pl-12"
                whileTap={{ cursor: "grabbing" }}
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    whileDrag={{ scale: 0.995 }}
                    dragElastic={0.1}
                    className="flex gap-4 md:gap-6"
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={`relative flex-shrink-0 ${itemWidth} ${itemHeight} rounded-lg overflow-hidden group bg-[#111] border border-white/5 transition-all duration-300 hover:z-10 hover:border-white/20 hover:shadow-2xl hover:shadow-red-900/20`}
                            // Initial animation for load
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 150px, 300px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Gradient Overlay (Always present at bottom for text legibility) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                            {/* Content Info */}
                            <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-white text-sm md:text-base font-bold leading-tight drop-shadow-md line-clamp-2">
                                    {item.title}
                                </h3>
                                {/* Hidden meta info effectively revealed on hover */}
                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                        <span className="text-[10px] font-bold text-[var(--color-rf-green)] border border-[var(--color-rf-green)]/30 px-1.5 py-0.5 rounded">98% Match</span>
                                        <span className="text-[10px] text-gray-300 border border-white/20 px-1 py-0.5 rounded">4K</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
};
