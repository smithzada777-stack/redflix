"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Gift, MessageCircle, Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Customer {
    id: string;
    email: string;
    whatsapp: string;
    planName: string;
}

export default function RemarketingPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [discount, setDiscount] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState<'1month' | '3months' | '6months'>('1month');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/customers');
            const data = await res.json();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getMessage = (customer: Customer) => {
        const promoText = discount > 0 ? `com ${discount}% de desconto exclusivo!` : `com uma condição especial!`;

        const templates = {
            '1month': `Olá! Vimos que seu acesso RedFlix está ativo. Que tal garantir mais 1 mês ${promoText}`,
            '3months': `🔥 Oferta VIP: Renove por 3 meses agora ${promoText} Aproveite a estabilidade 4K.`,
            '6months': `👑 UPGRADE DIAMANTE: 6 meses de RedFlix ${promoText} A melhor escolha para quem não quer interrupções.`
        };

        const link = `${window.location.origin}/checkout/promo/${customer.id}?d=${discount}&t=${selectedTemplate}`;
        return `${templates[selectedTemplate]}\n\nConfira seu desconto aqui: ${link}`;
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openWhatsApp = (customer: Customer) => {
        const message = encodeURIComponent(getMessage(customer));
        const phone = customer.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configurações */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-red-500" />
                                Configurar Promoção
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                        Desconto (%): {discount}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step="5"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase font-bold">
                                        <span>0%</span>
                                        <span>25%</span>
                                        <span>50%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                        Template de Mensagem
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {(['1month', '3months', '6months'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setSelectedTemplate(t)}
                                                className={`p-3 text-sm text-left rounded-lg border transition-all ${selectedTemplate === t
                                                    ? 'bg-red-600/10 border-red-600 text-white'
                                                    : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                                                    }`}
                                            >
                                                {t === '1month' ? 'Plano 1 Mês' : t === '3months' ? 'Plano 3 Meses' : 'Plano 6 Meses'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6">
                            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 text-sm">
                                <MessageCircle className="w-4 h-4" />
                                Dica de Conversão
                            </h3>
                            <p className="text-xs text-blue-300/70 leading-relaxed">
                                Use descontos de 20% a 30% para clientes que estão com o plano vencendo em 2 dias.
                                O gatilho de escassez no checkout simplificado fará o resto.
                            </p>
                        </div>
                    </div>

                    {/* Lista de Clientes */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-6 h-6 text-gray-400" />
                                    Clientes para Remarketing
                                </h1>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Plano Atual</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Buscando base de clientes...</td></tr>
                                        ) : customers.length === 0 ? (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Nenhum cliente disponível.</td></tr>
                                        ) : (
                                            customers.map((c: Customer) => (
                                                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="text-white font-medium text-sm">{c.email}</div>
                                                        <div className="text-gray-500 text-xs font-mono">{c.whatsapp}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                                                            {c.planName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 px-3"
                                                            onClick={() => copyToClipboard(getMessage(c), c.id)}
                                                        >
                                                            {copiedId === c.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            className="h-9 px-3"
                                                            onClick={() => openWhatsApp(c)}
                                                        >
                                                            <MessageCircle className="w-4 h-4 mr-1" />
                                                            WhatsApp
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
