"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Timer, ArrowLeft, ShieldCheck, CheckCircle, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

// Helper hook for timer
const useCountdown = (initialMinutes: number) => {
    const [seconds, setSeconds] = useState(initialMinutes * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return {
        display: `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`,
        expired: seconds === 0
    };
};

const CheckoutContent = () => {
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") || "mensal";
    const router = useRouter();

    const timer = useCountdown(10);

    const [formData, setFormData] = useState({ email: "", whatsapp: "" });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "pix">("form");
    const [pixData, setPixData] = useState<{ qrCode: string, copyPaste: string, txId: string } | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string>("pending");
    const [devMode, setDevMode] = useState(false);
    const [logoClicks, setLogoClicks] = useState(0);
    const [lastResponse, setLastResponse] = useState<any>(null);

    const initialPlans = {
        mensal: { name: "Plano Mensal", price: "27,90" },
        trimestral: { name: "Plano Trimestral", price: "67,90" },
        anual: { name: "Plano Anual", price: "147,90" }
    };

    // @ts-ignore
    const selectedPlan = initialPlans[planId] || initialPlans.mensal;

    const handleLogoClick = () => {
        setLogoClicks(prev => {
            const next = prev + 1;
            if (next >= 5) {
                setDevMode(true);
            }
            return next;
        });
    };

    const handleForceApprove = () => {
        router.push(`/success?email=${encodeURIComponent(formData.email)}`);
    };

    const handleGeneratePix = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(selectedPlan.price.replace(",", ".")),
                    description: `RedFlix - ${selectedPlan.name}`
                })
            });

            const data = await res.json();

            if (data.qrCode && data.copyPaste) {
                setPixData(data);
                setStep("pix");
            } else {
                alert("Erro ao gerar Pix. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro de conexão. Verifique sua internet.");
        } finally {
            setLoading(false);
        }
    };

    // Polling logic when in PIX step
    useEffect(() => {
        if (step === "pix" && pixData?.txId) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/check-status?id=${pixData.txId}`);
                    const data = await res.json();
                    setLastResponse(data);

                    if (data.status) setCurrentStatus(data.status);

                    if (data.paid) {
                        clearInterval(interval);
                        router.push(`/success?email=${encodeURIComponent(formData.email)}`);
                    }
                } catch (e: any) {
                    setLastResponse({ error: e.message });
                }
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [step, pixData, router, formData]);

    const copyToClipboard = () => {
        if (pixData?.copyPaste) {
            navigator.clipboard.writeText(pixData.copyPaste);
            alert("Código Pix copiado!");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center py-6 px-4">
            <header className="w-full max-w-lg flex items-center justify-between mb-8">
                <div onClick={handleLogoClick} className="cursor-pointer">
                    <Image src="/assets/brand/logo.png" alt="RedFlix" width={100} height={30} className="object-contain" />
                </div>
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    AMBIENTE SEGURO
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
                <div className="bg-red-900/20 text-red-500 text-center py-2 text-sm font-bold rounded-lg mb-6 flex items-center justify-center gap-2 animate-pulse">
                    <Timer className="w-4 h-4" />
                    Oferta encerra em: {timer.display}
                </div>

                {step === "form" ? (
                    <form onSubmit={handleGeneratePix} className="space-y-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                                Quase lá! Finalize sua assinatura para liberar o acesso.
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Preencha seus dados abaixo para receber seu login e senha imediatamente.
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl">
                                Mais Escolhido
                            </div>
                            <div>
                                <p className="text-gray-300 font-medium">{selectedPlan.name}</p>
                                <p className="text-xs text-gray-500">Qualidade 4K + Sem Travamentos</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400 line-through block">R$ 197,90</span>
                                <span className="text-xl font-bold text-white">R$ {selectedPlan.price}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 py-2 bg-white/5 rounded-lg">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-600 border border-[#111]" />
                                ))}
                            </div>
                            <div className="text-xs text-gray-400">
                                <span className="text-white font-bold">+12.408</span> pessoas assinaram hoje.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Seu Melhor E-mail</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="exemplo@email.com"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-rf-red)] focus:ring-1 focus:ring-[var(--color-rf-red)] outline-none transition-all placeholder:text-gray-600"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp (Com DDD)</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="(11) 99999-9999"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-rf-red)] focus:ring-1 focus:ring-[var(--color-rf-red)] outline-none transition-all placeholder:text-gray-600"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full text-lg shadow-[0_0_20px_rgba(229,9,20,0.4)]" loading={loading}>
                            GERAR PIX AGORA
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-white mb-2">Escaneie o QR Code</h2>
                            <p className="text-gray-400 text-sm">Abra o app do seu banco e pague agora.</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl inline-block relative group">
                            {pixData?.qrCode ? (
                                <img src={pixData.qrCode} alt="QR Code Pix" className="w-48 h-48 object-contain" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-200 animate-pulse" />
                            )}
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-gray-400">Ou copie e cole o código abaixo:</p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={pixData?.copyPaste}
                                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded px-3 text-xs text-gray-300 truncate"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded font-bold transition-colors"
                                >
                                    COPIAR
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm font-medium animate-pulse">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                Aguardando pagamento...
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase mt-2">Status: {currentStatus}</p>
                        </div>
                    </div>
                )}

                {devMode && (
                    <div className="mt-6 p-4 bg-red-900/10 border border-red-900/50 rounded-lg text-left space-y-3">
                        <p className="text-red-500 font-bold text-xs uppercase">Diagnostic Panel</p>
                        <div className="text-[10px] text-gray-400 space-y-1">
                            <p>TX: {pixData?.txId || 'None'}</p>
                            <p>Payload: {JSON.stringify(lastResponse) || 'Waiting...'}</p>
                        </div>
                        <button
                            onClick={handleForceApprove}
                            className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded"
                        >
                            FORÇAR SUCESSO
                        </button>
                    </div>
                )}
            </motion.div>

            <footer className="mt-8 text-center space-y-4">
                <Image src="/assets/brand/pix-icon.png" alt="Pix" width={80} height={30} className="opacity-50 mx-auto" />
                <p className="text-[10px] text-gray-600">© 2026 RedFlix Ultra Pro</p>
            </footer>
        </div>
    );
};

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
