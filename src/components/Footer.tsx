'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative bg-primary text-white overflow-hidden py-8">
            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">

                {/* Minimalist Footer - Brand, Social & Copyright Only */}
                <div className="flex flex-col items-center space-y-6">

                    {/* Brand Logo */}
                    <Link href="/" className="transition-transform duration-300 hover:scale-105">
                        <div className="relative p-2 bg-black/20 rounded-lg">
                            <img
                                src="https://i.imgur.com/6H5gxcw.png"
                                alt="RedFlix Logo"
                                className="h-8 w-auto brightness-0 invert"
                            />
                        </div>
                    </Link>

                    {/* Social Media */}
                    <div className="flex items-center gap-6">
                        <Link href="https://instagram.com/redflixofficial" target="_blank" className="p-2.5 bg-white/10 rounded-full border border-white/20 hover:bg-white hover:text-primary transition-all duration-300 shadow-lg">
                            <Instagram size={20} />
                        </Link>
                        <Link href="https://tiktok.com/@redflixofficial" target="_blank" className="p-2.5 bg-white/10 rounded-full border border-white/20 hover:bg-white hover:text-primary transition-all duration-300 shadow-lg">
                            <TikTokIcon className="w-5 h-5 fill-current" />
                        </Link>
                        <Link href="https://wa.me/5571991644164" target="_blank" className="relative p-2.5 bg-white/10 rounded-full border border-white/20 hover:bg-green-500 hover:border-green-400 transition-all duration-300 shadow-lg">
                            <MessageCircle size={20} />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white/10"></span>
                            </span>
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 text-center">
                        &copy; 2026 REDFLIX BRASIL. TODOS OS DIREITOS RESERVADOS.
                    </p>
                </div>
            </div>
        </footer>
    );
}

// Simple TikTok Icon SVG Component
function TikTokIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" {...props}>
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-2.26.74-4.57 2.5-5.98 1.14-.91 2.54-1.42 4.01-1.44.01 1.62-.01 3.24.01 4.85-1.47.08-2.91.93-3.08 2.45-.19 1.11.33 2.21 1.25 2.84.44.3 1 .46 1.53.46.25-.01.5-.03.75-.07 1.14-.19 2.02-1.25 2.02-2.39.03-3.36.01-6.72.01-10.08-.01-1.12-.02-2.24-.03-3.36Z" />
        </svg>
    )
}
