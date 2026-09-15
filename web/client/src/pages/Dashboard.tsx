import { useState } from 'react';
import MotorList from '../components/MotorList';
import CreateMotorForm from '../components/CreateMotorForm';

/**
 * Главная страница (дашборд).
 * Содержит кнопку открытия формы создания двигателя и список двигателей с пагинацией.
 */
export default function Dashboard() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleMotorCreated = () => {
        // Обновляем список двигателей (MotorList перезагрузится при изменении key)
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            {/* Кнопка открытия формы регистрации */}
            <div className="flex justify-end animate-slide-down">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Новый двигатель
                </button>
            </div>

            {/* Список двигателей с возможностью обновления через key */}
            <div className="animate-fade-in">
                <MotorList key={refreshKey} />
            </div>

            {/* Модальное окно создания двигателя */}
            <CreateMotorForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleMotorCreated}
            />
        </div>
    );
}