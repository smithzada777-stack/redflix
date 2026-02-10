'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WhatsAppButton() {
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // A mensagem aparece depois de 3 segundos
        const showTimer = setTimeout(() => {
            setShowTooltip(true);

            // A mensagem fecha sozinha após 8 segundos
            const hideTimer = setTimeout(() => {
                setShowTooltip(false);
            }, 8000);

            return () => clearTimeout(hideTimer);
        }, 3000);

        return () => clearTimeout(showTimer);
    }, []);

    return (
        <div className="fixed right-6 bottom-6 z-50 flex items-center justify-end">

            {/* Round Message (Saindo de dentro do botão) */}
            <div
                className={`
                    absolute right-0 bottom-0
                    bg-primary text-white h-16 px-10 rounded-full shadow-2xl shadow-primary/40
                    transition-all duration-700 ease-[underline] flex items-center justify-center
                    whitespace-nowrap border border-white/10 origin-right
                    ${showTooltip
                        ? 'opacity-100 translate-x-[-80px] scale-100 pointer-events-auto'
                        : 'opacity-0 translate-x-0 scale-0 pointer-events-none'
                    }
                `}
            >
                <span className="font-bold text-sm tracking-tight text-white">
                    Ficou com dúvida? <span className="font-black underline">Chame o suporte!</span>
                </span>
            </div>

            {/* Main Red Button (Fixo) */}
            <Link
                href="https://wa.me/5571991644164"
                target="_blank"
                className="relative z-10 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(229,9,20,0.4)] cursor-pointer hover:shadow-[0_15px_40px_rgba(229,9,20,0.6)] transition-all duration-500 hover:scale-110 active:scale-95"
            >
                <MessageCircle size={32} className="text-white fill-current" />
            </Link>
        </div>
    );
}
