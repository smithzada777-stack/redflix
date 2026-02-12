"use client";

import { Check, Star, Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const plans = [
    {
        id: "mensal",
        name: "Plano Mensal",
        price: "27,90",
        period: "/mês",
        popular: false,
        features: [
            "Acesso a Todos os Canais",
            "Filmes e Séries 4K",
            "Sem Travamentos",
            "1 Tela Simultânea"
        ]
    },
    {
        id: "anual",
        name: "Plano Anual",
        price: "147,90",
        period: "/ano",
        economy: "Economize R$ 180,00",
        popular: true,
        features: [
            "Acesso VIP Vitalício (1 Ano)",
            "Conteúdo 4K + HDR",
            "Prioridade no Suporte",
            "2 Telas Simultâneas",
            "Canais Adultos (Opcional)"
        ]
    },
    {
        id: "trimestral",
        name: "Plano Trimestral",
        price: "67,90",
        period: "/3 meses",
        popular: false,
        features: [
            "Acesso Completo",
            "Qualidade 4K Master",
            "Suporte Dedicado",
            "1 Tela Simultânea"
        ]
    }
];

export const PlansSection = () => {
    const router = useRouter();

    const handleSelectPlan = (planId: string) => {
        // Redirect to checkout with plan param
        router.push(`/checkout?plan=${planId}`);
    };

    return (
        <section id="plans" className="py-20 px-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-rf-bg)] via-[#111] to-[var(--color-rf-bg)]" />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                        Escolha seu <span className="text-[var(--color-rf-red)]">Plano VIP</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Libere agora o acesso imediato à maior plataforma de streaming do Brasil.
                        Preços promocionais por tempo limitado.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative p-8 rounded-2xl border ${plan.popular
                                    ? "bg-white/5 border-[var(--color-rf-red)] shadow-[0_0_50px_rgba(229,9,20,0.3)] scale-105 z-10"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                } backdrop-blur-sm flex flex-col gap-6 transition-all duration-300 group`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-rf-red)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-current" />
                                    Mais Vendido
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-bold text-gray-300 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-semibold text-gray-400">R$</span>
                                    <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                                    <span className="text-sm text-gray-500">{plan.period}</span>
                                </div>
                                {plan.economy && (
                                    <span className="inline-block mt-2 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                        {plan.economy}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-4 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                        <div className={`p-1 rounded-full ${plan.popular ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white"}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.popular ? "primary" : "outline"}
                                className="w-full text-lg font-bold"
                                onClick={() => handleSelectPlan(plan.id)}
                            >
                                {plan.popular ? "QUERO ESTE AGORA" : "Assinar Agora"}
                            </Button>

                            {plan.popular && (
                                <p className="text-xs text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-500 fill-current" />
                                    Ativação Imediata
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
