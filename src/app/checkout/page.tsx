'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle2, Star, Clock, ShieldCheck,
    Zap, Phone, Mail, QrCode, ArrowLeft,
    Shield, Tv, Film, Headphones, Download, ChevronDown, ChevronUp, Loader2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const testimonials = [
    { name: 'Lucas Rocha', text: 'Acabei de pagar e o email chegou na hora. Impressionante a velocidade!' },
    { name: 'Amanda Lima', text: 'Não acreditava que era vitalício mesmo, mas usei o suporte e confirmaram tudo. 10/10.' },
    { name: 'Roberto Castro', text: 'Qualidade da imagem no 4K é superior a muitos que já usei. Melhor custo benefício.' },
    { name: 'Patrícia Gomes', text: 'Configurei no meu celular e na TV da sala sem dor de cabeça. Muito prático.' },
];

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

function CheckoutContent() {
    const [isMounted, setIsMounted] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const planName = searchParams.get('plan') || 'Plano Mensal';
    const planPrice = searchParams.get('price') || '29,90';

    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [formData, setFormData] = useState({
        email: '',
        phone: ''
    });
    const [showPix, setShowPix] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pixCode, setPixCode] = useState('');
    const [pixImage, setPixImage] = useState('');
    const [activePixId, setActivePixId] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [surpriseStep, setSurpriseStep] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // PAYMENT SUCCESS SYNC (Garante que o banco seja avisado quando o front detecta o pagamento)
    useEffect(() => {
        if (isPaid && activePixId) {
            console.log("--- SINCRONIZANDO APROVAÇÃO COM O BANCO ---");
            axios.get(`/api/check-status?id=${activePixId}`).then(() => {
                console.log("Banco sincronizado e Lead aprovado no Dash.");
            }).catch(err => {
                console.error("Erro na sincronização final:", err);
            });
        }
    }, [isPaid, activePixId]);

    // Payment Monitoring
    useEffect(() => {
        if (!showPix) return;

        console.log("--- INICIANDO MONITORAMENTO DE PAGAMENTO ---");
        const unsubscribers: (() => void)[] = [];

        // 1. Monitoramento Direto da Transação
        if (activePixId) {
            const tid = activePixId.toLowerCase();
            console.log(`Monitorando transação: ${tid}`);
            const unsubscribePayment = onSnapshot(doc(db, "payments", tid), (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    const status = (data.status || '').toLowerCase();
                    console.log(`Status do pagamento (payments/${tid}):`, status);
                    if (['paid', 'approved', 'confirmed', 'sucesso', 'concluido'].includes(status)) {
                        setIsPaid(true);
                    }
                }
            }, (error) => {
                console.error("Erro ao monitorar pagamento (Provável falta de permissão):", error);
            });
            unsubscribers.push(unsubscribePayment);
        }

        // 2. Monitoramento do Lead (Backup rápido)
        const findLeadAndMonitor = async () => {
            if (!formData.email) return;
            const leadsRef = collection(db, "leads");
            // Filtra por email (sem orderBy para evitar erro de índice)
            const q = query(leadsRef, where("email", "==", formData.email), limit(1));
            const unsubscribeLeads = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const leadData = snapshot.docs[0].data();
                    const status = (leadData.status || '').toLowerCase();
                    console.log(`Status do lead (${snapshot.docs[0].id}):`, status);
                    if (['approved', 'paid', 'confirmed', 'atentido'].includes(status)) {
                        setIsPaid(true);
                    }
                }
            }, (error) => {
                console.warn("Erro ao monitorar lead (Ignorando se permissão negada):", error);
            });
            unsubscribers.push(unsubscribeLeads);
        };

        findLeadAndMonitor();

        // 3. Polling de Segurança (A cada 3 segundos - Mais agressivo no início)
        const pollInterval = setInterval(async () => {
            if (isPaid || !activePixId) return;
            try {
                // console.log("Polling de segurança ativo: Checando API...");
                const debugParam = searchParams.get('debug');
                const response = await axios.get(`/api/check-status?id=${activePixId}${debugParam ? `&debug=${debugParam}` : ''}`);
                if (response.data.paid || response.data.status === 'approved' || response.data.status === 'paid') {
                    console.log("✅ Pagamento confirmado via Polling!");
                    setIsPaid(true);
                }
            } catch (e) {
                console.error("Erro no polling (tentando novamente...):", e);
            }
        }, 3000);

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearInterval(pollInterval);
        };
    }, [showPix, activePixId, formData.email, isPaid]);

    // Auto-Pix para teste de 5,00 - REMOVIDO PARA EXIGIR DADOS REAIS
    // useEffect(() => {
    //     if (isMounted && planPrice === '5,00' && !showPix && !loading) {
    //         console.log("--- TESTE DETECTADO: GERANDO PIX AUTOMÁTICO ---");
    //         const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
    //         handleGeneratePix(fakeEvent);
    //     }
    // }, [isMounted, planPrice, showPix, loading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getDaysDisplay = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('trimestral') || n.includes('3 meses')) return '90 Dias';
        if (n.includes('semestral') || n.includes('6 meses')) return '180 Dias';
        if (n.includes('anual') || n.includes('1 ano') || n.includes('12 meses')) return '365 Dias';
        if (n.includes('vitalício') || n.includes('vitalicio')) return 'Vitalício';
        return '30 Dias';
    };

    const handleGeneratePix = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.phone) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        setLoading(true);

        try {
            // 1. Save Lead
            const leadRef = await addDoc(collection(db, "leads"), {
                email: formData.email,
                phone: formData.phone,
                plan: planName,
                price: planPrice,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // 2. Generate Pix via API
            const response = await axios.post('/api/payment', {
                amount: planPrice,
                description: `Assinatura - ${planName}`,
                payerEmail: formData.email,
                leadId: leadRef.id
            });

            const { qrcode_content, qrcode_image_url, transaction_id } = response.data;

            setPixCode(qrcode_content);
            setPixImage(qrcode_image_url);
            setActivePixId(transaction_id);
            setShowPix(true);

            // Animation sequence
            const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
            await delay(100);
            setSurpriseStep(1);
            await delay(600);
            setSurpriseStep(2);
            await delay(600);
            setSurpriseStep(3);
            await delay(600);
            setSurpriseStep(4);

        } catch (error) {
            console.error("Erro ao gerar Pix:", error);
            alert("Erro ao processar pagamento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixCode);
        alert('Código Pix copiado!');
    };

    if (!isMounted) return null;

    const surpriseContent = [
        { icon: Film, text: "9.000+ Filmes e Séries Liberados", color: "text-green-500" },
        { icon: Tv, text: "3 Telas Ultra HD 4K Configuradas", color: "text-green-500" },
        { icon: Zap, text: "Tecnologia Anti-Travamento Ativada", color: "text-green-500" },
        { icon: ShieldCheck, text: "Acesso Vitalício ao Suporte VIP", color: "text-green-500" }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 overflow-x-hidden">

            {/* 🔴 Top Urgency Bar */}
            <div className="bg-[#e50914] py-3 px-4 sticky top-0 z-[60] flex items-center justify-center gap-3 shadow-[0_4px_30px_rgba(229,9,20,0.6)]">
                <Clock size={18} className="animate-pulse text-white" />
                <p className="text-[11px] md:text-sm font-black uppercase tracking-[0.25em] text-white text-center">
                    SEU DESCONTO EXPIRA EM: <span className="text-white text-lg md:text-xl ml-2 font-black italic">{formatTime(timeLeft)}</span>
                </p>
            </div>

            {/* Header Navigation */}
            <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/#pricing"
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group cursor-pointer"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
                    </Link>
                    <div className="relative w-44 h-12">
                        <Image src="https://i.imgur.com/6H5gxcw.png" alt="RedFlix" fill className="object-contain" priority />
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 pt-12 pb-20">
                {/* 🎯 Headline */}
                <div className="max-w-2xl mx-auto text-center mb-12 space-y-3">
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                        Finalize seu <span className="text-primary">Acesso VIP</span> agora
                    </h1>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] px-4">
                        Preencha seus dados reais para receber o código de ativação instantaneamente.
                    </p>
                </div>

                <div className="max-w-xl mx-auto relative">
                    {/* 🔐 Main Checkout Box */}
                    <div className="bg-[#0f0f0f] border-2 border-primary/20 rounded-[3rem] shadow-[0_0_100px_rgba(229,9,20,0.15)] relative overflow-hidden">

                        {/* Background Decoration */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            {/* Summary Note integrated at the top */}
                            {(!showPix || isPaid) && (
                                <div className="bg-black/50 border-b border-white/5 p-6 md:p-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Resumo do seu Plano</p>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white">{planName} ({getDaysDisplay(planName)})</h3>

                                    <div className="mt-4 md:mt-6 flex items-baseline justify-center gap-1.5">
                                        <span className="text-lg md:text-xl font-black text-primary italic">R$</span>
                                        <span className="text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-none">{planPrice}</span>
                                    </div>
                                    <div className="mt-3 md:mt-4 inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                        <CheckCircle2 size={10} className="text-green-500" />
                                        <span className="text-[8px] md:text-[9px] text-green-500 font-black uppercase tracking-widest">Acesso Imediato</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 md:p-10">
                                <AnimatePresence mode="wait">
                                    {isPaid ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center space-y-6"
                                        >
                                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                                <CheckCircle2 size={40} className="text-green-500" />
                                            </div>
                                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white tracking-widest">Pagamento Aprovado!</h3>
                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-400">
                                                    Identificamos seu pagamento! Seus dados de acesso foram enviados agora mesmo para o e-mail:
                                                    <span className="block text-white font-bold mt-2 bg-white/5 py-3 rounded-xl border border-white/5">{formData.email}</span>
                                                </p>
                                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
                                                        ⚠️ IMPORTANTE: Caso não encontre na caixa de entrada, verifique sua pasta de **SPAM** ou **LIXO ELETRÔNICO**.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    onClick={() => router.push('/')}
                                                    className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl"
                                                >
                                                    Voltar para o Início
                                                </button>
                                                <a
                                                    href="https://wa.me/5571991644164?text=%20Olá,%20acabei%20de%20realizar%20o%20pagamento%20do%20meu%20plano%20RedFlix%20e%20gostaria%20de%20agilizar%20minha%20liberação."
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-primary/10 border border-primary/20 text-primary font-black py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Headphones size={14} />
                                                    Liberação Humana (WhatsApp)
                                                </a>
                                            </div>
                                        </motion.div>
                                    ) : !showPix ? (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                        >
                                            <div className="text-center mb-10">
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Ative seu Acesso</h3>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Preencha seus dados para receber o produto no e-mail</p>
                                            </div>

                                            <form className="space-y-6" onSubmit={handleGeneratePix}>
                                                <div className="space-y-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4">Seu melhor E-mail</label>
                                                        <div className="relative group">
                                                            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary transition-colors" />
                                                            <input
                                                                type="email"
                                                                placeholder="exemplo@gmail.com"
                                                                className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                                                                value={formData.email}
                                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] ml-4">WhatsApp (DDD + Número)</label>
                                                        <div className="relative group">
                                                            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary transition-colors" />
                                                            <input
                                                                type="tel"
                                                                placeholder="(00) 90000-0000"
                                                                className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-primary hover:bg-red-600 text-white font-black py-6 rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-[0.98] shadow-[0_20px_60px_rgba(229,9,20,0.4)] group relative overflow-hidden disabled:opacity-50"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                                        {loading ? <Loader2 size={24} className="animate-spin" /> : (
                                                            <>
                                                                <QrCode size={24} className="group-hover:rotate-12 transition-transform" />
                                                                <span className="text-2xl italic tracking-tighter">GERAR PIX AGORA</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {!loading && <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.4em] mt-1 opacity-70">Entrega Automática</span>}
                                                </button>
                                            </form>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="pix"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center"
                                        >
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Seu tempo para pagar:</p>
                                                <div className="text-3xl font-black italic text-primary animate-pulse">
                                                    {formatTime(timeLeft)}
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl mb-6 group relative overflow-hidden border-4 border-primary/20">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative z-10">
                                                    <img
                                                        src={pixImage.startsWith('data:') ? pixImage : `data:image/png;base64,${pixImage}`}
                                                        alt="QR Code Pix"
                                                        className="w-56 h-56 object-contain"
                                                    />
                                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-4">QRCode Pix Seguro</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Copia e Cola:</p>
                                                    <div className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] text-gray-400 font-mono break-all line-clamp-2">
                                                        {pixCode}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={copyToClipboard}
                                                    className="w-full bg-primary hover:bg-red-600 py-5 rounded-2xl font-black italic tracking-tighter text-xl shadow-[0_15px_40px_rgba(229,9,20,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                                >
                                                    <Copy size={20} />
                                                    COPIAR CÓDIGO PIX
                                                </button>
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                                    Após pagar, seu acesso será enviado para <span className="text-gray-300">{formData.email}</span> em instantes.
                                                </p>
                                            </div>

                                            {/* Surprise steps appearing below the button */}
                                            <div className="mt-8 space-y-3 border-t border-white/5 pt-6 text-left">
                                                {surpriseContent.map((s, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{
                                                            opacity: surpriseStep > i ? 1 : 0.2,
                                                            x: surpriseStep > i ? 0 : -10
                                                        }}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className={`p-1.5 rounded-full ${surpriseStep > i ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-600'}`}>
                                                            <s.icon size={14} />
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${surpriseStep > i ? 'text-white' : 'text-gray-500'}`}>
                                                            {s.text}
                                                        </span>
                                                        {surpriseStep > i && <CheckCircle2 size={12} className="text-green-500 ml-auto" />}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/5 pt-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <img src="https://i.imgur.com/LgBsB9x.png" alt="Pix" className="h-8 grayscale opacity-80" />
                                            <div className="h-4 w-px bg-white/10" />
                                            <div className="flex items-center gap-1.5 opacity-50">
                                                <ShieldCheck size={14} className="text-white" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white">Pagamento 100% Seguro</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Grid - Fixos e Brancos */}
                <div className="mt-20 md:mt-32 space-y-8">
                    <div className="text-center space-y-2">
                        <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">O que nossos membros dizem</p>
                        <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Comentários em tempo real</h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 max-w-6xl mx-auto">
                        {testimonials.slice(0, 4).map((t, i) => (
                            <div key={i} className="bg-white p-4 md:p-6 rounded-[1.5rem] shadow-xl border border-gray-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, j) => <Star key={j} size={8} fill="#e50914" className="text-primary" />)}
                                        </div>
                                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.3)]" />
                                    </div>
                                    <p className="text-[10px] md:text-xs text-gray-800 font-bold italic leading-relaxed mb-4 line-clamp-4">
                                        "{t.text}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 border-t border-gray-100 pt-3">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center text-[8px] md:text-[10px] font-black text-primary">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[8px] md:text-[10px] text-black font-black uppercase tracking-widest truncate">{t.name}</p>
                                        <p className="text-[6px] md:text-[8px] text-primary font-bold uppercase tracking-widest">Verificado</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="py-12 text-center border-t border-white/5 opacity-30 mt-10">
                <p className="text-[9px] font-black uppercase tracking-[0.8em]">RedFlix 2026 • Todos os direitos reservados</p>
            </footer>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
