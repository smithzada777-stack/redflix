'use client';

import { useState, useEffect } from 'react';

// SVG Logos Component (Restaurado com Imagens Reais)
const CompetitorLogo = ({ name, className = "", color = "currentColor" }: { name: string, className?: string, color?: string }) => {
    const logos: { [key: string]: string } = {
        'Netflix': 'https://i.imgur.com/ixKdf90.png',
        'Prime Video': 'https://i.imgur.com/YYOnwF2.png',
        'Disney+': 'https://i.imgur.com/BnfH5h1.png',
        'HBO Max': 'https://i.imgur.com/dMvm88t.png',
        'Globoplay': 'https://i.imgur.com/gRTAJPs.png'
    };

    const logoUrl = logos[name];

    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt={`${name} Logo`}
                className={`${className} object-contain`}
            />
        );
    }

    return <span style={{ color }}>{name}</span>;
};

const competitors = [
    { name: 'Netflix', price: 55.90, yearly: 670.80, color: '#E50914' },
    { name: 'Prime Video', price: 19.90, yearly: 238.80, color: '#00A8E1' },
    { name: 'Disney+', price: 33.90, yearly: 406.80, color: '#113CCF' },
    { name: 'HBO Max', price: 34.90, yearly: 418.80, color: '#9933CC' },
    { name: 'Globoplay', price: 24.90, yearly: 298.80, color: '#FF7A00' },
];

