'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative w-full min-h-[600px] md:h-screen text-white overflow-x-clip md:overflow-hidden flex flex-col justify-center">
            {/* Desktop Background Image - Hidden on Mobile */}
            <div className="absolute inset-0 items-center justify-end hidden md:flex">
                {/* Blur vermelho atrás da imagem */}
                <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-[50%] h-[70%] bg-primary/25 blur-[100px] rounded-full"></div>
                <div className="relative w-[70%] h-full">
                    <Image
                        src="https://i.imgur.com/wGZdjw3.png"
                        alt="RedFlix Background"
                        fill
                        className="object-cover object-left"
                        priority
                        sizes="70vw"
                    />
                </div>
            </div>

            {/* Gradients */}
            {/* Gradients - Hidden on mobile to avoid hard edges/clipping */}
            <div className="absolute inset-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent hidden md:block" />
            <div className="absolute inset-0 bottom-0 bg-gradient-to-r from-[#1a0000] via-[#0a0000]/90 to-transparent hidden md:block" />

            {/* Mobile Atmosphere (PC Style) - Glow gigante para evitar cortes (Bug resolvido) */}
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[200%] h-[800px] bg-primary/15 blur-[140px] rounded-full z-0 md:hidden pointer-events-none"></div>

            <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col justify-start md:justify-center text-center md:text-left pt-32 pb-20 md:py-0">
                <div className="max-w-2xl mx-auto md:mx-0 flex flex-col items-center md:items-start">
                    <h1 className="relative z-20 text-[28px] md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] font-[family-name:var(--font-inter)]">
                        Cansado de <span className="text-primary uppercase font-black tracking-tight whitespace-nowrap">pagar caro</span><br />
                        por{' '}
                        <span className="relative inline-block px-1 whitespace-nowrap">
                            catálogos
                            <span className="absolute bottom-0 left-0 right-0 h-[4px] md:h-[5.5px] bg-primary rounded-full -z-10"></span>
                        </span>{' '}
                        <span className="relative inline-block px-1 whitespace-nowrap">
                            limitados?
                            <span className="absolute bottom-0 left-0 right-0 h-[4px] md:h-[5.5px] bg-primary rounded-full -z-10"></span>
                        </span>
                    </h1>
                    <p className="relative z-20 mt-6 text-[13px] md:text-lg text-gray-300 max-w-md mx-auto md:mx-0 leading-relaxed">
                        Pare de pagar e depois pagar novamente, para depois nem ter o filme que você queria.
                    </p>

                    {/* Mobile Image - Subida ainda mais e integrada à atmosfera estilo PC */}
                    <div className="relative z-10 w-[calc(100%+3rem)] -mx-6 h-[260px] -mt-10 mb-4 md:hidden">
                        {/* Brilho orgânico vindo de cima (Estilo PC) para iluminar a subheadline - Intensidade aumentada em +5% */}
                        <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[120%] h-full bg-primary/50 blur-[90px] rounded-full z-10 pointer-events-none"></div>

                        <div className="relative w-full h-full" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)' }}>
                            <Image
                                src="https://i.imgur.com/wGZdjw3.png"
                                alt="RedFlix Mobile"
                                fill
                                className="object-contain scale-110"
                                priority
                                sizes="100vw"
                            />
                        </div>
                    </div>

                    <div className="mt-2 md:mt-8 w-full md:w-auto">
                        <Link href="#pricing" className="w-full md:w-auto block">
                            <button className="relative w-full md:w-auto bg-primary/90 backdrop-blur-md hover:bg-primary text-white font-bold text-base md:text-lg px-8 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all group overflow-hidden border-2 border-white/20 shadow-[0_8px_32px_0_rgba(229,9,20,0.37)]">
                                {/* Border shine effect */}
                                <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" style={{ WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '2px' }}></div>
                                <span className="relative z-10">Assine agora e economize</span>
                                <ArrowRight className="relative z-10 transition-transform group-hover:translate-x-1" size={18} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
