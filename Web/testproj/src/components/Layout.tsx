import { Link, useLocation } from 'react-router-dom';
import { Factory, Home, PlusCircle, List } from 'lucide-react';

/**
 * Основной компонент обёртки приложения.
 * Содержит хедер с навигацией и контейнер для дочерних страниц.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        <Factory className="text-indigo-600" size={28} />
                        Asset Tracker
                    </Link>
                    <nav className="flex gap-2">
                        <Link to="/" className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}>
                            <Home size={18} /> Главная
                        </Link>
                        <Link to="/motors/new" className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${location.pathname === '/motors/new' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}>
                            <PlusCircle size={18} /> Новый двигатель
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}