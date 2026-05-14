import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import MotorDetails from './pages/MotorDetails';
import LubricantTypesPage from './pages/LubricantTypesPage';

function Header() {
    return (
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                            MotorTrack
                        </span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {/* Кнопка перехода к справочнику типов смазки */}
                        <Link
                            to="/lubricant-types"
                            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Типы смазки
                        </Link>
                        <Link
                            to="/motors/new"
                            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Электродвигателя
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Управление электродвигателями</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--card-bg)',
                        color: 'var(--text-h)',
                        border: '1px solid var(--border)',
                    },
                }}
            />
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/motors/new" element={<Dashboard />} />
                    <Route path="/motors/:id" element={<MotorDetails />} />
                    <Route path="/lubricant-types" element={<LubricantTypesPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;