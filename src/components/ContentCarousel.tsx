'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

interface ContentItem {
    id: number;
    name: string;
    img: string;
}

interface CarouselProps {
    title: React.ReactNode;
    items: ContentItem[];
    delay?: number; // Para o efeito sequencial
}

export default function ContentCarousel({ title, items, delay = 0 }: CarouselProps) {
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Duplicar itens para o scroll infinito suave
    const displayItems = [...items, ...items, ...items];

    return (
        <section className="py-4 md:py-8 relative w-full overflow-hidden">
            {/* Subtitle */}
            <h4 className="container mx-auto px-6 md:px-12 text-sm md:text-xl font-bold mb-4 md:mb-6 text-gray-400 uppercase tracking-widest italic">
                {title}
            </h4>

            <div
                className="relative w-full overflow-hidden group pt-4 pb-10"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Lateral Blurs */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

                {/* Carousel Wrapper */}
                <div className="flex w-full">
                    <div
                        className={`flex gap-3 md:gap-4 px-4 animate-scroll ${isPaused ? 'pause-animation' : ''}`}
                        style={{
                            animationDuration: '15s',
                            animationDelay: `${delay}s`
                        }}
                    >
                        {displayItems.map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`}
                                className="flex-none w-[140px] md:w-[180px] lg:w-[calc((100vw-12rem)/5.5)] group/card"
                            >
                                <div className="relative aspect-[2/3] rounded-xl bg-zinc-900 border border-white/5 transition-all duration-500 hover:scale-105 md:group-hover/card:scale-110 group-hover/card:border-primary/50 group-hover/card:shadow-[0_0_20px_rgba(229,9,20,0.5)] cursor-pointer z-10 group-hover/card:z-20">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                                        <Image
                                            src={item.img}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 140px, 180px"
                                        />
                                    </div>
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none rounded-xl" />
                                </div>
                                <p className="mt-3 text-center text-[10px] md:text-sm font-bold text-white uppercase tracking-wider truncate px-2 opacity-70 group-hover/card:opacity-100 transition-opacity">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-scroll {
                    display: flex;
                    animation: scroll linear infinite;
                }
                .pause-animation {
                    animation-play-state: paused !important;
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
            `}</style>
        </section>
    );
}
