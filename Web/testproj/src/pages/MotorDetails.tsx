import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MotorHistory from '../components/MotorHistory';
import EditMotorModal from '../components/EditMotorModal';
import { motorApi } from '../services/api';
import type { MotorFullHistoryDto } from '../types';
import toast from 'react-hot-toast';

export default function MotorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const motorId = parseInt(id || '0', 10);
    const [motorData, setMotorData] = useState<MotorFullHistoryDto | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Загружаем данные для отображения в модалке редактирования
    const loadMotorData = async () => {
        if (isNaN(motorId) || motorId <= 0) return;
        try {
            const data = await motorApi.getFullHistory(motorId);
            setMotorData(data);
        } catch {
            // ошибка будет обработана в MotorHistory
        }
    };

    useEffect(() => {
        loadMotorData();
    }, [motorId]);

    const handleDelete = async () => {
        if (!confirm('Удалить двигатель без возможности восстановления?')) return;
        try {
            await motorApi.deleteMotor(motorId);
            toast.success('Двигатель удалён');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

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
            <div className="flex justify-between items-center mb-6">
                <Link to="/" className="inline-flex items-center text-accent hover:text-accent-dark transition-colors group">
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Назад к списку
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-secondary inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Редактировать
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-secondary inline-flex items-center gap-1 text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                    </button>
                </div>
            </div>
            <MotorHistory motorId={motorId} onMotorUpdated={loadMotorData} />
            {motorData && (
                <EditMotorModal
                    motor={motorData}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        loadMotorData(); // обновить данные на странице после редактирования
                    }}
                />
            )}
        </div>
    );
}