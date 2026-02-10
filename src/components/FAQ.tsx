'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { q: 'Tenho acesso a TUDO mesmo, sem pegadinhas?', a: 'Sim! Você terá acesso ilimitado a todos os filmes, séries, canais ao vivo, esportes e lançamentos do cinema. Sem taxas extras.' },
    { q: 'E se eu quiser usar em vários aparelhos ao mesmo tempo?', a: 'Nossos planos permitem até 3 telas simultâneas. Você pode assistir na TV da sala, no celular e no tablet ao mesmo tempo sem bloqueios.' },
    { q: 'Preciso ficar preso a um contrato de fidelidade?', a: 'Não! Na RedFlix a liberdade é sua. Você assina e cancela quando quiser, sem multas e sem letras miúdas.' },
    { q: 'O catálogo é atualizado ou vou ver sempre a mesma coisa?', a: 'Atualizamos nosso catálogo diariamente com os últimos lançamentos do cinema e novos episódios de séries assim que saem.' },
    { q: 'E se eu não gostar? Tenho alguma garantia?', a: 'Com certeza. Oferecemos 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.' },
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-16 md:py-24 bg-[#0a0a0a] relative">
            {/* Divider Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(229,9,20,0.3)]" />

            <div className="container mx-auto px-6 max-w-3xl">

                <h2 className="text-2xl md:text-5xl font-black text-center mb-12 md:mb-16 tracking-tight text-white uppercase italic">
                    Ainda tem dúvidas? <span className="text-primary italic">A gente responde.</span>
                </h2>

                <div className="space-y-3 md:space-y-4">
                    {faqs.map((faq, index) => {
                        const isActive = activeIndex === index;
                        return (
                            <div
                                key={index}
                                className={`group relative transition-all duration-500 rounded-2xl overflow-hidden border ${isActive
                                    ? 'bg-[#121212] border-primary/40 shadow-[0_10px_30px_rgba(229,9,20,0.15)] scale-[1.01] md:scale-[1.02]'
                                    : 'bg-[#0d0d0d] border-white/5 hover:border-white/10 hover:bg-[#111111]'
                                    }`}
                            >
                                {/* Active Accent Line */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-primary transition-transform duration-500 scale-y-0 origin-top ${isActive ? 'scale-y-100' : ''}`} />

                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full p-5 md:p-8 text-left flex justify-between items-center gap-4 md:gap-6 relative"
                                >
                                    <span className={`font-black text-base md:text-xl transition-colors duration-300 ${isActive ? 'text-primary' : 'text-white/90'}`}>
                                        {faq.q}
                                    </span>
                                    <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary text-white rotate-180' : 'bg-white/5 text-white/40 group-hover:text-white/60 group-hover:bg-white/10'
                                        }`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-500 ease-in-out px-5 md:px-8 overflow-hidden ${isActive ? 'max-h-96 pb-6 md:pb-8 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="pt-2 border-t border-white/5 text-gray-400 text-sm md:text-lg leading-relaxed font-medium">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
