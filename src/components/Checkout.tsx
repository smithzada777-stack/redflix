'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, CheckCircle2, Star, Clock, ShieldCheck, Zap, Phone, Mail, QrCode, Copy, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface CheckoutProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        period: string;
        price: string;
    } | null;
}

export default function Checkout({ isOpen, onClose, plan }: CheckoutProps) {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [step, setStep] = useState(1); // 1: Info, 2: Payment
    const [formData, setFormData] = useState({ email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [pixKey, setPixKey] = useState(''); // Chave Pix (Placeholder)

    // Detalhes do PIX (Substitua pela sua chave real)
    const PIX_KEY = "seu-email-pix@exemplo.com";
    const MERCHANT_NAME = "RedFlix TV";
    const MERCHANT_CITY = "SAO PAULO";

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleCheckout = async () => {
        if (!formData.email || !formData.phone) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        setLoading(true);

        try {
            // Gerar Payload Pix
            const priceValue = plan?.price.replace(/[^\d]/g, '');
            const pixPayload = `00020126330014BR.GOV.BCB.PIX0114${PIX_KEY}520400005303986540${priceValue}5802BR5913${MERCHANT_NAME}6009${MERCHANT_CITY}62070503***6304`;

            // 1. Salvar Lead no Firebase (Pendente)
            await addDoc(collection(db, "leads"), {
                email: formData.email,
                phone: formData.phone,
                plan: plan?.period,
                price: plan?.price,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // 2. Enviar E-mail de "Aguardando Pagamento" com Código Pix
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    plan: plan?.period,
                    price: plan?.price,
                    status: 'pending',
                    pixCode: pixPayload
                })
            });

            // 3. Avançar para o Passo de Pagamento (PIX)
            setStep(2);

        } catch (error) {
            console.error("Erro no checkout:", error);
            alert("Erro ao processar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
    };

    if (!plan) return null;

    const bonuses = [
        "Acesso Vitalício ao Guia de Configuração",
        "Suporte Prioritário VIP no WhatsApp",
        "Qualidade 4K Ultra HD Desbloqueada",
        "Instalação em Smart TV Grátis"
    ];

    const testimonials = [
        { name: "Carlos S.", comment: "Liberei na hora! Qualidade absurda.", rating: 5 },
        { name: "Ana P.", comment: "Finalmente parei de pagar 4 streamings.", rating: 5 }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(229,9,20,0.2)]"
                    >
                        {/* Header Image/Pattern */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 p-6 md:p-10 pt-12">
                            <div className="flex flex-col md:flex-row gap-8">

                                {/* Left Side: Plan Info */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-[10px] font-black uppercase tracking-wider mb-3">
                                            <Zap size={12} fill="currentColor" />
                                            Oferta de Lançamento
                                        </div>
                                        <div className="relative w-40 h-16 mb-2">
                                            <Image src="https://i.imgur.com/6H5gxcw.png" alt="RedFlix" fill className="object-contain" unoptimized />
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2 font-medium">
                                            Você está adquirindo: <span className="text-white font-bold">{plan.period} de acesso TOTAL</span>.
                                        </p>
                                    </div>

                                    {/* Urgency Timer */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                                                <Clock size={20} className="animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Desconto expira em:</p>
                                                <p className="text-xl font-black text-white tracking-widest">{formatTime(timeLeft)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider line-through">R$ {(parseFloat(plan.price.replace(',', '.')) * 1.5).toFixed(2).replace('.', ',')}</p>
                                            <p className="text-2xl font-black text-primary italic">R$ {plan.price}</p>
                                        </div>
                                    </div>

                                    {/* Extra Bonuses & Testimonials Grouped */}
                                    <div className="space-y-2 pt-2">
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Bônus Exclusivos:</p>
                                            {bonuses.map((bonus, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-white/80">
                                                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                                    {bonus}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mini Testimonials - Fixos e Brancos */}
                                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                                            {testimonials.map((t, i) => (
                                                <div key={i} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="flex gap-0.5 mb-1">
                                                        {[...Array(5)].map((_, j) => <Star key={j} size={8} fill="#ffc107" className="text-[#ffc107]" />)}
                                                    </div>
                                                    <p className="text-[10px] text-gray-800 font-bold leading-tight mb-1 italic">"{t.comment}"</p>
                                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">— {t.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Form & Payment */}
                                <div className="w-full md:w-[300px] bg-white/5 rounded-3xl border border-white/5 p-6 space-y-6 relative overflow-hidden">
                                    {step === 1 ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">E-mail para acesso</label>
                                                    <div className="relative">
                                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                        <input
                                                            type="email"
                                                            placeholder="seu@email.com"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">WhatsApp (com DDD)</label>
                                                    <div className="relative">
                                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                        <input
                                                            type="tel"
                                                            placeholder="(00) 00000-0000"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    onClick={handleCheckout}
                                                    disabled={loading}
                                                    className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_30px_rgba(229,9,20,0.3)] relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? (
                                                        <Loader2 size={20} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                            <QrCode size={20} />
                                                            GERAR PIX AGORA
                                                        </>
                                                    )}
                                                </button>
                                                <p className="text-[9px] text-gray-600 text-center mt-4 font-bold flex items-center justify-center gap-1">
                                                    <ShieldCheck size={12} />
                                                    PAGAMENTO 100% SEGURO E CRIPTOGRAFADO
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-right duration-300">
                                            <div className="space-y-2">
                                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                                    <CheckCircle2 size={32} className="text-green-500" />
                                                </div>
                                                <h3 className="text-xl font-black text-white italic">Pedido Confirmado!</h3>
                                                <p className="text-xs text-gray-400">Escaneie o QR Code abaixo para pagar.</p>
                                            </div>

                                            {/* QR Code Placeholder - Em produção, usar uma lib de QR Code Real */}
                                            <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto flex items-center justify-center">
                                                {/* Substituir por um componente de QR Code real gerando o Payload PIX */}
                                                <Image
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("00020126330014BR.GOV.BCB.PIX0114" + PIX_KEY + "520400005303986540" + plan.price.replace(/[^\d]/g, '') + "5802BR5913" + MERCHANT_NAME + "6009" + MERCHANT_CITY + "62070503***6304")}`}
                                                    alt="QR Code Pix"
                                                    width={150}
                                                    height={150}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Código Pix Copia e Cola</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        readOnly
                                                        value={`00020126330014BR.GOV.BCB.PIX0114${PIX_KEY}520400005303986540${plan.price.replace(/[^\d]/g, '')}5802BR5913${MERCHANT_NAME}6009${MERCHANT_CITY}62070503***6304`}
                                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-400 font-mono truncate"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(`00020126330014BR.GOV.BCB.PIX0114${PIX_KEY}520400005303986540${plan.price.replace(/[^\d]/g, '')}5802BR5913${MERCHANT_NAME}6009${MERCHANT_CITY}62070503***6304`)}
                                                        className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-gray-500 mt-4">
                                                Assim que pagar, aguarde a aprovação no seu e-mail <strong>{formData.email}</strong> ou chame no WhatsApp.
                                            </p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
