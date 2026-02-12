"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DollarSign,
    Clock,
    CheckCircle,
    TrendingUp,
    Calendar,
    Send,
    QrCode,
    Users,
    Bell,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Sale {
    id: string;
    email: string;
    whatsapp: string;
    amount: number;
    planName: string;
    status: 'pending' | 'approved';
    createdAt: any;
    paidAt?: any;
}

interface Stats {
    totalRevenue: number;
    pendingAmount: number;
    approvedAmount: number;
    topPlan: string;
    totalSales: number;
    pendingSales: number;
    approvedSales: number;
}

export default function DashboardAdmin() {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalRevenue: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        topPlan: 'N/A',
        totalSales: 0,
        pendingSales: 0,
        approvedSales: 0
    });
    const [period, setPeriod] = useState<'today' | 'yesterday' | 'custom'>('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSales();
    }, [period, customStart, customEnd]);

    const loadSales = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ period });
            if (period === 'custom' && customStart && customEnd) {
                params.append('start', customStart);
                params.append('end', customEnd);
            }

            const res = await fetch(`/api/admin/sales?${params}`);
            const data = await res.json();

            setSales(data.sales || []);
            calculateStats(data.sales || []);
        } catch (error) {
            console.error('Error loading sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (salesData: Sale[]) => {
        const approved = salesData.filter((s: Sale) => s.status === 'approved');
        const pending = salesData.filter((s: Sale) => s.status === 'pending');

        const totalRevenue = approved.reduce((sum, s) => sum + s.amount, 0);
        const pendingAmount = pending.reduce((sum, s) => sum + s.amount, 0);

        // Find top plan
        const planCounts: Record<string, number> = {};
        salesData.forEach((s: Sale) => {
            planCounts[s.planName] = (planCounts[s.planName] || 0) + 1;
        });
        const topPlan = Object.entries(planCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
            totalRevenue,
            pendingAmount,
            approvedAmount: totalRevenue,
            topPlan,
            totalSales: salesData.length,
            pendingSales: pending.length,
            approvedSales: approved.length
        });
    };

    const handleApproveSale = async (id: string) => {
        if (!confirm("Confirmar aprovação manual desta venda? O cliente receberá o e-mail de acesso.")) return;

        try {
            const res = await fetch('/api/admin/sales/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                alert("Venda aprovada com sucesso!");
                loadSales();
            } else {
                const data = await res.json();
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert("Erro de conexão ao aprovar venda.");
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        router.push("/dashredflix");
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard RedFlix</h1>
                    <p className="text-gray-400 text-sm">Gestão completa de vendas</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                </Button>
            </header>

            {/* Period Filter */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
                <span className="text-gray-400 text-sm font-bold">Período:</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'today' ? 'bg-[var(--color-rf-red)] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => setPeriod('yesterday')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'yesterday' ? 'bg-[var(--color-rf-red)] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Ontem
                    </button>
                    <button
                        onClick={() => setPeriod('custom')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === 'custom' ? 'bg-[var(--color-rf-red)] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Personalizado
                    </button>
                </div>

                {period === 'custom' && (
                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white text-sm"
                        />
                        <span className="text-gray-500">até</span>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-white text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={DollarSign}
                    label="Faturamento Total"
                    value={`R$ ${stats.totalRevenue.toFixed(2)}`}
                    color="text-green-500"
                />
                <StatCard
                    icon={Clock}
                    label="Valores Pendentes"
                    value={`R$ ${stats.pendingAmount.toFixed(2)}`}
                    color="text-yellow-500"
                    subtitle={`${stats.pendingSales} vendas`}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Valores Aprovados"
                    value={`R$ ${stats.approvedAmount.toFixed(2)}`}
                    color="text-green-500"
                    subtitle={`${stats.approvedSales} vendas`}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Plano Mais Vendido"
                    value={stats.topPlan}
                    color="text-purple-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Button
                    className="w-full h-20 text-lg"
                    onClick={() => router.push('/dashredflix/admin/generate-pix')}
                >
                    <QrCode className="w-6 h-6 mr-2" />
                    Gerar PIX Manual
                </Button>
                <Button
                    variant="glass"
                    className="w-full h-20 text-lg"
                    onClick={() => router.push('/dashredflix/admin/renewals')}
                >
                    <Bell className="w-6 h-6 mr-2" />
                    Renovações
                </Button>
                <Button
                    variant="glass"
                    className="w-full h-20 text-lg"
                    onClick={() => router.push('/dashredflix/admin/remarketing')}
                >
                    <Send className="w-6 h-6 mr-2" />
                    Remarketing
                </Button>
            </div>

            {/* Sales Table */}
            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Vendas ({stats.totalSales})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Plano</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Nenhuma venda encontrada neste período.
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{sale.email}</div>
                                            <div className="text-gray-500 text-sm">{sale.whatsapp}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{sale.planName}</td>
                                        <td className="px-6 py-4 text-white font-bold">R$ {sale.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${sale.status === 'approved'
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                {sale.status === 'approved' ? 'Aprovado' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(sale.createdAt?.seconds * 1000 || Date.now()).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApproveSale(sale.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors uppercase"
                                                >
                                                    Aprovar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, subtitle }: any) {
    return (
        <div className="bg-[#111] border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 font-medium">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
    );
}
