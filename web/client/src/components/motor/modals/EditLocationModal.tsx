import { useState } from 'react';
import { motorApi } from '../../../services/motor/api';
import type { LocationHistoryDto } from '../../../types/motor/motor';
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
 * Полностью поддерживает светлую и тёмную тему.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Затемняющий фон (overlay) */}
            <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
            </div>

            {/* Модальное окно */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Редактирование записи перемещения
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Дата: {new Date(location.startDate).toLocaleString('ru-RU')}
                        {location.endDate && ` – ${new Date(location.endDate).toLocaleString('ru-RU')}`}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Местоположение
                        </label>
                        <input
                            type="text"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}