"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Timer, ShieldCheck, Zap, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

const plans = {
    '1month': { name: "Plano 1 Mês VIP", price: 27.90 },
    '3months': { name: "Plano 3 Meses VIP", price: 67.90 },
    '6months': { name: "Plano 6 Meses VIP", price: 117.90 }
};

const PromoCheckoutContent = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Config from URL
    const discount = parseInt(searchParams.get("d") || "0");
    const template = (searchParams.get("t") || "1month") as keyof typeof plans;

    // Initial State
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "pix">("form");
    const [pixData, setPixData] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    // Plan Logic
    const basePlan = plans[template] || plans['1month'];
    const originalPrice = basePlan.price;
    const finalPrice = discount > 0 ? (originalPrice * (1 - discount / 100)) : originalPrice;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleGeneratePix = async () => {
        setLoading(true);
        try {
            // In a real app, we'd fetch customer email/phone via 'id'
            // For now, we simulate since the user didn't specify a complex customer fetch
            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "promo@cliente.com", // Placeholder
                    whatsapp: "11999999999",    // Placeholder
                    amount: finalPrice,
                    description: `PROMO ${discount}% - ${basePlan.name}`
                })
            });

            const data = await res.json();
            if (data.qrCode) {
                setPixData(data);
                setStep("pix");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center p-4 md:p-8">
            {/* Minimal Header */}
            <div className="w-full max-w-lg flex justify-between items-center mb-10 opacity-60">
                <Image src="/assets/brand/logo.png" alt="RedFlix" width={90} height={30} />
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    Ambiente Criptografado
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/10"
            >
                {/* Status Bar */}
                <div className="bg-red-600/10 text-red-500 py-3 px-6 text-center text-xs font-black uppercase tracking-tighter flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 fill-current" />
                    Bônus de {discount}% liberado por tempo limitado!
                    <span className="ml-2 font-mono bg-red-600 text-white px-2 py-0.5 rounded">{formatTime(timeLeft)}</span>
                </div>

                <div className="p-8">
                    {step === "form" ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-[1.1]">
                                    Aproveite sua oferta <span className="text-red-600">exclusiva</span>.
                                </h1>
                                <p className="text-gray-400 text-sm">
                                    Prepare-se para o melhor conteúdo 4K sem travamentos.
                                </p>
                            </div>

                            {/* Ticket Summary */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8 relative">
                                <Star className="absolute -top-3 -right-3 text-yellow-500 w-8 h-8 fill-yellow-500/20" />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-white font-bold">{basePlan.name}</h3>
                                            <p className="text-xs text-gray-500">Acesso Premium Vitalício*</p>
                                        </div>
                                        <div className="text-right">
                                            {discount > 0 && (
                                                <span className="block text-sm text-gray-500 line-through">R$ {originalPrice.toFixed(2)}</span>
                                            )}
                                            <span className="text-2xl font-black text-white">R$ {finalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1 bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded">
                                            <CheckCircle2 className="w-3 h-3" /> CANAIS ABERTOS/FECHADOS
                                        </div>
                                        <div className="flex items-center gap-1 bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded">
                                            <CheckCircle2 className="w-3 h-3" /> FILMES E SÉRIES
                                        </div>
                                        <div className="flex items-center gap-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-1 rounded">
                                            <CheckCircle2 className="w-3 h-3" /> FUTEBOL AO VIVO
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleGeneratePix}
                                className="w-full h-16 text-lg font-black shadow-[0_0_30px_rgba(229,9,20,0.3)]"
                                loading={loading}
                            >
                                GERAR MEU PIX AGORA
                            </Button>
                        </>
                    ) : (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                            <h2 className="text-xl font-bold text-white mb-2">Escaneie o QR Code</h2>
                            <p className="text-gray-400 text-sm mb-6">Pague agora e receba o acesso no e-mail.</p>

                            <div className="bg-white p-4 rounded-2xl inline-block mb-6">
                                <img src={pixData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Código Copia e Cola</label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={pixData.copyPaste}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-gray-400 truncate"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixData.copyPaste);
                                            alert("Copiado!");
                                        }}
                                    >
                                        COPIAR
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 text-yellow-500 text-sm font-medium">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                                Aguardando pagamento...
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="mt-12 opacity-30 flex flex-col items-center">
                <div className="flex gap-6 mb-4">
                    <Image src="/assets/brand/pix-icon.png" alt="Pix" width={60} height={20} className="grayscale" />
                </div>
                <p className="text-[10px] text-gray-600 text-center max-w-[250px]">
                    Site Seguro. Seus dados estão protegidos por criptografia de ponta a ponta.
                </p>
            </div>
        </div>
    );
};

export default function PromoCheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <PromoCheckoutContent />
        </Suspense>
    );
}
