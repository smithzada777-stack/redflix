"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Renewal {
    id: string;
    email: string;
    whatsapp: string;
    planName: string;
    paidAt: any;
    expiresAt: Date;
    daysUntilExpiry: number;
}

export default function RenewalsPage() {
    const router = useRouter();
    const [renewals, setRenewals] = useState<Renewal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRenewals();
    }, []);

    const loadRenewals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/renewals');
            const data = await res.json();
            setRenewals(data.renewals || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sendRenewalReminder = (renewal: Renewal) => {
        const message = encodeURIComponent(`Olá! Seu acesso RedFlix VIP está chegando ao fim (vence em ${renewal.daysUntilExpiry} dias). \n\nNão fique sem seus filmes e séries favoritos! Renove agora mesmo e garanta sua estabilidade.\n\nLink para renovação: ${window.location.origin}/checkout?plan=${renewal.planName.toLowerCase().includes('trimestral') ? 'trimestral' : renewal.planName.toLowerCase().includes('anual') ? 'anual' : 'mensal'}`);
        const phone = renewal.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <Bell className="w-6 h-6 text-yellow-500" />
                            <h1 className="text-2xl font-bold text-white">Renovações Próximas</h1>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                            Assinaturas que vencem nos próximos 7 dias
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Plano</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Vencimento</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : renewals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Nenhuma renovação próxima.
                                        </td>
                                    </tr>
                                ) : (
                                    renewals.map((renewal: Renewal) => (
                                        <tr key={renewal.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{renewal.email}</div>
                                                <div className="text-gray-500 text-sm">{renewal.whatsapp}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{renewal.planName}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-white">{new Date(renewal.expiresAt).toLocaleDateString('pt-BR')}</div>
                                                <div className="text-gray-500 text-sm">{renewal.daysUntilExpiry} dias</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${renewal.daysUntilExpiry <= 3
                                                    ? 'bg-red-500/20 text-red-500'
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {renewal.daysUntilExpiry <= 3 ? 'Urgente' : 'Atenção'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => sendRenewalReminder(renewal)}
                                                >
                                                    <Send className="w-4 h-4 mr-1" />
                                                    Enviar Lembrete
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
    );
}
