'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, QrCode, ShieldCheck, Mail, Phone, Loader2, PartyPopper, Headphones } from 'lucide-react';
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

            <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 blur-[100px] -z-10" />

                {/* Header Section */}
                <div className="text-center mb-10 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
                        <ShieldCheck className="text-primary" size={40} />
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
                    ) : (
                        <motion.div
                            key="pix"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center relative z-10"
                        >
                            <div className="relative group p-2 mb-8">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform" />
                                <div className="bg-white p-5 rounded-[2.5rem] inline-block shadow-2xl relative">
                                    <img
                                        src={pixImage.startsWith('data:') ? pixImage : `data:image/png;base64,${pixImage}`}
                                        alt="QR Code Pix"
                                        className="w-52 h-52 object-contain"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 px-2">
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                    Após o pagamento, o seu acesso ao <strong className="text-white italic">{planName}</strong> será liberado instantaneamente nesta tela.
                                </p>

                                <div className="space-y-2">
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Copia e Cola:</p>
                                    <div className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] text-gray-400 font-mono break-all line-clamp-2">
                                        {pixCode}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixCode);
                                        alert('Código Pix copiado!');
                                    }}
                                    className="w-full bg-white/5 hover:bg-primary hover:text-white text-white font-black py-5 rounded-2xl transition-all border border-white/10 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/30"
                                >
                                    <CheckCircle2 size={18} className="text-primary group-hover:text-white" />
                                    COPIAR CÓDIGO PIX
                                </button>

                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex flex-col items-start px-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Enviando acesso para:</span>
                                        <span className="text-xs font-black italic text-white">{formData.email}</span>
                                    </div>
                                    <div className="bg-primary/20 p-2 rounded-lg">
                                        <Mail size={16} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Section */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-4 opacity-30 grayscale hover:opacity-60 transition-opacity">
                            {/* Payment Method Icons - Placeholder logic or just icons */}
                            <div className="w-10 h-6 bg-white/10 rounded-md" />
                            <div className="w-10 h-6 bg-white/10 rounded-md" />
                            <div className="w-10 h-6 bg-white/10 rounded-md" />
                        </div>
                        <div className="flex items-center gap-2 opacity-30">
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Ambiente 100% Criptografado</span>
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
    { name: 'Marcos Vinicius', text: 'O acesso chegou em menos de 1 minuto no meu email, surreal!' },
    { name: 'Renata Oliveira', text: 'Suporte nota 10, me ajudaram a configurar na minha Smart TV rápido.' },
    { name: 'Dr. Ricardo Menezes', text: 'Serviço extremamente profissional e estável. Recomendo para famílias.' },
    { name: 'Jeferson Silva', text: 'Top viu, ate os jogo do meu timao em 4K passa certinho sem travar.' },
    { name: 'Bruna Santos', text: 'Os desenho pra criançada salvou muito aqui em casa kkk tem muita coisa.' },
    { name: 'Dona Maria Luiza', text: 'Muito fácil de usar, até eu que não entendo de tecnologia consegui instalar.' },
    { name: 'Anderson Costa', text: 'Tava meio assim de comprar mas vale muito a pena pelo preço.' },
    { name: 'Felipe Almeida', text: 'Melhor que qualquer outro serviço e muito mais barato, já indiquei pra geral.' },
    { name: 'Sandra Pires', text: 'Amei os canais de culinária e as novelas antigas. Nota mil!' },
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

                    <div className="overflow-hidden relative w-full h-[220px] md:h-[280px] pointer-events-none group">
                        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />
                        <div className="flex animate-marquee gap-4 md:gap-8 whitespace-nowrap py-4 md:py-6 items-center h-full">
                            {[...testimonials, ...testimonials].map((t, i) => (
                                <div key={i} className="inline-block bg-[#0d0d0d] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 w-[260px] md:w-[320px] shadow-2xl">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <div className="flex gap-0.5 text-white/10">
                                            {[...Array(5)].map((_, j) => (
                                                <svg key={j} className="w-3 h-3 fill-primary" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] md:text-xs text-white/70 font-medium italic whitespace-normal leading-relaxed mb-3 md:mb-4">
                                        "{t.text}"
                                    </p>
                                    <div className="flex items-center gap-2 md:gap-3 border-t border-white/5 pt-3 md:pt-4">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center text-[8px] md:text-[10px] font-black text-primary">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[8px] md:text-[10px] text-white font-black uppercase tracking-widest">{t.name}</p>
                                            <p className="text-[6px] md:text-[8px] text-gray-600 font-bold uppercase tracking-widest text-left">Membro Verificado</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
