export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Carregando RedFlix...</p>
            </div>
        </div>
    );
}
