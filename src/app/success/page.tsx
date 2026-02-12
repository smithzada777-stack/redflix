"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Confetti from "react-confetti"; // We'll install this or simulate it if not available

const SuccessContent = () => {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "seu e-mail";

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-md bg-[#111] border border-green-500/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.2)] relative z-10"
            >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                    <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                </div>

                <h1 className="text-3xl font-black text-white mb-2">Pagamento Aprovado!</h1>
                <p className="text-gray-400 mb-8 text-lg">
                    Parabéns! Seu acesso foi liberado com sucesso.
                </p>

                <div className="space-y-4">
                    <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/20 text-center">
                        <p className="text-sm text-gray-300 mb-1">Enviamos seus dados de acesso para:</p>
                        <p className="text-lg font-bold text-white break-all">{email}</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left space-y-3">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            INSTRUÇÕES IMPORTANTES:
                        </h3>
                        <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                            <p>1. Verifique sua caixa de entrada em até 2 minutos.</p>
                            <p className="bg-yellow-500/10 text-yellow-500 p-2 rounded border border-yellow-500/20 font-bold">
                                ⚠️ IMPORTANTE: Se não encontrar, verifique sua pasta de SPAM ou LIXO ELETRÔNICO.
                            </p>
                            <p>2. Caso tenha digitado o e-mail errado, chame o suporte abaixo.</p>
                        </div>
                    </div>

                    <a
                        href="https://wa.me/5571991644164?text=Ol%C3%A1%2C%20acabei%20de%20fazer%20o%20pagamento%20e%20quero%20meu%20acesso%21"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full pt-2"
                    >
                        <Button variant="success" size="lg" className="w-full gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <MessageCircle className="w-5 h-5" />
                            FALAR COM SUPORTE VIP
                        </Button>
                    </a>
                </div>

                <p className="text-[10px] text-center text-gray-600 mt-8 uppercase tracking-widest font-bold">
                    RedFlix Ultra Pro © 2026
                </p>
            </motion.div>
        </div>
    );
};

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
