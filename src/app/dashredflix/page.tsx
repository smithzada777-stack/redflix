"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Smartphone, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function DashLoginPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Success! Redirect to admin
                router.push(data.redirect || '/dashredflix/admin');
            } else {
                setError(data.error || "Erro ao fazer login");
            }
        } catch (err) {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md relative">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-20"></div>

                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <Image src="/assets/brand/logo.png" alt="RedFlix" width={140} height={40} className="mx-auto mb-6 opacity-90" />
                        <div className="inline-flex items-center gap-2 bg-red-950/30 text-red-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-red-900/40">
                            <ShieldCheck className="w-4 h-4" />
                            Acesso Restrito
                        </div>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Lock className="w-3 h-3 text-red-600" />
                                Senha de Administrador
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-600/10 border border-red-600/20 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )
                        }

                        <Button type="submit" size="lg" className="w-full h-14 text-sm font-black shadow-[0_0_30px_rgba(229,9,20,0.2)]" loading={loading}>
                            ENTRAR NO DASHBOARD
                        </Button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest opacity-40">
                        Sistema Criptografado de Ponta a Ponta
                    </p>
                </div>
            </div>
        </div>
    );
}
