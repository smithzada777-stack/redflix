'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, Star, QrCode, ShieldCheck, Mail, Phone, Loader2, PartyPopper, Headphones, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import axios from 'axios';

function SimpleCheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planName = searchParams.get('plan') || 'Plano Personalizado';
    const planPriceStr = searchParams.get('price') || '0,00';
    const leadIdParam = searchParams.get('leadId');

    const [formData, setFormData] = useState({
        email: 'teste@email.com',
        phone: '(11) 99345-1234'
    });

    // Steps: 0 = Offer Summary (only if leadId), 1 = Form, 2 = Pix, 3 = Success
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(!!leadIdParam);
    const [pixCode, setPixCode] = useState('');
    const [pixImage, setPixImage] = useState('');
    const [currentLeadId, setCurrentLeadId] = useState(leadIdParam || '');
    const [activePixId, setActivePixId] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 Minutos

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        if (step !== 2) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [step]);

    // --- Price & Savings Calculation Logic ---
    let originalPrice = 0;
    const finalPrice = parseFloat(planPriceStr.replace(',', '.'));

    if (planName.toLowerCase().includes('trimestral')) originalPrice = 79.90;
    else if (planName.toLowerCase().includes('semestral')) originalPrice = 149.90;
    else if (planName.toLowerCase().includes('mensal') || planName.toLowerCase().includes('renov')) originalPrice = 29.90;
    else originalPrice = finalPrice * 1.1;

    const hasDiscount = originalPrice > finalPrice + 0.5;
    const savings = originalPrice - finalPrice;

    // --- Initial Load: Fetch Lead Data if ID exists ---
    useEffect(() => {
        if (!leadIdParam || leadIdParam === 'new') {
            setInitializing(false);
            return;
        }

        const fetchLead = async () => {
            try {
                const docRef = doc(db, "leads", leadIdParam);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        email: data.email || '',
                        phone: data.phone || ''
                    });
                    setCurrentLeadId(leadIdParam);
                    setStep(0); // Show summary for returning leads
                }
            } catch (error) {
                console.error("[Checkout] Erro ao buscar lead:", error);
            } finally {
                setInitializing(false);
            }
        };

        fetchLead();
    }, [leadIdParam]);

    // PAYMENT SUCCESS SYNC
    useEffect(() => {
        if (step === 3 && activePixId) {
            console.log("--- SINCRONIZANDO APROVAÇÃO (SIMPLE) ---");
            axios.get(`/api/check-status?id=${activePixId}`).catch(err => console.error(err));
        }
    }, [step, activePixId]);

    // --- Real-time Payment Monitor ---
    useEffect(() => {
        if (step !== 2) return;

        console.log("--- MONITORANDO PAGAMENTO (SIMPLE) ---");
        const unsubscribers: (() => void)[] = [];

        // 1. Monitoramento Direto do Pagamento
        if (activePixId) {
            const tid = activePixId.toLowerCase();
            console.log(`Buscando transação: ${tid}`);
            const unsubPayment = onSnapshot(doc(db, "payments", tid), (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    const status = (data.status || '').toLowerCase();
                    console.log(`Status payments/${tid}:`, status);
                    if (['paid', 'approved', 'confirmed', 'concluido'].includes(status)) {
                        setStep(3);
                    }
                }
            }, (error: any) => {
                if (error.code === 'failed-precondition') {
                    console.error("⚠️ FALTA ÍNDICE NO FIREBASE: Clique no link que apareceu acima para criar o índice.");
                } else {
                    console.error("Erro monitoramento (payments):", error);
                }
            });
            unsubscribers.push(unsubPayment);
        }

        // 2. Monitoramento do Lead
        if (currentLeadId) {
            const unsubLead = onSnapshot(doc(db, "leads", currentLeadId), (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    const status = (data.status || '').toLowerCase();
                    console.log(`Status lead/${currentLeadId}:`, status);
                    if (['approved', 'paid', 'confirmed'].includes(status)) {
                        setStep(3);
                    }
                }
            }, (error: any) => {
                if (error.code === 'failed-precondition') {
                    console.error("⚠️ FALTA ÍNDICE NO FIREBASE (Lead): Clique no link acima para criar.");
                } else {
                    console.warn("Erro monitoramento (lead):", error);
                }
            });
            unsubscribers.push(unsubLead);
        }

        // 3. Fallback: Busca qualquer lead com este email que tenha sido aprovado
        if (formData.email) {
            const q = query(collection(db, "leads"), where("email", "==", formData.email), limit(5)); // Pega até 5 para garantir
            const unsubEmail = onSnapshot(q, (snapshot) => {
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (['approved', 'paid', 'confirmed'].includes(data.status?.toLowerCase())) {
                        setStep(3);
                    }
                });
            }, (error: any) => {
                if (error.code === 'failed-precondition') {
                    console.error("⚠️ FALTA ÍNDICE NO FIREBASE (Email): Clique no link que apareceu no console para criar.");
                } else {
                    console.warn("Erro monitoramento (email):", error);
                }
            });
            unsubscribers.push(unsubEmail);
        }

        // 4. Polling de Segurança (A cada 3 segundos)
        const pollInterval = setInterval(async () => {
            if (activePixId) {
                try {
                    const response = await axios.get(`/api/check-status?id=${activePixId}`);
                    if (response.data.paid) {
                        console.log("[SIMPLE] Pagamento confirmado via Polling!");
                        setStep(3);
                    }
                } catch (e) {
                    console.error("Erro no polling:", e);
                }
            }
        }, 3000);

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearInterval(pollInterval);
        };
    }, [step, activePixId, currentLeadId, formData.email]);

    // Auto-Pix para teste de 5,00
    useEffect(() => {
        if (planPriceStr === '5,00' && step === 1 && !loading && !pixCode) {
            console.log("--- TESTE DETECTADO (SIMPLE): GERANDO PIX AUTOMÁTICO ---");
            handleGeneratePix();
        }
    }, [planPriceStr, step, loading, pixCode]);


    const handleGeneratePix = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/payment', {
                amount: finalPrice,
                description: `Assinatura - ${planName}`,
                payerEmail: formData.email,
                leadId: currentLeadId
            });

            const { qrcode_content, qrcode_image_url, transaction_id } = response.data;

            if (qrcode_content) {
                setPixCode(qrcode_content);
                setPixImage(qrcode_image_url);
                setActivePixId(transaction_id);
                setStep(2);
            } else {
                throw new Error('PushinPay não retornou dados de Pix');
            }

        } catch (error: any) {
            console.error("[Checkout] Erro ao gerar Pix:", error);
            alert(error.response?.data?.error || 'Erro ao gerar Pix. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Lead in Firebase
            const docRef = await addDoc(collection(db, "leads"), {
                email: formData.email,
                phone: formData.phone,
                plan: planName,
                price: planPriceStr,
                status: 'pending',
                source: 'simple_checkout',
                createdAt: serverTimestamp()
            });

            const newLeadId = docRef.id;
            setCurrentLeadId(newLeadId);

            // 2. Call local API to generate Pix
            const response = await axios.post('/api/payment', {
                amount: finalPrice,
                description: `Assinatura - ${planName}`,
                payerEmail: formData.email,
                leadId: newLeadId
            });

            const { qrcode_content, qrcode_image_url, transaction_id } = response.data;

            if (qrcode_content) {
                setPixCode(qrcode_content);
                setPixImage(qrcode_image_url);
                setActivePixId(transaction_id);
                setStep(2);
            } else {
                throw new Error('Erro na resposta da API de Pix');
            }

        } catch (error: any) {
            console.error("[Checkout] Erro no fluxo de formulário:", error);
            alert("Erro ao processar pedido. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Carregando seu plano...</p>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 max-w-sm"
                >
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <PartyPopper size={80} className="text-primary mx-auto relative z-10 animate-bounce" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Pagamento Aprovado!</h2>
                        <p className="text-gray-400 text-sm">
                            Identificamos seu pagamento! Os dados de acesso do <strong>{planName}</strong> foram enviados agora mesmo para seu e-mail:
                        </p>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl font-bold text-primary text-lg">
                            {formData.email}
                        </div>
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
                                ⚠️ IMPORTANTE: Caso não encontre na caixa de entrada, verifique sua pasta de **SPAM** ou **LIXO ELETRÔNICO**.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3 w-full">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-xl"
                        >
                            Página Inicial
                        </button>
                        <a
                            href="https://wa.me/5500000000000" // Placeholder
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-primary/10 border border-primary/20 text-primary font-black py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Headphones size={14} />
                            Dificuldade com o Acesso? Suporte VIP
                        </a>
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase font-medium">Verifique sua caixa de entrada e spam.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-primary/30">
            {/* Top Logo */}
            <div className="mb-8 relative w-48 h-12">
                <Image src="https://i.imgur.com/6H5gxcw.png" alt="RedFlix" fill className="object-contain" priority />
            </div>

            <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 blur-[100px] -z-10" />

                {/* Header Section */}
                <div className="text-center mb-10 relative z-10">
                    <div className="relative w-40 h-12 mx-auto mb-4">
                        <Image src="https://i.imgur.com/6H5gxcw.png" alt="RedFlix" fill className="object-contain" unoptimized />
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                        <ShieldCheck className="text-primary" size={32} />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {step === 0 ? (
                                <>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-white italic">Confirmar Oferta</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Resumo da assinatura</p>
                                </>
                            ) : step === 1 ? (
                                <>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 italic">Checkout</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Pagamento Seguro via Pix</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 italic">Gerado com Sucesso!</h2>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] animate-pulse">Aguardando Pagamento...</p>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 ? (
                        <motion.div
                            key="offer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center relative z-10 space-y-8"
                        >
                            <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                                {hasDiscount && (
                                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                                        OFF R$ {savings.toFixed(2).replace('.', ',')}
                                    </div>
                                )}

                                <h3 className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black mb-4">{planName}</h3>

                                <div className="flex flex-col items-center justify-center">
                                    {hasDiscount && (
                                        <span className="text-gray-600 line-through text-sm font-bold opacity-50">R$ {originalPrice.toFixed(2).replace('.', ',')}</span>
                                    )}
                                    <div className="flex items-start">
                                        <span className="text-primary font-black text-2xl mt-1 pr-1 italic">R$</span>
                                        <span className="text-6xl font-black italic text-white drop-shadow-[0_0_25px_rgba(229,9,20,0.4)]">
                                            {planPriceStr}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGeneratePix}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-red-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-primary/40 disabled:opacity-70 active:scale-95 text-sm tracking-widest uppercase"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <QrCode size={20} />
                                        <span>Gerar QR Code Pix</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ) : step === 1 ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleFormSubmit}
                            className="space-y-6 relative z-10"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-inner">
                                <span className="text-primary text-[10px] uppercase font-black tracking-widest block mb-1">{planName}</span>
                                <span className="text-4xl font-black italic text-white block tracking-tighter">R$ {planPriceStr}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail para Acesso</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:border-primary/40 focus:bg-black/60 focus:outline-none transition-all placeholder:text-gray-700 font-bold"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">WhatsApp</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="tel"
                                            placeholder="(11) 99999-9999"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:border-primary/40 focus:bg-black/60 focus:outline-none transition-all placeholder:text-gray-700 font-bold"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-red-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-primary/40 disabled:opacity-70 active:scale-95 text-sm tracking-widest uppercase mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <span>Gerar Pagamento</span>
                                        <QrCode size={20} className="group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    ) : step === 2 ? (
                        <motion.div
                            key="pix"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center relative z-10"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Seu tempo para pagar:</p>
                                <div className="text-4xl font-black italic text-primary animate-pulse mb-8">
                                    {formatTime(timeLeft)}
                                </div>

                                <div className="relative group p-2 mb-8">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform" />
                                    <div className="bg-white p-5 rounded-[2.5rem] inline-block shadow-2xl relative border-4 border-primary/20">
                                        <img
                                            src={pixImage.startsWith('data:') ? pixImage : `data:image/png;base64,${pixImage}`}
                                            alt="QR Code Pix"
                                            className="w-52 h-52 object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 px-2">
                                    <div className="space-y-2 text-left">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">Copia e Cola:</p>
                                        <div className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-[11px] text-gray-400 font-mono break-all line-clamp-2">
                                            {pixCode}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixCode);
                                            alert('Código Pix copiado!');
                                        }}
                                        className="w-full bg-primary hover:bg-red-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/30 text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Copy size={18} />
                                        COPIAR CÓDIGO PIX
                                    </button>

                                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5 mt-4">
                                        <div className="flex flex-col items-start px-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Enviando acesso para:</span>
                                            <span className="text-xs font-black italic text-white line-clamp-1">{formData.email}</span>
                                        </div>
                                        <div className="bg-primary/20 p-2 rounded-lg">
                                            <Mail size={16} className="text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 relative z-10 pt-10"
                        >
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <CheckCircle2 size={48} className="text-green-500" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Pagamento Aprovado!</h2>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                    Identificamos seu Pix! Seus dados de acesso foram enviados para:
                                    <span className="block text-primary font-black mt-2 text-lg underline">{formData.email}</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 max-w-xs mx-auto pt-6">
                                <a
                                    href="https://wa.me/5571991644164?text=%20Olá,%20acabei%20de%20realizar%20o%20pagamento%20do%20meu%20plano%20RedFlix%20e%20gostaria%20de%20agilizar%20minha%20liberação."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-900/20 uppercase tracking-widest text-xs"
                                >
                                    <Headphones size={20} />
                                    Liberação Humana (WhatsApp)
                                </a>
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full bg-white/5 border border-white/10 text-gray-500 font-black py-4 rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-[11px]"
                                >
                                    Voltar para o Início
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Section */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                            <img src="https://i.imgur.com/LgBsB9x.png" alt="Pix" className="h-8 grayscale opacity-80" />
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-1.5 opacity-40">
                                <ShieldCheck size={14} className="text-white" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white">Pagamento 100% Seguro</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.back()}
                className="mt-8 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
            >
                <ArrowLeft size={14} />
                Voltar e Alterar Plano
            </button>
        </div>
    );
}

const testimonials = [
    { name: 'Ricardo Dias', text: 'Finalmente um serviço de qualidade que não trava no meio do jogo. Valeu cada centavo!' },
    { name: 'Juliana Torres', text: 'Fiquei surpresa com o catálogo, tem tudo que eu procurava e o suporte é nota mil.' },
    { name: 'André Luiz', text: 'O acesso vitalício é real, já uso há meses e nunca tive problemas. Recomendo d+.' },
    { name: 'Carla Silveira', text: 'Instalei na minha Smart TV sem erro. Muito fácil e prático de usar.' },
];

export default function SimpleCheckoutPage() {
    const router = useRouter();
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        }>
            <div className="min-h-screen bg-[#050505] overflow-x-hidden pb-20">
                <SimpleCheckoutContent />

                <div className="mt-12 space-y-6 max-w-6xl mx-auto px-4">
                    <div className="text-center space-y-1">
                        <p className="text-[10px] text-gray-700 font-medium uppercase tracking-[0.5em]">O que nossos membros dizem</p>
                        <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Comentários em tempo real</h4>
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
            </div>
        </Suspense>
    );
}