export default function PriceComparison() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance carousel (VELOCIDADE TURBO: 1.5s)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % competitors.length);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    const currentCompetitor = competitors[currentSlide];

    return (
        <section className="py-20 md:py-28 bg-[#0f0f0f] rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Headline Section */}
                <div className="text-center max-w-5xl mx-auto mb-16 md:mb-20">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
                        Você <span className="text-primary font-black">paga mensalidade</span>... e ainda <span className="text-primary font-black">cobram mais</span> por filmes?
                    </h2>

                    <div className="inline-block relative">
                        <p className="text-lg md:text-2xl font-black text-white relative z-10">
                            Sim, veja a diferença absurda:
                        </p>
                        <div className="absolute bottom-[-2px] left-0 right-0 h-[4px] md:h-[5.5px] bg-primary rounded-full -z-0"></div>
                    </div>
                </div>

                {/* Comparison Card Mobile (EXCLUSIVA) */}
                <div className="flex md:hidden flex-col gap-8 items-center justify-center max-w-sm mx-auto">
                    <div className="relative w-full group">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-gray-200 text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border-2 border-white">VOCÊ PAGA NA</div>
                        <div className="w-full h-[300px] bg-[#0d0d0d] border-2 rounded-2xl p-5 text-center flex flex-col justify-between transition-colors duration-500" style={{ borderColor: currentCompetitor.color }}>
                            <div className="flex items-center justify-center py-2 h-12">
                                <CompetitorLogo name={currentCompetitor.name} className="h-8 w-auto" />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500 text-[10px] font-bold uppercase">Valor absurdo</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs text-gray-400 font-bold">R$</span>
                                    <span className="text-4xl font-black text-white">{currentCompetitor.price.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <span className="text-gray-500 text-[10px] font-bold">por mês</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                <p className="text-white font-bold text-sm">R$ {currentCompetitor.yearly.toFixed(2).replace('.', ',')} /ano</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-black text-sm z-20 border-2 border-primary">VS</div>

                    <div className="relative w-full">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-primary text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg border-2 border-red-400">NA REDFLIX</div>
                        <div className="w-full h-[360px] bg-gradient-to-b from-[#1a0505] to-black border-2 border-primary rounded-2xl p-5 text-center flex flex-col justify-between shadow-[0_0_30px_rgba(229,9,20,0.2)]">
                            <div className="py-2"><h3 className="text-2xl font-black text-white italic">TUDO <span className="text-primary text-3xl">LIBERADO</span></h3></div>
                            <div className="flex flex-col items-center">
                                <span className="text-primary text-[10px] font-bold uppercase">Preço Único</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs text-primary font-bold">R$</span>
                                    <span className="text-5xl font-black text-white">29,90</span>
                                </div>
                                <span className="text-gray-400 text-[10px] font-bold">por mês</span>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-white/5 rounded-lg p-2 border border-primary/20">
                                    <div className="flex justify-center gap-4 opacity-50">
                                        {competitors.slice(0, 3).map(c => <CompetitorLogo key={c.name} name={c.name} className="h-3 w-auto" />)}
                                    </div>
                                </div>
                                <div className="bg-primary/20 rounded-lg p-2 border border-primary/30"><p className="text-white font-bold text-xs italic">Economize + de R$ 2.000</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- VERSÃO DESKTOP --- */}
                <div className="hidden md:flex gap-12 items-center justify-center max-w-6xl mx-auto">
                    <div className="relative w-full max-w-sm group">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 bg-gray-200 text-black px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transform -rotate-2 border-2 border-white whitespace-nowrap">VOCÊ PAGA NA</div>
                        <div className="w-full h-[440px] bg-[#0a0a0a] border-2 rounded-3xl p-8 pb-4 text-center relative overflow-hidden flex flex-col transition-colors duration-500" style={{ borderColor: currentCompetitor.color }}>
                            <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${currentCompetitor.color}, transparent 70%)` }} />
                            <div className="relative z-10 h-20 flex items-center justify-center mt-2">
                                <CompetitorLogo name={currentCompetitor.name} className="h-16 w-auto max-w-[180px]" />
                            </div>
                            <div className="relative z-10 h-36 flex flex-col items-center justify-center">
                                <span className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">Sai por</span>
                                <div className="flex items-baseline gap-1"><span className="text-xl text-gray-400 font-bold">R$</span><span className="text-5xl font-bold text-white">{currentCompetitor.price.toFixed(2).replace('.', ',')}</span></div>
                                <span className="text-gray-500 font-bold text-base mt-1">p/mês</span>
                            </div>
                            <div className="mt-auto mb-6 mx-4 relative z-10">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-white/60 text-[10px] uppercase tracking-wide mb-1 font-bold">Total em 1 ano</p>
                                    <p className="text-white font-bold text-lg">R$ {currentCompetitor.yearly.toFixed(2).replace('.', ',')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center font-black text-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] z-20 border-4 border-[#0f0f0f]">VS</div>

                    <div className="relative w-full max-w-sm">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 bg-primary text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(229,9,20,0.4)] transform rotate-2 border-2 border-[#ff4d4d]">NA REDFLIX</div>
                        <div className="w-full h-[440px] bg-gradient-to-b from-[#1a0505] to-black border-2 border-primary rounded-3xl p-8 pb-4 text-center relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(229,9,20,0.15)]">
                            <div className="absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b from-primary/20 to-transparent"></div>
                            <div className="relative z-10 h-24 flex items-center justify-center mt-2">
                                <h3 className="text-5xl font-black text-white italic tracking-tighter">TUDO <span className="text-primary">LIBERADO:</span></h3>
                            </div>
                            <div className="relative z-10 h-36 flex flex-col items-center justify-center">
                                <span className="text-primary font-bold text-xs mb-1 uppercase tracking-wider">Apenas</span>
                                <div className="flex items-baseline gap-1"><span className="text-xl text-primary font-bold">R$</span><span className="text-6xl font-bold text-white tracking-normal drop-shadow-md">29,90</span></div>
                                <span className="text-gray-400 font-bold text-base mt-1">p/mês</span>
                            </div>
                            <div className="mt-auto mb-2 relative z-10 w-full px-8">
                                <div className="bg-neutral-100/5 rounded-xl p-3 border border-primary/20 mb-2">
                                    <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-bold">Inclui conteúdo de:</p>
                                    <div className="flex justify-center gap-6 overflow-hidden">
                                        {/* LOGOS EM VELOCIDADE DE 8s (IGUAL FILMES) */}
                                        <div className="animate-marquee flex items-center gap-8" style={{ animationDuration: '8s' }}>
                                            {competitors.map(c => <CompetitorLogo key={c.name} name={c.name} className="h-6 w-auto" />)}
                                            {competitors.map(c => <CompetitorLogo key={c.name + 'd'} name={c.name} className="h-6 w-auto" />)}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-primary/10 rounded-xl p-3 border border-primary/20"><p className="text-white font-bold text-lg leading-tight">+ de R$ 2.000 no bolso</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Cost Alert */}
                <div className="mt-10 md:mt-12 bg-white/5 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 md:p-10 max-w-4xl mx-auto text-center relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <p className="text-gray-400 text-sm md:text-xl font-medium leading-relaxed">
                            Assinar todos separadamente custaria <span className="text-white font-bold underline underline-offset-4 decoration-red-500/30">R$ 2.296,80 por ano</span>.
                            <br className="hidden md:block" /><span className="text-primary font-black mt-2 block md:inline md:ml-1 text-sm md:text-base uppercase tracking-wider italic">Aqui você tem tudo isso por muito menos.</span>
                        </p>
                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-xl md:text-3xl font-black text-white mb-4 uppercase italic leading-tight">Vai continuar <span className="text-primary italic">jogando dinheiro fora</span> todo mês?</h3>
                            <a href="#plans" className="inline-block bg-primary hover:bg-red-700 text-white font-black py-4 px-10 rounded-full text-xs md:text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(229,9,20,0.3)]">Quero economizar agora!</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
