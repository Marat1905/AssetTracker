import { useState } from 'react';
import toast from 'react-hot-toast';
import { motorApi } from '../../../services/motor/api';
import { MotorStatus } from '../../../types/motor/motor';
import { motorStatusLabels } from '../../../utils/motor/locales';

interface Props {
    /** Флаг видимости модального окна (только для модального режима) */
    isOpen?: boolean;
    /** Функция закрытия модального окна (только для модального режима) */
    onClose?: () => void;
    /** Инвентарный номер двигателя */
    motorId: number;
    /** Текущий статус двигателя (для отображения опции «Не менять») */
    currentStatus?: MotorStatus;
    /** Коллбэк после успешного перемещения */
    onMoved?: () => void;
}

/**
 * Форма перемещения двигателя.
 * Позволяет указать новое местоположение и опционально новый статус.
 * Может работать в двух режимах:
 * - как модальное окно (если переданы isOpen и onClose)
 * - как обычная форма на отдельной странице (если isOpen и onClose отсутствуют)
 *
 * В модальном режиме используется затемняющий фон и центрирование.
 * Полностью поддерживает светлую и тёмную тему.
 */
export default function MoveMotorForm({ isOpen, onClose, motorId, currentStatus, onMoved }: Props) {
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<MotorStatus | ''>(currentStatus || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return toast.error('Введите новое местоположение');

        setLoading(true);
        try {
            const payload: { newLocation: string; newStatus?: MotorStatus } = { newLocation: location };
            if (status && status !== currentStatus) {
                payload.newStatus = status;
            }
            await motorApi.moveMotor(motorId, payload);
            toast.success(status && status !== currentStatus ? 'Двигатель перемещён, статус обновлён' : 'Перемещение выполнено');
            setLocation('');
            onMoved?.();
            if (onClose) onClose(); // Закрываем модальное окно, если оно есть
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка перемещения');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = Object.entries(motorStatusLabels).map(([value, label]) => ({
        value: value as MotorStatus,
        label,
    }));

    // Рендер содержимого формы (компактная версия)
    const formContent = (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Новое местоположение
                </label>
                <input
                    type="text"
                    placeholder="Цех / агрегат / склад"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Новый статус (оставьте без изменений, если не нужен)
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MotorStatus || '')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                    <option value="">― Не менять ―</option>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Выполняется...
                        </span>
                    ) : 'Переместить'}
                </button>
            </div>
        </form>
    );

    // Если передан isOpen – работаем как модальное окно
    if (isOpen !== undefined) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Затемняющий фон (overlay) */}
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>

                {/* Модальное окно - адаптивная ширина, высота автоматическая */}
                <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Перемещение двигателя
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Укажите новое местоположение и, при необходимости, статус</p>
                    </div>
                    {formContent}
                </div>
            </div>
        );
    }

    // Иначе – режим отдельной страницы (без модального фона)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Перемещение двигателя
                </h2>
            </div>
            {formContent}
        </div>
    );
}