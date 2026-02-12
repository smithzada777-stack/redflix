"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Simplified Checkout component without extra fluff, perfect for low-bandwidth or A/B testing
export default function SimpleCheckoutPage() {
    const [loading, setLoading] = useState(false);

    const handleQuickPix = () => {
        setLoading(true);
        // Simulate immediate Pix Generation
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Checkout Rápido</h1>
            <p className="text-gray-500 mb-8 text-sm">Valor: <span className="text-white font-bold">R$ 27,90</span></p>

            <div className="w-full max-w-sm space-y-4">
                <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    className="w-full bg-[#111] border border-white/20 rounded p-3 text-white focus:border-red-500 outline-none"
                />
                <Button onClick={handleQuickPix} className="w-full h-12 text-lg font-bold" loading={loading}>
                    PAGAR AGORA
                </Button>
            </div>

            <p className="text-[10px] text-gray-600 mt-8 text-center max-w-xs">
                Ao clicar você concorda com os termos. Pagamento processado por PushinPay.
            </p>
        </div>
    );
}
