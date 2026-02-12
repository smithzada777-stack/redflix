"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GeneratePixPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        whatsapp: "",
        planName: "Plano Mensal",
        amount: "27.90"
    });
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<any>(null);

    const [paid, setPaid] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setPaid(false);

        try {
            const res = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    description: formData.planName
                })
            });

            const data = await res.json();

            if (data.qrCode) {
                setPixData(data);
                // No alert, just show the PIX
            } else {
                alert('Erro ao gerar PIX');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    // Polling logic for manual PIX
    useEffect(() => {
        let interval: any;
        if (pixData?.txId && !paid) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/check-status?id=${pixData.txId}`);
                    const data = await res.json();
                    if (data.paid) {
                        setPaid(true);
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error('Polling error:', e);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [pixData, paid]);

    const copyPixCode = () => {
        if (pixData?.copyPaste) {
            navigator.clipboard.writeText(pixData.copyPaste);
            alert('Código PIX copiado!');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <QrCode className="w-8 h-8 text-[var(--color-rf-red)]" />
                        <h1 className="text-2xl font-bold text-white">Gerar PIX Manual</h1>
                    </div>

                    {!pixData ? (
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                                    E-mail do Cliente
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-rf-red)] focus:ring-1 focus:ring-[var(--color-rf-red)] outline-none"
                                    placeholder="cliente@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                                    WhatsApp (com DDD)
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-rf-red)] focus:ring-1 focus:ring-[var(--color-rf-red)] outline-none"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                                    Plano
                                </label>
                                <select
                                    value={formData.planName}
                                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-rf-red)] focus:ring-1 focus:ring-[var(--color-rf-red)] outline-none"
                                >
                                    <option value="Plano Mensal">Plano Mensal</option>
                                    <option value="Plano Trimestral">Plano Trimestral</option>
                                    <option value="Plano Anual">Plano Anual</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">
                                    Valor (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-rf-red)] focus:ring-1 focus:ring-[var(--color-rf-red)] outline-none"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full" loading={loading}>
                                GERAR PIX AGORA
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {paid ? (
                                <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/50">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2">PAGAMENTO APROVADO!</h2>
                                        <p className="text-gray-400">O acesso foi enviado para o e-mail do cliente.</p>
                                    </div>
                                    <Button onClick={() => setPixData(null)} variant="success" className="w-full">
                                        Gerar Novo PIX
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                                        <p className="text-green-500 font-bold">✅ PIX Gerado com Sucesso!</p>
                                        <p className="text-gray-400 text-sm mt-1">Aguardando pagamento do cliente...</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl">
                                        <img src={pixData.qrCode} alt="QR Code" className="w-full max-w-xs mx-auto" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Código Copia e Cola:</label>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={pixData.copyPaste}
                                                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white text-sm"
                                            />
                                            <Button onClick={copyPixCode} variant="outline">
                                                COPIAR
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm font-medium animate-pulse py-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        Verificando pagamento em tempo real...
                                    </div>

                                    <Button onClick={() => setPixData(null)} variant="glass" className="w-full">
                                        Cancelar e Gerar Novo
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
