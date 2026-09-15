import { useState } from 'react';
import { motorApi } from '../services/api';
import type { SetInventoryNumberDto } from '../types';
import toast from 'react-hot-toast';

interface Props {
    /** Флаг видимости окна */
    isOpen: boolean;
    /** Суррогатный идентификатор двигателя */
    motorId: number;
    /** Текущий инвентарный номер (для предзаполнения) */
    currentInventoryNumber: string | null;
    /** Функция закрытия */
    onClose: () => void;
    /** Коллбэк после успешного обновления */
    onSuccess: () => void;
}

/**
 * Модальное окно для установки или удаления инвентарного номера двигателя.
 */
export default function EditInventoryModal({ isOpen, motorId, currentInventoryNumber, onClose, onSuccess }: Props) {
    const [inventoryNumber, setInventoryNumber] = useState(currentInventoryNumber || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Пустая строка отправляется как null (удалить номер)
            const payload: SetInventoryNumberDto = {
                inventoryNumber: inventoryNumber.trim() === '' ? null : inventoryNumber.trim()
            };
            await motorApi.setInventoryNumber(motorId, payload);
            toast.success('Инвентарный номер обновлён');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка обновления инвентарного номера');
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
                            Изменить инвентарный номер
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Оставьте поле пустым, чтобы удалить номер.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="form-label">Инвентарный номер</label>
                            <input
                                type="text"
                                value={inventoryNumber}
                                onChange={(e) => setInventoryNumber(e.target.value)}
                                className="form-input"
                                placeholder="Например: 12345"
                            />
                            <p className="text-xs text-gray-500 mt-1">Должен быть уникальным, если указан</p>
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