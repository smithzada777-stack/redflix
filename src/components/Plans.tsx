'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Zap, Tv, Film, Download, Headphones, Users, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const bonuses = [
    { id: 1, icon: Tv, title: '3 Telas Simultâneas', desc: 'Assista no celular, TV e PC ao mesmo tempo.' },
    { id: 2, icon: Zap, title: 'Sem Travamentos', desc: 'Qualidade máxima com tecnologia anti-lag.' },
    { id: 3, icon: Headphones, title: 'Suporte 24h', desc: 'Equipe pronta para te ajudar a qualquer hora.' },
    { id: 4, icon: Shield, title: 'Garantia de 7 Dias', desc: 'Satisfação garantida ou seu dinheiro de volta.' },
    { id: 5, icon: Film, title: '4K Ultra HD', desc: 'Imagem cristalina em todos os dispositivos.' },
    { id: 6, icon: Download, title: 'Modo Offline', desc: 'Baixe seus filmes e assista sem internet.' },
];

const plans = [
    {
        id: 'mensal',
        period: '1 Mês',
        price: '29,90',
        oldPrice: '39,90',
        subtext: 'Plano Mensal (Completo)',
        highlight: false,
        users: 57
    },
    {
        id: 'trimestral',
        period: '3 Meses',
        price: '79,90',
        oldPrice: '89,70',
        save: '11%',
        highlight: true,
        users: 1345
    },
    {
        id: 'anual',
        period: '6 Meses',
        price: '149,90',
        oldPrice: '179,40',
        save: '16%',
        highlight: false,
        users: 570
    },
];

export default function Plans() {
    const router = useRouter();

    const goToCheckout = (id: string, period: string, price: string) => {
        router.push(`/checkout?plan=${id}`);
    };

    return (
        <div id="plans" className="bg-black">

            {/* Bonuses Section - Synced with FAQ style */}
            <section className="py-16 md:py-24 bg-[#0a0a0a] relative overflow-hidden">
                {/* Divider Line (FAQ Style) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(229,9,20,0.3)]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="mb-0">
                        <h2 className="text-xl md:text-4xl font-black text-center mb-10 md:mb-12 text-white uppercase italic tracking-tighter">
                            Bônus <span className="text-primary">Inclusos</span> no seu acesso:
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
                            {bonuses.map((b) => (
                                <div
                                    key={b.id}
                                    className="group relative bg-[#0d0d0d] backdrop-blur-sm border border-white/10 p-5 md:p-6 rounded-[2rem] overflow-hidden transition-all duration-500 hover:bg-[#121212] hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center text-primary shadow-lg group-hover:scale-105 transition-transform duration-500 shrink-0">
                                            <b.icon size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm md:text-base mb-0.5 uppercase tracking-tight">{b.title}</h4>
                                            <p className="text-gray-500 text-[11px] md:text-[12px] font-bold uppercase tracking-wider leading-relaxed">{b.desc}</p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-primary group-hover:w-full transition-all duration-700 delay-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section - Hero Highlight Edition (Synced with FAQ style) */}
            <section id="pricing" className="py-16 md:py-24 bg-black relative overflow-hidden text-white">
                {/* Divider Line (FAQ Style) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(229,9,20,0.3)]" />
                {/* Background Atmosphere - Subtle Red Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
                        <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tighter text-white uppercase italic">
                            Escolha seu plano e <span className="text-primary italic drop-shadow-[0_0_15px_rgba(229,9,20,0.4)]">economize</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-4 md:gap-3 max-w-6xl mx-auto items-center">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`group relative rounded-[2.5rem] flex flex-col transition-all duration-500 border ${plan.highlight
                                    ? 'border-primary/50 bg-[#121212] shadow-[0_25px_80px_rgba(229,9,20,0.25)] py-8 px-6 md:py-10 md:px-8 z-20 scale-[1.05]'
                                    : 'border-white/10 bg-[#0d0d0d] py-6 px-5 md:py-6 md:px-5 z-10 opacity-75 scale-95 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
                                    }`}
                            >
                                {/* Recommended Badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary/30 flex items-center gap-2 whitespace-nowrap z-30">
                                        <Zap size={12} fill="white" />
                                        <span>RECOMENDADO</span>
                                    </div>
                                )}

                                <div className="text-center mb-4">
                                    <h3 className={`text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${plan.highlight ? 'text-primary' : 'text-gray-500'}`}>
                                        {plan.period}
                                    </h3>

                                    <div className={`flex flex-col items-center justify-center ${plan.highlight ? 'min-h-[110px]' : 'min-h-[80px]'}`}>
                                        <div className="h-5">
                                            {plan.oldPrice && (
                                                <span className="text-gray-600 line-through text-md font-bold opacity-50">
                                                    R$ {plan.oldPrice}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-0.5 mt-0.5">
                                            <span className={`font-bold ${plan.highlight ? 'text-xl text-primary/50' : 'text-lg text-white/30'}`}>R$</span>
                                            <span className={`font-black tracking-tighter ${plan.highlight
                                                ? 'text-6xl md:text-7xl text-primary drop-shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                                                : 'text-4xl md:text-5xl text-white'
                                                }`}>
                                                {plan.price.split(',')[0]}
                                            </span>
                                            <span className={`font-bold ${plan.highlight ? 'text-xl text-primary/50' : 'text-lg text-white/30'}`}>
                                                ,{plan.price.split(',')[1]}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {plan.highlight && (
                                    <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />
                                )}

                                <div className={`flex items-center justify-center ${plan.highlight ? 'mb-8 min-h-[40px]' : 'mb-4 min-h-[20px]'}`}>
                                    {plan.save ? (
                                        <div className="bg-green-500/10 px-4 py-1.5 rounded-lg border border-green-500/20">
                                            <p className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <span className="flex h-1.5 w-1.5 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                </span>
                                                Economize {plan.save}
                                            </p>
                                        </div>
                                    ) : plan.subtext ? (
                                        <p className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">{plan.subtext}</p>
                                    ) : null}
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className={`flex items-center justify-center transition-all ${plan.highlight
                                        ? 'bg-black/30 p-4 gap-3 rounded-2xl border border-white/5'
                                        : 'bg-transparent p-1 gap-1.5'
                                        }`}>
                                        <div className={`${plan.highlight ? 'bg-primary/20 text-primary p-2 rounded-lg' : 'text-gray-600'}`}>
                                            <Users size={plan.highlight ? 18 : 14} />
                                        </div>
                                        <div className={plan.highlight ? 'text-left' : 'flex items-center'}>
                                            <span className="text-white/80 font-black text-xs block">+{plan.users.toLocaleString()} Ativos</span>
                                            {plan.highlight && <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest leading-none">Clientes satisfeitos</span>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => goToCheckout(plan.id, plan.period, plan.price)}
                                        className={`group h-12 md:h-14 w-full rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-500 relative overflow-hidden ${plan.highlight
                                            ? 'bg-primary text-white shadow-[0_10px_30px_rgba(229,9,20,0.3)] hover:scale-[1.02]'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                                            }`}>
                                        <span className="relative z-10">{plan.highlight ? 'Quero agora' : 'Assinar'}</span>
                                        <ChevronRight size={16} className={`relative z-10 transition-transform duration-500 group-hover:translate-x-1 ${plan.highlight ? 'text-white' : 'text-primary'}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
