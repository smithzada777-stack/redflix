"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Play, Info, ChevronRight, CheckCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export const HeroSection = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Parallax effect
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <section className="relative h-[95vh] w-full overflow-hidden">
            {/* Background Image with Parallax */}
            <motion.div
                style={{ y: y1, opacity }}
                className="absolute inset-0 w-full h-full"
            >
                <Image
                    src="https://imgur.com/wGZdjw3.png"
                    alt="Hero Background"
                    fill
                    className="object-cover object-center"
                    priority
                    quality={90}
                />
                {/* Gradient Overlay - Cinematic Fade with reduced opacity for cleaner look */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-rf-bg)] via-[var(--color-rf-bg)]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-rf-bg)]/90 via-transparent to-transparent" />
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-end h-full px-6 pb-24 md:px-16 md:pb-32 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl space-y-6"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-widest text-[var(--color-rf-red)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-rf-red)] animate-pulse" />
                        Novidade Exclusiva
                    </div>

                    {/* Headline - Big & Impactful */}
                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-2xl">
                        Liberdade para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-rf-red)] to-red-600">
                            Assistir Tudo.
                        </span>
                    </h1>

                    {/* Subheadline centered on benefits */}
                    <p className="text-lg md:text-xl text-gray-200 font-medium max-w-lg drop-shadow-md">
                        Sem travamentos. Qualidade 4K. Todos os canais, filmes e séries em um só lugar.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto gap-3 text-lg group"
                            onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                            QUERO TESTAR AGORA
                        </Button>
                        <Button
                            variant="glass"
                            size="lg"
                            className="w-full sm:w-auto gap-3 text-lg"
                        >
                            <Info className="w-6 h-6" />
                            Saiba Mais
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center gap-6 pt-8 text-sm font-medium text-gray-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[var(--color-rf-red)]" />
                            <span>Ativação Imediata</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[var(--color-rf-red)]" />
                            <span>Suporte 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
