import { useState } from 'react';
import { motorApi } from '../services/api';
import type { LocationHistoryDto } from '../types';
import toast from 'react-hot-toast';

interface Props {
    /** Флаг видимости окна */
    isOpen: boolean;
    /** Инвентарный номер двигателя */
    motorId: number;
    /** Редактируемая запись истории перемещений */
    location: LocationHistoryDto;
    /** Функция закрытия */
    onClose: () => void;
    /** Коллбэк после успешного обновления */
    onSuccess: () => void;
}

/**
 * Модальное окно редактирования записи истории перемещений.
 * Разрешено редактировать только последнюю запись (активную или последнюю закрытую).
 */
export default function EditLocationModal({ isOpen, motorId, location, onClose, onSuccess }: Props) {
    const [newLocation, setNewLocation] = useState(location.location);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLocation.trim()) {
            toast.error('Местоположение не может быть пустым');
            return;
        }
        if (newLocation.trim() === location.location) {
            toast.error('Нет изменений');
            onClose();
            return;
        }
        setLoading(true);
        try {
            await motorApi.updateLocationHistory(motorId, location.id, { location: newLocation.trim() });
            toast.success('Запись перемещения обновлена');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-text-h">
                            Редактирование записи перемещения
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Дата: {new Date(location.startDate).toLocaleString('ru-RU')}
                            {location.endDate && ` – ${new Date(location.endDate).toLocaleString('ru-RU')}`}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Местоположение</label>
                            <input
                                type="text"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Отмена
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}