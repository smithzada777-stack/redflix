'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
    Users, Phone, Mail, Clock, Shield, Search, LogOut, CheckCircle2,
    AlertCircle, DollarSign, TrendingUp, BarChart3,
    MoreVertical, FileText, Trash2, Smartphone, Send, Calendar, Percent, QrCode, Copy, Loader2, Menu, X
} from 'lucide-react';
import axios from 'axios';

import { generatePixPayload } from '@/lib/pix';

interface Lead {
    id: string;
    email: string;
    phone: string;
    plan: string;
    price: string;
    status: string;
    createdAt: Timestamp | null;
}

// Helper: Parse Price
const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.replace(/[^\d.,]/g, '');
    const dotStr = cleanStr.replace(',', '.');
    const val = parseFloat(dotStr);
    return isNaN(val) ? 0 : val;
};

// Helper: Format Currency
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(val);
};

// Helper: Calculate Expiration Days
const getDaysRemaining = (createdAt: Timestamp | null, plan: string) => {
    if (!createdAt) return 999;
    const startDate = createdAt.toDate();
    let durationDays = 30; // Default Monthly

    const p = plan?.toLowerCase() || '';
    if (p.includes('trimestral') || p.includes('3 meses')) durationDays = 90;
    else if (p.includes('semestral') || p.includes('6 meses')) durationDays = 180;
    else if (p.includes('anual') || p.includes('1 ano') || p.includes('12 meses')) durationDays = 365;
    else if (p.includes('vitalício') || p.includes('vitalicio')) return 9999; // Never expires

    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function AdminDashboard() {
    const SECRET_PASSWORD = 'dviela123';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 Horas em milissegundos

    // Auth State with Persistence
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authChecking, setAuthChecking] = useState(true);

    // Data State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'expiring' | 'pix'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Renewal Modal State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [discount, setDiscount] = useState(0);

    // Pix Generator State
    const [pixAmount, setPixAmount] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [pixName, setPixName] = useState('RedFlix Shop');
    const [pixCity, setPixCity] = useState('Sao Paulo');
    const [generatedPixString, setGeneratedPixString] = useState('');
    const [generatedPixImage, setGeneratedPixImage] = useState('');
    const [pixLoading, setPixLoading] = useState(false);

    // Generate Pix Handler
    const handleGeneratePixCode = async () => {
        if (!pixAmount) return alert('Preencha o valor da cobrança.');
        setPixLoading(true);

        try {
            const response = await axios.post('/api/payment', {
                amount: pixAmount,
                description: `Cobranca Manual - ${pixName}`,
                payerEmail: 'admin@redflix.com', // Admin generated
            });

            const { qrcode_content, qrcode_image_url } = response.data;

            if (qrcode_content) {
                setGeneratedPixString(qrcode_content);
                setGeneratedPixImage(qrcode_image_url);
            } else {
                throw new Error('PushinPay não retornou dados.');
            }
        } catch (error: any) {
            console.error("Erro dashboard pix:", error);
            alert(error.response?.data?.error || 'Erro ao gerar Pix via PushinPay.');
        } finally {
            setPixLoading(false);
        }
    };

    // Check Auth on Mount (Session logic)
    useEffect(() => {
        const storedAuthData = localStorage.getItem('redflix_admin_session');
        if (storedAuthData) {
            try {
                const { timestamp, authenticated } = JSON.parse(storedAuthData);
                const now = Date.now();

                // Verifica se a sessão ainda está no prazo de 24h
                if (authenticated && (now - timestamp < SESSION_DURATION)) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('redflix_admin_session');
                }
            } catch (e) {
                localStorage.removeItem('redflix_admin_session');
            }
        }
        setAuthChecking(false);
    }, []);

    // Firebase Listener
    useEffect(() => {
        if (!isAuthenticated) return;

        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Lead));
            setLeads(data);
            setLoading(false);
        }, (err) => {
            console.error("Erro Firebase:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === SECRET_PASSWORD) {
            setIsAuthenticated(true);
            const sessionData = {
                authenticated: true,
                timestamp: Date.now()
            };
            localStorage.setItem('redflix_admin_session', JSON.stringify(sessionData));
            setPassword(''); // Limpa a senha por segurança
        } else {
            alert('Senha Incorreta!');
            setPassword('');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('redflix_admin_session');
    };

    // --- Computed Metrics (KPIs) ---
    const metrics = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter by Date
        const dateFiltered = leads.filter(l => {
            if (!l.createdAt) return false;
            const d = l.createdAt.toDate();
            if (dateFilter === 'today') return d >= startOfDay;
            if (dateFilter === 'week') return d >= startOfWeek;
            if (dateFilter === 'month') return d >= startOfMonth;
            return true;
        });

        // Filter by Search
        const searchFiltered = dateFiltered.filter(l =>
            l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.phone.includes(searchTerm)
        );

        // Stats Calculation
        const totalRevenue = searchFiltered
            .filter(l => l.status === 'approved')
            .reduce((acc, curr) => acc + parsePrice(curr.price), 0);

        const pendingRevenue = searchFiltered
            .filter(l => l.status === 'pending')
            .reduce((acc, curr) => acc + parsePrice(curr.price), 0);

        const totalApproved = searchFiltered.filter(l => l.status === 'approved').length;
        const totalPending = searchFiltered.filter(l => l.status === 'pending').length;
        const totalLeads = searchFiltered.length;
        const activeConversion = totalLeads > 0 ? (totalApproved / totalLeads) * 100 : 0;

        // Best Selling Plan
        const planCounts: Record<string, number> = {};
        searchFiltered.forEach(l => {
            if (l.status === 'approved') {
                planCounts[l.plan] = (planCounts[l.plan] || 0) + 1;
            }
        });
        const bestSellingPlan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0];

        // Expiring Soon (All Approved sorted by expiration)
        const expiringLeads = leads.filter(l => {
            return l.status === 'approved';
        }).sort((a, b) => getDaysRemaining(a.createdAt, a.plan) - getDaysRemaining(b.createdAt, b.plan));

        return {
            data: searchFiltered.slice(0, rowsPerPage),
            totalFiltered: searchFiltered.length,
            expiring: expiringLeads,
            revenue: totalRevenue,
            pendingRevenue: pendingRevenue,
            approved: totalApproved,
            pending: totalPending,
            leads: totalLeads,
            conversion: activeConversion,
            bestPlan: bestSellingPlan ? bestSellingPlan[0] : 'N/A',
            bestPlanCount: bestSellingPlan ? bestSellingPlan[1] : 0
        };
    }, [leads, searchTerm, dateFilter, rowsPerPage]);

    // --- Actions ---
    const toggleStatus = async (lead: Lead) => {
        const newStatus = lead.status === 'approved' ? 'pending' : 'approved';
        const confirmMsg = newStatus === 'approved'
            ? `Confirmar venda aprovada para ${lead.email}?`
            : `Marcar ${lead.email} como pendente novamente?`;

        if (!confirm(confirmMsg)) return;

        try {
            await updateDoc(doc(db, "leads", lead.id), { status: newStatus });

            if (newStatus === 'approved') {
                const emailRes = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: lead.email,
                        plan: lead.plan,
                        price: lead.price,
                        status: 'approved'
                    })
                });

                const emailData = await emailRes.json();

                if (emailRes.ok) {
                    alert('Sucesso: Venda aprovada e e-mail enviado!');
                } else {
                    console.error("Erro no envio do e-mail:", emailData);
                    alert(`Venda aprovada no Firebase, mas o e-mail falhou: ${emailData.error?.message || 'Verifique o painel do Resend.'}`);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao processar as atualizações.');
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm('Apagar registro permanentemente?')) return;
        try {
            await deleteDoc(doc(db, "leads", id));
            setSelectedLeads(prev => prev.filter(item => item !== id));
        } catch (e) { alert('Erro ao deletar.'); }
    };

    const deleteSelectedLeads = async () => {
        if (selectedLeads.length === 0) return;
        if (!confirm(`Apagar ${selectedLeads.length} registros selecionados permanentemente?`)) return;

        try {
            const deletePromises = selectedLeads.map(id => deleteDoc(doc(db, "leads", id)));
            await Promise.all(deletePromises);
            setSelectedLeads([]);
            alert(`${selectedLeads.length} registros apagados com sucesso.`);
        } catch (e) {
            alert('Erro ao apagar alguns registros.');
        }
    };

    const toggleSelectLead = (id: string) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === metrics.data.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(metrics.data.map(l => l.id));
        }
    };

    // --- Message Generators ---
    const generateMessage = (type: 'renew' | 'upgrade3' | 'upgrade6') => {
        if (!selectedLead) return '';

        const daysLeft = getDaysRemaining(selectedLead.createdAt, selectedLead.plan);
        let msg = '';

        // Base Price Logic - FIXED
        let basePrice = 0;
        let offerPlanName = '';

        if (type === 'renew') {
            // Renovação Simples -> Sempre oferece o Mensal (mesmo que o cliente fosse trimestral antes, a renovação padrão é mensal)
            basePrice = 29.90;
            offerPlanName = 'Plano Mensal';
        } else if (type === 'upgrade3') {
            basePrice = 79.90;
            offerPlanName = 'Plano Trimestral';
        } else if (type === 'upgrade6') {
            basePrice = 149.90;
            offerPlanName = 'Plano Semestral';
        }

        // Apply Discount
        // Desconto é aplicado sobre o preço BASE da oferta, não do plano antigo do cliente
        const finalPriceVal = basePrice * (1 - discount / 100);
        const finalPriceStr = finalPriceVal.toFixed(2).replace('.', ',');

        // Construct Link
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        // Include ONLY lead ID in the link - Professional and Secure
        const link = `${origin}/checkout/simple?plan=${encodeURIComponent(offerPlanName)}&price=${finalPriceStr}&leadId=${selectedLead.id}`;

        let discountText = discount > 0 ? ` com *${discount}% de DESCONTO* 🔥` : '';

        if (type === 'renew') {
            msg = `Olá! Tudo bem? 😃\n\nNós da *RedFlix* vimos que seu plano *${selectedLead.plan}* vence em *${daysLeft} dias*. 📅\n\nNão fique sem assistir! Renove agora (Plano Mensal)${discountText} e continue aproveitando. \n\n👇 *Pague agora com desconto:*\n${link}`;
        } else if (type === 'upgrade3') {
            msg = `Olá! Tenho uma proposta imperdível pra você! 🚀\n\nQue tal trocar seu plano atual pelo *Trimestral*? \n\nVocê garante 3 meses de RedFlix${discountText}, economiza dinheiro e não precisa se preocupar com mensalidade tão cedo! 😉\n\n👇 *Quero o Plano Trimestral:*\n${link}`;
        } else if (type === 'upgrade6') {
            msg = `Opa! Tudo certo? 😎\n\nVocê já é nosso cliente VIP, então consegui liberar uma condição especial no *Plano Semestral*! 💎\n\nAssine 6 meses de uma vez${discountText} e fique tranquilo até o meio do ano que vem! É muita economia. 💸\n\n👇 *Quero o Plano Semestral:*\n${link}`;
        }

        return `https://wa.me/${selectedLead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    };

    // --- Loading / Login UI ---
    if (authChecking) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="w-full max-w-md bg-[#0f0f0f] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="text-center relative z-10 mb-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-primary/20">
                            <Shield className="text-primary" size={40} />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">RedFlix</h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Admin Login</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <input
                            type="password"
                            placeholder="SENHA MESTRA"
                            className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl text-white text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-primary/50 transition-all placeholder:text-[10px] placeholder:tracking-widest placeholder:opacity-30"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="w-full bg-primary hover:bg-red-600 text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:shadow-primary/40 transform hover:-translate-y-1">
                            LOGAR NO SISTEMA
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- Dashboard UI ---
    return (
        <div className="h-[100dvh] md:h-screen bg-[#020202] text-white font-sans flex overflow-hidden">

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:relative inset-y-0 left-0 z-[70] transition-all duration-300 border-r border-white/5 bg-[#050505] flex flex-col justify-between 
                ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 md:w-20 lg:w-64'}`}>
                <div>
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex-none flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="font-black italic text-lg text-white">R</span>
                        </div>
                        <span className={`font-black italic text-xl tracking-tight ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>REDFLIX <span className="text-primary text-[10px] tracking-widest font-normal ml-1">ADMIN</span></span>
                    </div>

                    <nav className="mt-8 px-4 space-y-2">
                        <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} title="Visão Geral" className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <TrendingUp size={20} className="flex-none" />
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>Visão Geral</span>
                        </button>
                        <button onClick={() => { setActiveTab('expiring'); setIsSidebarOpen(false); }} title="Renovações" className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${activeTab === 'expiring' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <Clock size={20} className="flex-none" />
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>Renovações</span>
                            {(isSidebarOpen || true) && metrics.expiring.length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded ml-auto">{metrics.expiring.length}</span>}
                        </button>
                        <button onClick={() => { setActiveTab('pix'); setIsSidebarOpen(false); }} title="Gerador Pix" className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${activeTab === 'pix' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <QrCode size={20} className="flex-none" />
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>Gerador Pix</span>
                        </button>
                    </nav>
                </div>
                <div className="p-4">
                    <button onClick={handleLogout} title="Sair" className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <LogOut size={20} className="flex-none" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-[#050505]/90 backdrop-blur-md z-50 border-b border-white/5 p-4 flex justify-between items-center h-16">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-black italic text-lg text-white">REDFLIX</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-[100dvh] md:h-screen relative pt-16 md:pt-0">
                {activeTab === 'overview' && (
                    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

                        {/* Header & Filters */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-black italic text-white">Dashboard Principal</h2>
                                <p className="text-xs text-gray-500 mt-1">Visão geral de desempenho e vendas.</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {['today', 'week', 'month', 'all'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setDateFilter(f as any)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${dateFilter === f ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10'
                                            }`}
                                    >
                                        {f === 'today' ? 'Hoje' : f === 'week' ? 'Semana' : f === 'month' ? 'Mês' : 'Total'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Revenue */}
                            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><DollarSign size={16} /></div>
                                    <div className="h-4 w-12 bg-white/5 rounded flex items-end justify-between px-1 pb-0.5">
                                        <div className="w-0.5 bg-green-500/50 h-[40%] rounded-t"></div>
                                        <div className="w-0.5 bg-green-500/50 h-[70%] rounded-t"></div>
                                        <div className="w-0.5 bg-green-500/50 h-[50%] rounded-t"></div>
                                        <div className="w-0.5 bg-green-500 h-[100%] rounded-t"></div>
                                    </div>
                                </div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Receita Gerada</h3>
                                <p className="text-xl font-black text-white italic mt-1">{formatCurrency(metrics.revenue)}</p>
                            </div>

                            {/* Pending Sales */}
                            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Clock size={16} /></div>
                                    <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-bold">Ação Necessária</span>
                                </div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vendas Pendentes</h3>
                                <p className="text-xl font-black text-white italic mt-1">{formatCurrency(metrics.pendingRevenue)}</p>
                                <p className="text-[9px] text-gray-600 mt-1">{metrics.pending} aguardando pagamento</p>
                            </div>

                            {/* Best Selling Plan */}
                            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><CheckCircle2 size={16} /></div>
                                </div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plano Mais Vendido</h3>
                                <p className="text-lg font-black text-white italic mt-1 truncate">{metrics.bestPlan}</p>
                                <p className="text-[9px] text-gray-600 mt-1">{metrics.bestPlanCount} vendas totais</p>
                            </div>

                            {/* Conversion */}
                            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><TrendingUp size={16} /></div>
                                </div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Taxa de Conversão</h3>
                                <p className="text-xl font-black text-white italic mt-1">{metrics.conversion.toFixed(1)}%</p>
                                <p className="text-[9px] text-gray-600 mt-1">Leads para Vendas</p>
                            </div>
                        </div>

                        {/* Search & Main Table */}
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-bold text-white">Últimas Transações</h3>
                                    {selectedLeads.length > 0 && (
                                        <button
                                            onClick={deleteSelectedLeads}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20"
                                        >
                                            <Trash2 size={12} />
                                            Apagar Selecionados ({selectedLeads.length})
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Linhas:</span>
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                            className="bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-[10px] text-white focus:outline-none focus:border-primary/50"
                                        >
                                            {[5, 10, 20, 50].map(v => (
                                                <option key={v} value={v} className="bg-[#0f0f0f]">{v}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar lead..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.length === metrics.data.length && metrics.data.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-500">#</th>
                                            {['Cliente', 'Plano', 'Valor', 'Data/Hora', 'Status', 'Ações'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {metrics.data.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center py-12 text-gray-500 text-xs">Nenhum registro encontrado.</td></tr>
                                        ) : (
                                            metrics.data.map((lead, index) => (
                                                <tr key={lead.id} className={`hover:bg-white/[0.02] transition-colors ${selectedLeads.includes(lead.id) ? 'bg-primary/5' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLeads.includes(lead.id)}
                                                            onChange={() => toggleSelectLead(lead.id)}
                                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] font-mono text-gray-600">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="text-xs font-bold text-white mb-0.5">{lead.email}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{lead.phone}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-white/5 text-gray-300 px-2 py-1 rounded text-[10px] font-bold border border-white/5">{lead.plan}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-300">
                                                        {formatCurrency(parsePrice(lead.price))}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[10px] text-gray-300 font-bold">
                                                            {lead.createdAt?.toDate().toLocaleDateString('pt-BR')}
                                                        </div>
                                                        <div className="text-[9px] text-gray-600">
                                                            {lead.createdAt?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${lead.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                            }`}>
                                                            {lead.status === 'approved' ? 'Aprovado' : 'Pendente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors">
                                                                <Phone size={14} />
                                                            </a>
                                                            <button onClick={() => toggleStatus(lead)} className="p-2 bg-white/5 text-gray-400 rounded hover:bg-primary hover:text-white transition-colors">
                                                                {lead.status === 'approved' ? <LogOut size={14} /> : <CheckCircle2 size={14} />}
                                                            </button>
                                                            <button onClick={() => deleteLead(lead.id)} className="p-2 bg-white/5 text-gray-400 rounded hover:bg-red-500 hover:text-white transition-colors">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expiring' && (
                    // --- EXPIRING SOON LIST TAB ---
                    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
                        <div>
                            <h2 className="text-2xl font-black italic text-white flex items-center gap-2">
                                <Clock className="text-primary" />
                                Gestão de Renovações
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Lista completa de clientes ativos e datas de vencimento.</p>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] border-b border-white/5">
                                        <tr>
                                            {['Cliente', 'Plano Atual', 'Situação', 'Cobrança Inteligente'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {metrics.expiring.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-12 text-gray-500 text-xs">Nenhum cliente ativo no momento.</td></tr>
                                        ) : (
                                            metrics.expiring.map(lead => {
                                                const daysLeft = getDaysRemaining(lead.createdAt, lead.plan);
                                                const isUrgent = daysLeft <= 7;
                                                const isExpired = daysLeft < 0;

                                                let statusColor = 'text-green-500';
                                                let statusText = `${daysLeft} dias restantes`;

                                                if (isExpired) {
                                                    statusColor = 'text-gray-500';
                                                    statusText = `Expirado há ${Math.abs(daysLeft)} dias`;
                                                } else if (isUrgent) {
                                                    statusColor = 'text-red-500 font-bold';
                                                    statusText = `Expira em ${daysLeft} dias`;
                                                }

                                                return (
                                                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <div className="text-xs font-bold text-white mb-0.5">{lead.email}</div>
                                                                <div className="text-[10px] text-gray-500 font-mono">{lead.phone}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-white/5 text-gray-300 px-2 py-1 rounded text-[10px] font-bold border border-white/5">{lead.plan}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {isUrgent && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                                                                <span className={`text-xs ${statusColor}`}>{statusText}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLead(lead);
                                                                    setDiscount(0); // Reset discount
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest border border-green-600/20"
                                                            >
                                                                <Smartphone size={14} />
                                                                Enviar Proposta
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal de Envio de Mensagem */}
                        {selectedLead && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                    >
                                        <LogOut size={20} className="rotate-45" /> {/* Close Icon */}
                                    </button>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                                            <Send size={20} className="text-green-500" />
                                            Enviar Proposta WhatsApp
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Para: <span className="text-white font-bold">{selectedLead.email}</span></p>
                                    </div>

                                    {/* Discount Slider */}
                                    <div className="mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="flex items-center justify-between text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
                                            <span className="flex items-center gap-2"><Percent size={14} className="text-primary" /> Aplicar Desconto Especial</span>
                                            <span className="text-primary">{discount}% OFF</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            step="5"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-[9px] text-gray-600 mt-2 font-mono">
                                            <span>0%</span>
                                            <span>15%</span>
                                            <span>30%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <a
                                            href={generateMessage('renew')}
                                            target="_blank"
                                            onClick={() => setSelectedLead(null)}
                                            className="block w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-green-500/50 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-white uppercase tracking-widest">Renovação Simples</span>
                                                <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-bold">Padrão</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 group-hover:text-gray-300">"Olá! Seu plano vence em X dias. Renove agora..."</p>
                                        </a>

                                        <a
                                            href={generateMessage('upgrade3')}
                                            target="_blank"
                                            onClick={() => setSelectedLead(null)}
                                            className="block w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-white uppercase tracking-widest">Upsell Trimestral</span>
                                                <span className="text-[10px] bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded font-bold">Ticket Médio  🚀</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 group-hover:text-gray-300">Oferece o plano de 3 meses com vantagem de economia.</p>
                                        </a>

                                        <a
                                            href={generateMessage('upgrade6')}
                                            target="_blank"
                                            onClick={() => setSelectedLead(null)}
                                            className="block w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-white uppercase tracking-widest">Upsell Semestral</span>
                                                <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded font-bold">Fidelização 💎</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 group-hover:text-gray-300">Proposta agressiva para fechar 6 meses de uma vez.</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pix' && (
                    // --- PIX GENERATOR TAB ---
                    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto h-full flex flex-col justify-center">
                        <div>
                            <h2 className="text-2xl font-black italic text-white flex items-center gap-2">
                                <QrCode className="text-primary" />
                                Gerador de Pix Copy & Paste
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Crie cobranças instantâneas para enviar via WhatsApp.</p>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Valor da Cobrança (R$)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 29,90"
                                            value={pixAmount}
                                            onChange={(e) => setPixAmount(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-black tracking-tighter focus:border-primary/50 focus:outline-none placeholder:text-gray-700"
                                        />
                                        <p className="text-[10px] text-gray-600 mt-2 italic">* A cobrança será gerada na conta PushinPay configurada.</p>
                                    </div>

                                    <button
                                        onClick={handleGeneratePixCode}
                                        disabled={pixLoading}
                                        className="w-full bg-primary hover:bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50"
                                    >
                                        {pixLoading ? <Loader2 className="animate-spin" size={18} /> : (
                                            <>
                                                <QrCode size={18} />
                                                GERAR COBRANÇA PUSHINPAY
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-6 border border-white/5 relative">
                                    {generatedPixString ? (
                                        <>
                                            <div className="bg-white p-4 rounded-xl mb-6 border-4 border-primary/20">
                                                <img
                                                    src={generatedPixImage.startsWith('data:') ? generatedPixImage : `data:image/png;base64,${generatedPixImage}`}
                                                    alt="QR Code Pix"
                                                    className="w-48 h-48 object-contain"
                                                />
                                            </div>
                                            <div className="w-full relative">
                                                <input
                                                    readOnly
                                                    value={generatedPixString}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-[10px] text-gray-400 font-mono truncate focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(generatedPixString)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
                                                    title="Copiar"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-4 animate-pulse">
                                                <CheckCircle2 size={12} className="inline mr-1" />
                                                Pronto para envio
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center opacity-30">
                                            <QrCode size={64} className="mx-auto mb-4" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Aguardando dados...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}

