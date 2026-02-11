'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    { id: 1, name: 'Marcos Vinicius', text: 'O acesso chegou em menos de 1 minuto no meu email, surreal!', color: 'bg-blue-600' },
    { id: 2, name: 'Renata Oliveira', text: 'Suporte nota 10, me ajudaram a configurar na minha Smart TV rápido.', color: 'bg-pink-600' },
    { id: 3, name: 'Dr. Ricardo Menezes', text: 'Serviço extremamente profissional e estável. Recomendo para famílias.', color: 'bg-green-600' },
    { id: 4, name: 'Jeferson Silva', text: 'Top viu, ate os jogo do meu timao em 4K passa certinho sem travar.', color: 'bg-zinc-600' },
    { id: 5, name: 'Bruna Santos', text: 'Os desenho pra criançada salvou muito aqui em casa kkk tem muita coisa.', color: 'bg-purple-600' },
    { id: 6, name: 'Dona Maria Luiza', text: 'Muito fácil de usar, até eu que não entendo de tecnologia consegui instalar.', color: 'bg-yellow-600' },
    { id: 7, name: 'Anderson Costa', text: 'Tava meio assim de comprar mas vale muito a pena pelo preço.', color: 'bg-emerald-600' },
    { id: 8, name: 'Felipe Almeida', text: 'Melhor que qualquer outro serviço e muito mais barato, já indiquei pra geral.', color: 'bg-orange-600' },
    { id: 9, name: 'Sandra Pires', text: 'Amei os canais de culinária e as novelas antigas. Nota mil!', color: 'bg-red-600' },
];

const ProfileAvatar = ({ name, color }: { name: string, color: string }) => {
    return (
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-black text-white text-sm shadow-lg`}>
            {name.charAt(0)}
        </div>
    );
};

export default function Testimonials() {
    return (
        <section className="pt-12 pb-16 bg-black relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-8 px-4">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-white uppercase italic">
                        Vê o que a <span className="text-primary italic drop-shadow-[0_0_15px_rgba(229,9,20,0.4)]">galera</span> tá achando:
                    </h2>
                    <p className="text-gray-500 text-xs md:text-base font-bold uppercase tracking-widest">Relatos reais de quem já economiza com a RedFlix</p>
                </div>

                <div className="relative w-full">
                    {/* Versão MOBILE: Grid Estático 2 Colunas (Exatamente 8 cards) */}
                    <div className="md:hidden grid grid-cols-2 gap-2 py-4 px-1">
                        {testimonials.slice(0, 8).map((t) => (
                            <div
                                key={t.id}
                                className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, starIdx) => (
                                                <svg key={starIdx} className="w-2 h-2 text-primary fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.3)]" />
                                    </div>
                                    <p className="text-gray-800 text-[10px] font-bold italic leading-tight mb-3 line-clamp-4">"{t.text}"</p>
                                </div>
                                <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                                    <div className={`w-6 h-6 rounded-full ${t.color} flex items-center justify-center font-black text-white text-[8px]`}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-black text-black text-[8px] uppercase tracking-tighter truncate">{t.name}</h4>
                                        <span className="text-[6px] font-black text-primary uppercase tracking-tighter block">Verificado</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Versão DESKTOP: Carrossel Animado (Apenas para telas grandes) */}
                    <div className="hidden md:flex overflow-hidden group">
                        <div className="flex animate-marquee gap-8 py-10">
                            {[...testimonials, ...testimonials].map((t, i) => (
                                <div
                                    key={`${t.id}-${i}`}
                                    className="flex-none w-[350px] bg-[#0d0d0d] p-8 rounded-[2rem] border border-white/5 shadow-2xl transition-all duration-500 hover:border-primary/30 hover:bg-[#121212]"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, starIdx) => (
                                                <svg key={starIdx} className="w-3 h-3 text-primary fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                    <p className="text-gray-300 text-base font-medium italic leading-relaxed mb-8 min-h-[80px]">"{t.text}"</p>
                                    <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                                        <ProfileAvatar name={t.name} color={t.color} />
                                        <div>
                                            <h4 className="font-black text-white text-sm uppercase tracking-tighter">{t.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Compra Verificada</span>
                                                <div className="w-1 h-1 bg-gray-800 rounded-full" />
                                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Membro</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Junte-se a milhares de clientes satisfeitos</p>
                </div>
            </div>
        </section>
    );
}
