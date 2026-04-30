import { useParams, Link } from 'react-router-dom';
import MotorHistory from '../components/MotorHistory';

export default function MotorDetails() {
    const { id } = useParams<{ id: string }>();
    const motorId = parseInt(id || '0', 10);

    if (isNaN(motorId) || motorId <= 0) {
        return (
            <div className="card p-8 text-center">
                <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-text-h mb-2">Неверный идентификатор</h2>
                <p className="text-gray-500 mb-6">Пожалуйста, проверьте номер двигателя</p>
                <Link to="/" className="btn-primary inline-flex">Вернуться к списку</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <Link to="/" className="inline-flex items-center text-accent hover:text-accent-dark mb-6 transition-colors group">
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Назад к списку
            </Link>
            <MotorHistory motorId={motorId} />
        </div>
    );
}