import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import MotorDetails from './pages/MotorDetails';

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
                    <Route path="/motors/:id" element={<MotorDetails />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;