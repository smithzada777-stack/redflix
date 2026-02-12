"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MessageSquare, Users, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock Data
const stats = [
    { label: "Vendas Hoje", value: "R$ 1.258,00", icon: DollarSign, color: "text-green-500" },
    { label: "Leads Ativos", value: "324", icon: Users, color: "text-blue-500" },
    { label: "Taxa de Conversão", value: "12.5%", icon: TrendingUp, color: "text-purple-500" },
];

const messages = [
    { user: "João Silva", msg: "Acabei de pagar, liberou na hora!", time: "2 min atrás" },
    { user: "Maria Oliveira", msg: "O suporte me ajudou muito, obrigado.", time: "15 min atrás" },
    { user: "Pedro Santos", msg: "Qualidade top, recomendo.", time: "1h atrás" },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#050505] p-6 md:p-12">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
                    <p className="text-gray-400">Visão geral da sua operação RedFlix.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" size="sm">Configurações</Button>
                    <Button size="sm">Nova Campanha</Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-full bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Últimas Mensagens</h3>
                    <div className="space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                    {msg.user.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-white font-medium text-sm">{msg.user}</h4>
                                        <span className="text-xs text-gray-500">{msg.time}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{msg.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions (Placeholder for now) */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-white font-bold">Enviar Broadcast</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Envie mensagens em massa para seus clientes via WhatsApp.</p>
                    <Button className="w-full max-w-xs">
                        Configurar Envio
                    </Button>
                </div>
            </div>
        </div>
    );
}
